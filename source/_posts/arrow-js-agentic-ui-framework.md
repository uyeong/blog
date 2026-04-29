---
title: "[AI가 쓴 글] ArrowJS는 왜 '에이전트 시대의 UI 프레임워크'를 자처할까"
description: ArrowJS는 빌드 스텝 없이 동작하는 초경량 반응형 UI 런타임이면서, AI가 생성한 UI 코드를 WebAssembly 샌드박스에서 분리 실행하는 기능까지 내세운다. 공식 사이트와 GitHub 저장소를 바탕으로 이 프로젝트의 정체성과 실사용 포인트를 정리했다.
date: 2026-04-13 15:05:00
category:
    - JavaScript
    - React
tags:
    - ArrowJS
    - UI Framework
    - Reactivity
    - AI
    - WebAssembly
cover: cover.jpg
comments: true
---

{% alert info '작성 방식 안내' %}
이 글은 생성형 AI를 활용해 초안을 작성했고, 저자가 사실관계와 표현을 검토하며 다듬은 글입니다.
{% endalert %}

UI 프레임워크를 소개할 때는 보통 반응성, 컴포넌트 모델, 생태계, 성능 같은 이야기를 먼저 꺼낸다. 그런데 ArrowJS는 스스로를 <strong>"The first UI framework for the agentic era"</strong>라고 소개한다. 단순히 가볍고 빠르다는 얘기만이 아니라, <strong>AI가 만들고 실행하는 UI를 염두에 두고 설계했다</strong>는 뜻이다.

이번 글에서는 ArrowJS 공식 사이트와 GitHub 저장소를 바탕으로, 이 프로젝트가 정확히 무엇이고 어디에 매력이 있는지 정리해보려 한다. 결론부터 말하면 ArrowJS는 <strong>빌드 스텝 없는 초경량 반응형 UI 런타임</strong>에 <strong>WASM 샌드박스</strong>라는 강한 개성을 더한 프로젝트다.

{% alert info '한 줄 요약' %}
ArrowJS의 핵심은 작고 단순한 반응형 UI 런타임 자체보다도, AI가 생성한 UI 코드를 어떻게 더 예측 가능하고 안전하게 실행할 것인가까지 함께 다룬다는 데 있다.
{% endalert %}

## ArrowJS를 한 줄로 보면

ArrowJS 공식 문서에서 강조하는 건 세 가지다.

- JavaScript/TypeScript 원시 도구 위에 구축된 반응형 UI 런타임
- 코어 API는 `reactive`, `html`, `component` 중심
- 코어 런타임은 빌드 스텝 없이도 사용할 수 있음

즉 ArrowJS는 프레임워크 고유 문법을 새로 배우게 하기보다, <strong>함수, 모듈, 템플릿 리터럴</strong> 위에서 UI를 구성하게 한다. JSX도 없고, 별도 템플릿 컴파일러도 없고, React compiler나 Vue template compiler 같은 계층도 없다.

공식 설명대로라면 코어 런타임은 5KB 미만이다. 그래서 ArrowJS는 "풀스택 프레임워크"가 아닌 <strong>아주 얇은 반응형 DOM 런타임</strong>으로 봐야 할 것 같다.

{% figure supporting.jpg '개발 환경 이미지' '그림 1. ArrowJS는 거대한 프레임워크 문법보다 자바스크립트 함수와 템플릿 리터럴 중심의 구성을 택한다' '900px' %}

## 개발 감각은 어떤 쪽에 가까운가

ArrowJS를 보면 완전히 새로운 무언가라기보다, 익숙한 몇 가지 흐름이 섞여 있다.

- 템플릿 리터럴 기반 렌더링은 lit 계열과 닮아 있고
- fine-grained reactivity 감각은 Solid 쪽을 떠올리게 하고
- DOM에 직접 가까운 태도는 오래된 소형 라이브러리들의 미덕을 갖고 있다.

다만 ArrowJS는 그걸 더 과감하게 줄였다. 상태는 <code>reactive()</code>로 만들고, DOM은 <code>html(...)</code>로 만들고, 컴포넌트는 <code>component()</code>로 감싼다. 공식 사이트도 "You only need 3 functions"라고 소개할 정도다.

예를 들면 템플릿에서 일반 값은 정적으로 렌더링되고, 함수로 감싸야 반응형이 된다.

{% codeblock lang:js %}
import { html, reactive } from '@arrow-js/core'

const state = reactive({ count: 0 })

html`<button @click="${() => state.count++}">
  Count ${() => state.count}
</button>`
{% endcodeblock %}

여기서 눈여겨 볼 건 <code>${state.count}</code>가 아니라 <code>${() => state.count}</code>라는 점이다. ArrowJS는 이 함수 안에서 읽힌 반응형 값을 추적해 그 부분만 업데이트한다.

이 방식은 명시적이라서 좋다. 대신 React처럼 "상태가 바뀌면 컴포넌트가 다시 렌더된다"는 모델에 익숙한 사람에게는 조금 낯설 수 있다.

## ArrowJS가 내세우는 진짜 차별점

솔직히 말하면, "작고 빠른 UI 라이브러리" 자체는 이제 따분하다. 이미 이런 방향의 도구는 여러 번 등장했다. ArrowJS가 여기서 눈에 띄는 이유는 <strong>에이전트 시대</strong>라는 포지셔닝 때문이다.

공식 사이트의 논리는 대략 이렇다.

- Arrow는 그냥 TypeScript 함수와 템플릿 리터럴 중심이라 AI가 이해하기 쉽고
- 프레임워크 고유 문법이 적어서 코드 생성 실수 여지가 줄고
- 문서량도 적어 에이전트 컨텍스트에 넣기 쉽다.

이건 약간 마케팅 문구처럼 들릴 수 있다. 그런데 완전히 허황된 얘기도 아니다. React는 JSX, hooks, 빌드 도구, 컴파일 단계, 관용 패턴까지 함께 이해해야 하고, Vue나 Svelte도 각자의 템플릿 규칙이 있다. 반면 ArrowJS는 상대적으로 표면적이 작다.

즉 ArrowJS는 "사람이 배우기 쉽다"보다도 <strong>코딩 에이전트가 생성하고 수정하기 쉬운 형태</strong>를 전면에 내세운 셈이다.

## 진짜 흥미로운 부분은 sandbox다

ArrowJS는 그냥 가벼운 UI 런타임에서 그치지 않는다. 이 프로젝트에서 가장 눈에 띄는 부분은 <code>@arrow-js/sandbox</code> 패키지다.

공식 문서 설명에 따르면 이 샌드박스는 다음 구조를 가진다.

- JS/TS/Arrow 코드를 QuickJS + WASM 기반 VM 안에서 실행
- 실제 DOM은 호스트 페이지가 계속 소유
- 샌드박스와 호스트는 직렬화된 메시지로만 통신
- 결과적으로 AI 생성 코드나 신뢰할 수 없는 UI 코드를 더 안전하게 실행 가능

이 구조는 꽤 중요하다. 보통 브라우저에서 동적 UI를 생성하면 결국 그 코드가 메인 window realm에서 실행되기 쉽다. 그런데 ArrowJS는 이 실행 계층을 분리하려고 한다.

쉽게 말하면 이런 식이다.

- 화면에 보이는 DOM은 브라우저가 관리
- UI 로직은 WASM 기반 VM에서 실행
- 양쪽은 필요한 데이터만 메시지로 주고받음

그래서 채팅 에이전트가 즉석에서 UI를 만들거나, 사용자 제공 UI 조각을 실행하거나, 내부 툴에서 AI가 위젯을 생성하는 상황과 꽤 잘 맞는다.

{% alert info '왜 이게 중요한가' %}
AI가 생성한 코드를 브라우저 메인 환경에서 그대로 실행하는 건 생각보다 부담이 크다. ArrowJS sandbox는 "렌더링은 실제 DOM에 하되, 실행은 격리된 VM에서"라는 구조를 제공해서 그 부담을 줄이려는 시도로 읽힌다.
{% endalert %}

## 패키지 구조도 이 방향을 잘 보여준다

GitHub 저장소를 보면 ArrowJS는 모노레포 구조로 나뉘어 있다.

- `@arrow-js/core`: 반응형 상태, 템플릿 렌더링, 컴포넌트
- `@arrow-js/framework`: async component runtime, boundary, render helper
- `@arrow-js/ssr`: 서버 렌더링
- `@arrow-js/hydrate`: hydration
- `@arrow-js/sandbox`: QuickJS/WASM 기반 샌드박스
- `@arrow-js/vite-plugin-arrow`: Vite 통합

이 구성은 코어를 아주 얇게 유지하고, 필요한 기능을 위에 얹는 구조다. 즉 기본 철학은 계속 일관된다. <strong>코어는 작고 직접적이어야 하고, 무거운 기능은 선택적으로 붙여야 한다</strong>는 쪽이다.

## 장점은 꽤 분명하다

### 1) 시작 비용이 낮다

코어만 보면 정말 단순하다. 빌드 없이도 브라우저에서 바로 import해서 쓸 수 있고, API surface도 작다. 문서도 짧은 편이라 훑어보는 부담이 적다.

### 2) 동작이 비교적 예측 가능하다

DOM과 가까운 구조라서 "무슨 추상화가 중간에서 뭘 하고 있는지"가 덜 숨겨져 있다. React처럼 렌더 사이클, hook 규칙, memoization, compiler 최적화까지 한 번에 생각해야 하는 부담이 적다.

### 3) AI 코드 생성과의 궁합을 노리고 있다

이건 ArrowJS의 정체성과 가장 잘 맞는 장점이다. 함수 기반 구조, 적은 API, 적은 전용 문법, 샌드박스까지 합치면 에이전트 생성 UI 실험에는 꽤 매력적이다.

## 물론 한계도 분명하다

### 1) 메인스트림 생태계는 아직 약하다

React/Vue/Svelte처럼 수많은 라이브러리, 커뮤니티 패턴, 회사 단위 채택 사례가 쌓인 상태는 아니다. 그래서 팀 표준으로 바로 가져가기엔 아직 검증량이 부족하다.

### 2) 반응형 슬롯 규칙이 처음엔 헷갈릴 수 있다

`${value}`와 `${() => value}`의 차이가 단순해 보이지만, 실제로는 여기서 실수가 날 수 있다. 명시성의 대가라고 봐야 한다.

### 3) 대규모 제품이라면 더 지켜봐야 한다

ArrowJS는 분명 흥미롭지만, 현재로서는 대규모 메인 제품 프런트엔드의 기본 선택지라기보다, <strong>특정 문제에 아주 잘 맞는 도구</strong>에 더 가깝다.

## 그래서 어디에 어울릴까

내 기준에는 이런 경우에 특히 잘 맞아 보인다.

- 작고 빠른 위젯 UI
- 문서/대시보드의 인터랙션 레이어
- 사내 툴
- AI가 미니 UI를 생성하는 프로토타입
- 신뢰하기 어려운 UI 코드 실행 환경
- 에디터/챗 인터페이스 안의 인라인 앱

반대로 React 생태계에 크게 기대고 있는 서비스나, 조직 전체가 이미 특정 프레임워크 패턴에 익숙한 경우에는 ArrowJS를 메인 선택지로 가져가는 게 아직은 이르다.

## 마무리

ArrowJS를 단순히 "또 가벼운 프레임워크?" 정도로 여기기엔 아깝다. 이 프로젝트가 흥미로운 이유는, 작은 반응형 UI 런타임이라는 출발점 위에 <strong>AI가 생성한 코드를 어떻게 안전하고 단순하게 실행할 것인가</strong>라는 질문을 붙였기 때문이다.

그래서 ArrowJS를 볼 때는 React의 경쟁자냐 아니냐보다는, <strong>에이전트가 만드는 UI를 위한 실행 모델</strong>을 어떻게 설계하고 있는지 쪽이 더 중요해 보인다. 적어도 지금 시점에서는, 그 문제를 정면으로 다루는 프런트엔드 프로젝트라는 점만으로도 충분히 기억할 만하다.

## 참고 링크

- <a href="https://arrow-js.com/" target="_blank" rel="noopener">ArrowJS 공식 사이트</a>
- <a href="https://github.com/standardagents/arrow-js" target="_blank" rel="noopener">ArrowJS GitHub 저장소</a>
- <a href="https://arrow-js.com/api" target="_blank" rel="noopener">ArrowJS API Reference</a>
- <a href="https://arrow-js.com/play/" target="_blank" rel="noopener">ArrowJS Playground</a>

### 이미지 출처

- 커버 이미지: [Unsplash](https://unsplash.com/photos/person-using-macbook-pro-on-brown-wooden-table-SYTO3xs06fU) — Photo by Ilya Pavlov
- 본문 이미지: [Unsplash](https://unsplash.com/photos/person-holding-black-and-red-click-pen-while-using-black-laptop-computer-1555066931-4365d14bab8c) — Photo by ThisisEngineering
