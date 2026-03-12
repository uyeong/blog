---
title: Chrome 146 릴리스 노트, 실무에서 바로 볼 포인트 7가지
description: Chrome 146 릴리스 노트를 기준으로 CSS, PWA, WebGPU, 성능, 보안 변경사항 중 실무 영향이 큰 항목을 골라 정리했다.
date: 2026-03-12
category:
    - Development
    - JavaScript
tags:
    - Chrome
    - Release-Note
    - WebGPU
    - Performance
    - Security
cover: cover.jpg
comments: true
published: true
---

Chrome 146에서 변경된 내용은 많지만 실무 관점에서 전부 살펴 볼 필요는 없다. 이번 글에서는 릴리스 노트에서 실제 제품 코드에 영향을 주기 쉬운 변경 내용만 추려서 정리해보고자 한다.

간단히 이번 버전 변경은 다음 세 항목으로 요약할 수 있다.

- CSS 애니메이션과 접근성 관련 선언형 기능 보강
- WebGPU/PWA처럼 앱 성격이 강한 웹 기능의 운영 개선
- LCP, Sanitizer API처럼 성능/보안 지표와 직접 맞닿는 변화

## 핵심 요약 (빠르게 보기)

1. <strong>Scroll-triggered animations</strong>: 스크롤 위치 기반 애니메이션 트리거를 CSS 중심으로 작성 가능해졌다.
2. <strong>trigger-scope</strong>: 애니메이션 트리거 이름 충돌을 스코프 단위로 제어할 수 있다.
3. <strong>meta name="text-scale"</strong>: OS/브라우저 텍스트 스케일과의 연동 방식이 더 명확해졌다.
4. <strong>PWA LaunchParams 개선</strong>: 파일 실행 시 `targetURL`이 안정적으로 전달되고, reload 시 launchQueue 중복 전달이 방지된다.
5. <strong>WebGPU 확장</strong>: transient attachment, compatibility mode 등으로 적용 범위가 넓어졌다.
6. <strong>LCP candidate 동작 조정</strong>: "painted image" 기준으로 후보 방출 방식이 바뀌었다.
7. <strong>Sanitizer API</strong>: 사용자 입력 HTML을 안전하게 정제하는 API가 안정 채널에 포함됐다.

## 실무 영향이 큰 변경 7가지

### 1) Scroll-triggered animations: JS 의존도를 낮출 수 있다

그동안 스크롤 진입 애니메이션은 `IntersectionObserver` + class 토글로 처리하는 경우가 많았다. 146에서 소개된 scroll-position 기반 트리거는 이 패턴 일부를 CSS 선언으로 대체할 수 있게 한다.

의미는 단순하다. "스크롤 위치를 감지해서 애니메이션을 시작/정지"하는 로직을 자바스크립트 이벤트 핸들러가 아니라 CSS 선언으로 옮길 수 있다는 뜻이다. 복잡한 인터랙션이 아니라면 유지보수 포인트가 줄어든다.

### 2) trigger-scope: 대규모 프로젝트에서 네이밍 충돌을 줄인다

여러 컴포넌트가 동일 페이지에서 애니메이션 트리거 이름을 공유하면, 의도치 않은 충돌이 생길 수 있다. `trigger-scope`는 이 범위를 제한해서 충돌 위험을 낮춘다.

"애니메이션 네임스페이스 관리"를 문서 규칙에만 의존하지 않아도 되기 때문에 디자인 시스템이나 마이크로 프론트엔드 구조에서는 매우 유용한 변경이다.

### 3) text-scale 메타: 접근성 대응 방식이 더 명확해졌다

`meta name="text-scale"`은 OS/브라우저 텍스트 스케일을 더 일관되게 반영할 수 있게 돕는다. 만일 rem/em 중심으로 잘 만든 페이지라면 사용자 선호 폰트 크기와 맞물려 자연스럽게 확장되도록 유도한다.

접근성을 신경쓰고 있었다면 새 동작을 꼭 확인해보자. 기존 zoom/autosizing 전제와 실제 렌더 결과가 달라질 수 있다.

### 4) PWA Launch Handler: 파일 실행 흐름이 안정화됐다

두 가지 수정이 특히 중요하다.

- 파일 핸들링으로 PWA가 열릴 때 `LaunchParams.targetURL`을 더 일관되게 전달
- 새로고침(reload) 시 기존 launchQueue가 다시 재전달되던 동작 방지

PWA 데스크톱 앱 경험에서 "같은 파일이 다시 열린 것처럼 보이는 문제"를 겪었다면 이 변경이 직접적인 개선으로 이어질 수 있다.

{% alert info '무슨 문제였나?' %}
예를 들어 파일 연결로 PWA를 열었을 때 `launchQueue`로 전달된 파일 핸들을 앱이 처리한 뒤 페이지를 새로고침하면, 기존에는 같은 `LaunchParams`가 다시 전달되는 경우가 있었다. 그 결과 사용자는 파일을 다시 열지 않았는데도 같은 문서가 한 번 더 로드되거나, "최근 파일" 목록에 중복 항목이 생기는 현상을 겪을 수 있었다. Chrome 146에서는 이 동작을 "새 실행"이 아니라 일반 reload로 다루도록 바꿔서 중복 처리 가능성을 줄였다.
{% endalert %}

### 5) WebGPU: 성능과 디바이스 커버리지 둘 다 확장

146의 WebGPU 관련 변경으로는 단순 문법 추가를 넘어 적용 범위를 넓혔다.

- <strong>Transient attachments</strong>: 타일 메모리 활용으로 VRAM 트래픽/할당 부담을 줄일 여지
- <strong>Compatibility mode</strong>: 구형 그래픽 API(OpenGL, D3D11) 환경까지 일부 확장
- WGSL `texture_and_sampler_let`: 코드 표현력 개선

게임/시각화/3D 툴 같은 워크로드라면 "성능 최적화"와 "지원 디바이스 범위"를 같이 점검할 타이밍이다.

### 6) LCP 후보 기록 규칙 변경: 모니터링 해석을 재점검해야 한다

LCP candidate가 "largest pending image" 영향에서 벗어나, 실제로 페인트된 요소 기준으로 더 자주 중간 후보가 기록될 수 있게 바뀌었다.

{% alert info 'LCP 후보 기록이란?' %}
LCP는 페이지가 로딩되는 동안 "지금까지 가장 큰 콘텐츠"가 바뀔 때마다 후보를 남긴다. 예를 들어 작은 텍스트가 먼저 보였다가, 더 큰 이미지가 나중에 보이면 후보가 갱신된다. Chrome 146에서는 아직 로딩 중인 큰 이미지를 기준으로 후보 기록을 늦추기보다, 실제로 화면에 그려진 요소를 기준으로 후보를 더 자주 기록해 로딩 진행 과정을 더 잘 보이게 한다.
{% endalert %}

즉, RUM 대시보드에서 candidate 이벤트 흐름을 후처리해 쓰고 있었다면 기존 해석 로직이 그대로 맞지 않을 수 있다. 특히 "중간 후보 수 증가"를 성능 악화로 오해하지 않도록 대시보드 설명을 손봐두는 편이 안전하다.

### 7) Sanitizer API: HTML 입력 처리 전략을 단순화할 기회

사용자 입력 HTML 정제는 XSS 방어의 핵심인데, 그동안은 라이브러리 의존이 사실상 기본이었다. Sanitizer API는 브라우저 차원의 표준 API로 이 문제를 다루려는 방향이다.

바로 기존 라이브러리를 걷어내기보다는, 다음 순서로 접근하는 편이 현실적이다.

1. 현재 sanitize 정책(허용 태그/속성) 문서화
2. Sanitizer API 동작과 정책 차이 비교
3. 특정 경로(예: 코멘트/리치 텍스트 미리보기)부터 점진 도입

이전에 정리한 [Firefox 148의 Sanitizer API: innerHTML 대체를 진짜로 고민할 시점](/blog/2026/03/11/sanitizer-api-firefox-148/) 글을 통해서도 관련 정보를 찾아볼 수 있다. 함께 보면 브라우저 간 흐름을 파악하는 데 도움을 줄 수 있으니 참고한다.

## 적용할 때 주의할 점

새 기능이 많을수록 "지원 여부"보다 "운영 전제가 바뀌는지"를 먼저 봐야 한다.

- 성능: LCP 수집 파이프라인이 후보 증가를 어떻게 처리하는지
- 접근성: text scale 변경이 레이아웃 파손 없이 동작하는지
- PWA: launchQueue 관련 회귀(regression)가 사라졌는지
- 보안: Sanitizer API 도입 시 기존 정책과 충돌 없는지

릴리스 노트의 가치는 기능 목록 자체보다, 현재 서비스 구조와 어디서 충돌하는지를 빨리 찾는 데 있다.

## 마무리

Chrome 146은 “새 API 몇 개 추가”로만 보기엔 아깝다. CSS 선언형 인터랙션, PWA 실행 안정성, WebGPU 확장, 성능/보안 지표까지 실제 운영에 영향을 주는 변화가 고르게 들어가 있다.

실무에서는 욕심내서 전부 도입하기보다, 현재 제품에서 영향이 큰 축 한두 개만 먼저 골라 검증해보자.

## 참고 링크

- [Chrome 146 Release Notes](https://developer.chrome.com/release-notes/146)
- [Scroll-triggered animations (Spec)](https://drafts.csswg.org/css-animations-2/#timeline-triggers)
- [WebGPU Compatibility mode proposal](https://github.com/gpuweb/gpuweb/blob/main/proposals/compatibility-mode.md)
- [Largest Contentful Paint spec PR](https://github.com/w3c/largest-contentful-paint/pull/154)
- [Sanitizer API Spec](https://wicg.github.io/sanitizer-api/)

### 이미지 출처

- 커버: [Photo by Pixabay on Pexels](https://www.pexels.com/photo/black-and-gray-laptop-computer-546819/)
