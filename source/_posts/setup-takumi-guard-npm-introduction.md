---
title: "npm 설치 앞에 경비원을 세우는 법: setup-takumi-guard-npm 살펴보기"
description: setup-takumi-guard-npm은 GitHub Actions의 npm 설치 경로를 Takumi Guard 프록시로 연결해 악성 패키지를 설치 전에 차단한다. 이 글에서는 왜 이 방식이 실무에서 유효한지, 어디까지 해결하고 어디서부터는 별도 대응이 필요한지 핵심만 정리한다.
date: 2026-03-11
category:
    - Security
    - Node.js
tags:
    - npm
    - GitHub Actions
    - OIDC
    - Security
    - Supply Chain Security
cover: cover.png
---

`npm install`은 단순히 "패키지 내려받기"로 느껴지지만, 실제로는 <strong>외부 코드를 우리 CI 환경에 들여오는 첫 단계</strong>다.  
그리고 이 단계는 테스트보다 먼저 실행된다. 그래서 악성 패키지가 섞여 있으면 검사 전에 설치 단계에서 문제가 발생할 수 있다.

관련하여 오늘은 [setup-takumi-guard-npm](https://github.com/flatt-security/setup-takumi-guard-npm)를 소개하고자 한다.  
이 프로젝트는 화려한 보안 엔진이라기보다, GitHub Actions의 설치 경로를 Takumi Guard로 연결해주는 <strong>얇고 실용적인 어댑터(adapter)</strong>에 가깝다.

{% figure branding.png 'Takumi Guard 공식 브랜딩 이미지' '그림 1. npm 설치 앞단에 경비원을 두는 접근' '720px' %}

{% alert info 핵심 요약 %}
- 이 액션은 새 보안 엔진이라기보다, Takumi Guard를 CI 설치 흐름에 붙여주는 연결 레이어에 가깝다.
- 핵심은 "설치한 뒤 검사"가 아니라 "설치 전에 막기"다.
- 인증은 OIDC를 쓰기 때문에, 장기 토큰을 배포·보관하는 부담을 줄일 수 있다.
{% endalert %}

## 이 프로젝트는 정확히 무엇을 하나

한 줄로 줄이면 이렇다.

- GitHub Actions에서 동작한다.
- `npm`, `pnpm`, `yarn` 설치 요청을 `https://npm.flatt.tech`로 보낸다.
- 프록시 앞단에서 Takumi Guard가 악성 패키지를 판단하고, 위험하면 `403`으로 막는다.

즉, 이 프로젝트, 그러니까 이 액션의 목표는 직접 악성코드를 분석하는 것이 아니다.  
Takumi Guard의 분석/차단 기능을 CI 설치 경로에 배치하는 것이다.

README가 강조하는 "two lines of YAML"도 같은 맥락이다. 복잡한 에이전트 설치 없이, 워크플로우에서 연결 비용을 최소화한다.

{% codeblock lang:yaml %}
steps:
  - uses: actions/checkout@v4
  - uses: flatt-security/setup-takumi-guard-npm@v1
  - run: npm install
  - run: npm test
{% endcodeblock %}

## 왜 이 접근이 실무적으로 중요한가

### 1) 설치 단계는 생각보다 위험하다

CI 보안 도구는 자주 "설치 이후"에 붙는다. 하지만 공급망 공격은 설치 스크립트(`preinstall`, `install`, `postinstall`)에서 이미 시작될 수 있다.  
그러니까 스캐너를 뒤에 두는 것만으로는 타이밍이 늦다.

setup-takumi-guard-npm은 이 지점을 정확히 지목하여 앱 코드를 바꾸기보다, 설치가 지나가는 길목 자체를 통제점(control point)으로 바꾼다.

### 2) 보안을 켜는데 운영 복잡도가 낮다

보안 도입이 실패하는 가장 흔한 이유는 "효과"보다 "귀찮음"이다.  
토큰 배포, 권한 관리, 워크플로우 수정이 과하면 팀은 결국 포기하게 된다.

이 액션은 그 마찰을 줄이려고 설계됐다.

- 익명 모드로 빠르게 시작 가능
- `bot-id`를 붙이면 감사 로그/조직 가시성 확장
- GitHub OIDC 인증으로 장기 시크릿 의존도 감소

쉽게 말해, <strong>문단속을 강화하면서 열쇠 관리 지옥은 피하려는 구조</strong>다.

### 3) 차단에서 끝내지 않고 사후 추적까지 연결한다

인증 흐름에서는 설치 이력 기반 추적과 breach notification까지 연결된다.  
보안은 "지금 막았는가"도 중요하지만, "예전에 넣은 것 중 뭐가 뒤늦게 문제 됐는가"도 똑같이 중요하다.

이 지점이 단발성 차단이 아니라 운영 루프를 만들기 때문에 setup-takumi-guard-npm의 실무적 가치가 있다.

## 내부 동작은 의외로 단순하다

`action.yml` 기준으로 보면 동작은 깔끔하다.

1. `.npmrc`에 registry를 `https://npm.flatt.tech/`로 설정
2. `bot-id`가 있으면 GitHub OIDC 토큰 요청
3. STS와 교환해 short-lived access token 발급
4. 토큰을 `.npmrc`에 주입해 인증 설치 경로 구성

무게중심은 액션 코드가 아니라 서버 측(Takumi Guard)에 있다.  
이 분리는 합리적이다. GitHub Action은 "연결"에 집중하고, 위협 인텔리전스는 서버에서 빠르게 갱신하는 편이 운영상 더 유리하다.

{% alert info 핵심 관점 %}
이 저장소를 "npm 스캐너"로 보면 초점이 흐려진다.  
더 정확히는 "GitHub Actions에서 설치 경로를 선제 차단 체계로 전환하는 온보딩 레이어"로 보는 편이 맞다.
{% endalert %}

## 마무리

setup-takumi-guard-npm은 거대한 보안 플랫폼이 아니라, <strong>작지만 정확한 레버리지</strong>다.

- 설치 전 차단(prevention)
- OIDC 기반 인증으로 시크릿 부담 완화
- 낮은 도입 마찰 + 점진적 확장

결국 이 프로젝트가 던지는 메시지는 단순하다.  
"공급망 보안은 보고서 단계가 아니라, 설치 버튼이 눌리는 순간에 시작해야 한다."  
이 관점을 팀 워크플로우에 자연스럽게 심는 데, 이 액션은 꽤 실용적인 선택지다.

## 참고 링크

- [setup-takumi-guard-npm 저장소](https://github.com/flatt-security/setup-takumi-guard-npm)
- [Takumi Guard 공식 소개](https://shisho.dev/docs/t/guard/)
- [npm Quickstart](https://shisho.dev/docs/t/guard/quickstart/npm)
- [Package Blocking](https://shisho.dev/docs/t/guard/features/package-blocking)
- [Breach Notifications](https://shisho.dev/docs/t/guard/features/breach-notifications)
- [CI Integration & OIDC Authentication](https://shisho.dev/docs/t/guard/architecture/oidc)
- [Intelligence](https://shisho.dev/docs/t/guard/architecture/intelligence)
- [Takumi Guard 제공 시작 릴리스 노트](https://shisho.dev/docs/r/202603-takumi-guard)
