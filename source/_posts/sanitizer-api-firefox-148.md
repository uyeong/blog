---
title: "Firefox 148의 Sanitizer API: innerHTML 대체를 진짜로 고민할 시점"
description: Firefox 148에서 표준 Sanitizer API(setHTML)가 먼저 탑재됐다. 이 글은 Mozilla 발표와 MDN, web.dev, Trusted Types 자료를 함께 읽고 setHTML의 핵심 개념, innerHTML 대비 차이, 실무 도입 포인트를 정리한다.
date: 2026-03-11
category:
    - Browser
tags:
    - JavaScript
    - Security
    - XSS
    - Firefox
    - Sanitizer API
cover: firefox-logo.svg
---

프런트엔드에서 XSS는 늘 "위험하다"고 말하지만, 막상 코드에는 `innerHTML`이 계속 남아 있는 경우가 많다. 이유는 단순하다. 위험한 건 아는데, 기존 동작을 깨지 않으면서 안전하게 바꾸는 방법이 애매하기 때문이다. Firefox 148에 Sanitizer API가 탑재됐다는 소식이 의미 있는 이유도 바로 여기에 있다.

관련해 이번에는 Mozilla 발표 글을 시작점으로, MDN의 `setHTML()` 문서, HTML Sanitizer API 문서, Trusted Types 문서, web.dev 자료까지 묶어서 핵심만 정리해보겠다.

{% alert info '한 줄 요약' %}
Sanitizer API의 핵심은 "문자열을 DOM에 넣는 행위" 자체를 safer default로 바꾸는 데 있다. 즉, 보안 검수 후에 대응하는 게 아니라 개발자가 평소 쓰는 API 선택만으로 XSS 위험을 줄이는 방향이다.
{% endalert %}

## 왜 `innerHTML`에서 자꾸 사고가 나는가

문제는 개발자의 부주의에 의해서만 생기지 않는다. `innerHTML`은 입력 문자열을 HTML로 해석하는 순간 강력한 주입 지점(injection sink)이 되므로 사용자 입력, 댓글, 마크다운 렌더 결과, 외부 API 응답 등 어느 한 군데라도 필터링이 어긋날 때 XSS가 발생할 수 있다.

Mozilla 글에서도 이 지점을 분명히 짚는다. 공격자가 HTML/JS를 주입할 수 있으면 사용자 상호작용 감시, 데이터 탈취 같은 문제가 장기간 반복될 수 있고, XSS(CWE-79) 취약점은 여전히 상위권이다.

## `setHTML()`이 바꾸는 핵심

`Element.setHTML()`은 "문자열 HTML 삽입"과 "sanitization"을 한 흐름으로 묶어 제공한다. 쉽게 말해, 개발자가 별도 라이브러리로 문자열을 먼저 정제하고 다시 넣는 대신, API 레벨에서 안전한 기본 방식을 제공한다.

MDN 기준으로 안전 메서드 계열은 다음과 같다.

- `Element.setHTML()`
- `ShadowRoot.setHTML()`
- `Document.parseHTML()`

그리고 unsafe 계열(`setHTMLUnsafe` 등)도 분리되어 있어, 위험을 감수해야 하는 케이스를 코드 레벨에서 명시적으로 드러낼 수 있다.

{% figure mozilla-hacks.jpg 'Mozilla Hacks' '그림 1. Firefox 148 발표와 함께 Sanitizer API를 safer default로 제시한 Mozilla Hacks' '900px' %}

## 실무에서 중요한 차이: `innerHTML` vs `setHTML`

둘 다 "HTML을 넣는다"는 점은 같지만, 기본 철학이 다르다.

### `innerHTML`
- 빠르고 익숙하지만 입력 신뢰성 검증을 개발자가 책임져야 한다.
- 정책/필터가 분산되기 쉬워서 팀 규모가 커질수록 누수 위험이 커진다.

### `setHTML`
- 안전 메서드에서는 XSS-unsafe 요소/속성을 강제로 제거한다.
- 필요한 경우 `Sanitizer`/`SanitizerConfig`로 허용/제거 규칙을 커스터마이징할 수 있다.
- 컨텍스트 인지 파싱을 하므로, 대상 요소 맥락에 맞지 않는 태그를 추가로 드롭한다.

{% alert info '컨텍스트 인지 파싱이란?' %}
같은 태그라도 어디에 삽입하느냐에 따라 유효성이 달라진다. 예를 들어 `<col>`은 `<table>` 맥락에서는 의미가 있지만 일반 `<div>` 안에서는 허용되지 않는다. `setHTML()`은 이런 문맥을 고려해 현재 대상 요소에서 성립하지 않는 태그를 추가로 제거한다.
{% endalert %}

예를 들어 아래 코드는 이벤트 핸들러 같은 위험 속성이 제거된 결과를 DOM에 넣게 된다.

{% codeblock lang:js %}
const input = `<h1>Hello <img src="x" onclick="alert(1)"></h1>`;
document.body.setHTML(input);
{% endcodeblock %}

## Trusted Types와 관계는 어떻게 보나

여기서 헷갈리기 쉬운 포인트가 Trusted Types 와의 관계다. 간단히 말해 Trusted Types는 "어떤 입력이 sink로 들어가도 사전에 정책을 거치게 강제"하는 프레임워크이고, Sanitizer API는 "HTML 삽입 자체의 안전 기본값"이다.

MDN 설명대로 safe sanitization 메서드는 자체적으로 unsafe 엔티티를 제거하므로 Trusted Types가 필수 전제는 아니다. 반대로 unsafe 메서드나 레거시 sink(`innerHTML`, `document.write` 등)를 다뤄야 할 때는 Trusted Types 정책 강제가 큰 힘을 발휘한다.

즉 둘은 경쟁이라기보다 계층이 다르다.

- Sanitizer API: 안전 삽입 기본값
- Trusted Types: 주입 지점 전체의 조직적 통제

Mozilla도 같은 맥락으로, `setHTML` 도입 후 Trusted Types enforcement를 붙이면 XSS 회귀(regression) 방어가 더 쉬워진다고 설명한다.

{% alert info '도입 관점 팁' %}
신규 코드에서는 `innerHTML` 대신 `setHTML`을 기본 선택지로 두고, 레거시 구간은 Trusted Types 리포트 모드(CSP)로 sink 사용 현황을 먼저 수집한 뒤 순차적으로 치환하는 방식이 현실적이다.
{% endalert %}

## 도입 순서(실무용)

{% figure checklist.jpg '체크리스트 이미지' '그림 2. 단계적 전환은 체크리스트 기반으로 작은 치환부터 시작하는 게 안전하다' '760px' %}

1. 문자열 HTML 삽입 지점 탐색 (`innerHTML`, `insertAdjacentHTML`, `outerHTML`)
2. 치환 가능한 구간부터 `setHTML()`로 교체
3. 커스텀 규칙이 필요한 화면만 `Sanitizer` 구성 사용
4. 회귀 테스트(렌더 결과 + 이벤트 동작) 추가
5. Trusted Types 정책/강제(CSP)로 레거시 sink를 단계적으로 봉쇄

핵심은 "보안을 위해 코드 전부를 갈아엎는" 접근이 아니라, 삽입 API 선택을 바꾸면서 위험 구간을 점진적으로 줄이는 데 있다.

## 정리

Firefox 148의 Sanitizer API 탑재는 단순 브라우저 기능 추가를 넘어, 프런트엔드 보안 실무에서 safer default를 표준 API로 끌어올린 변화로 볼 수 있다. XSS는 원칙을 몰라서가 아니라 관성이 바뀌지 않아 반복되는 경우가 많으니, 이번 기회에 `innerHTML` 대신 `setHTML`을 기본 선택지로 삼는 작업을 팀 규칙으로 잡아두는 게 좋다.

## 참고 링크

- [Mozilla Hacks: Goodbye innerHTML, Hello setHTML (Firefox 148)](https://hacks.mozilla.org/2026/02/goodbye-innerhtml-hello-sethtml-stronger-xss-protection-in-firefox-148/)
- [MDN: Element.setHTML()](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)
- [MDN: HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
- [MDN: Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)
- [web.dev: Safe DOM manipulation with the Sanitizer API](https://web.dev/articles/sanitizer)

### 이미지 출처

- 커버: [Firefox logo (2019)](https://commons.wikimedia.org/wiki/File:Firefox_logo,_2019.svg) — Mozilla, MPL 2.0
- 본문: [Mozilla Hacks 기본 메타 이미지](https://hacks.mozilla.org/wp-content/themes/Hax/img/hacks-meta-image.jpg)
- 본문(도입 순서 섹션): [check!](https://www.flickr.com/photos/98755122@N00/310003506) — © Graham Ballantyne, CC BY-NC-ND 2.0
