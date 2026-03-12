---
title: "Temporal Stage 4 확정: ES2026에서 Date를 대체하는 방법"
description: Temporal이 Stage 4에 도달하면서 ES2026 포함이 사실상 확정됐다. Date의 구조적 한계를 짚고 Temporal 타입별 실무 적용 전략을 정리한다.
date: 2026-03-12 16:10:00
category:
    - JavaScript
    - Browser
tags:
    - JavaScript
    - Temporal
    - ECMAScript
    - Date
    - TC39
cover: cover.jpg
comments: true
published: true
---

Temporal이 드디어 Stage 4에 도달했다. 새로운 API 하나가 추가됐다는 의미를 넘어 JavaScript에서 30년 넘게 쓰던 `Date`의 구조적 한계를 표준 레벨에서 바로잡는 계기가 됐다.

이번 글에서는 Bloomberg가 공개한 글을 시작점으로, TC39 문서/Temporal 공식 문서까지 함께 읽고 다음을 정리해본다.

- 왜 `Date`가 문제였는지
- Temporal이 어떤 설계 원칙으로 문제를 풀었는지
- 타입을 어떻게 골라야 하는지
- 지금 코드베이스에서 어디부터 바꿔야 하는지

## 한 줄 결론부터

Temporal은 "Date 대체 후보"라기보다, <strong>시간 데이터를 용도에 맞게 나눠 다루는 표준 API 모음</strong>에 가깝다.

- 저장/전송 기준 시각은 `Temporal.Instant`
- 사용자 지역 시간 계산은 `Temporal.ZonedDateTime`
- 생일/영업일/매일 9시 같은 일정 기준 시간은 `Temporal.Plain*`

구분대로 기능을 잘 활용하면 DST 버그, 파싱 모호성, 가변 객체로 인한 부작용 같은 고질적인 이슈를 줄일 수 있다.

## Stage 4의 의미: 표준 확정

TC39 프로세스에서 Stage 4는 제안이 최종 표준에 포함되는 단계다. `tc39/proposals`의 Finished Proposals에도 Temporal이 올라와 있고, ES2026 publication year로 표기되어 있다.

다만 문서별 반영 시점 차이는 있다. 예를 들어 `tc39/proposal-temporal` 저장소 일부 설명은 Stage 3 문구를 아직 포함하고 있을 수 있다. 이런 차이는 저장소 업데이트 타이밍 문제라, 실제 상태는 Finished Proposals와 구현/출시 현황을 기준으로 보는 편이 정확하다.

{% alert info '문서 읽을 때 헷갈리는 포인트' %}
Stage 상태는 단일 페이지만 보면 엇갈려 보일 수 있는데, 이럴 때는 `tc39/proposals`의 Finished Proposals와 엔진 출시 노트(Chrome/Firefox 등)를 교차 확인하는 게 가장 안전하다.
{% endalert %}

## 왜 Date는 계속 문제였을까

Bloomberg 글이 잘 짚은 대로, `Date`의 문제는 "사용법 미숙"보다 "설계 제약"으로 인해 발생한다.

### 1) Mutable 모델

`setMonth`, `setDate` 같은 메서드가 원본을 직접 바꾸기 때문에, 헬퍼 함수 하나 잘못 만들면 상위 로직까지 부작용이 전염된다.

### 2) 달/월 계산의 함정

월 더하기 같은 달력 연산에서 overflow가 조용히 다음 달로 넘어가며 의도와 다른 결과를 만들기 쉽다.

### 3) 파싱 모호성

"ISO와 비슷하지만 완전히 같진 않은 문자열"을 엔진별로 다르게 해석하던 역사가 길다. 예를 들어 브라우저, Node.js, 테스트 런타임이 혼재된 환경에서는 같은 입력이 다르게 파싱돼 재현이 어려운 버그가 생길 수 있다.

### 4) 타임존/DST가 외부 의존

정확한 시간 계산을 하려면 결국 별도 라이브러리와 IANA 데이터를 의존해야 하고 결국 번들/운영 복잡도가 올라간다.

## Temporal 설계 핵심: 타입을 나눠서 의미를 고정한다

Temporal의 본질은 "하나의 Date 타입으로 모든 걸 처리"하는 방식을 버린 데 있다. 목적에 맞는 타입을 먼저 고르고, 그 타입이 허용하는 연산만 하면 된다.

{% figure types-map.svg 'Temporal 타입 선택 가이드' 'Temporal 타입 선택 가이드' %}

### `Temporal.Instant`

- UTC 기준 절대 시각
- 저장/이벤트 로그/서버 간 교환에 유리
- 나노초 정밀도 지원

### `Temporal.ZonedDateTime`

- 절대 시각 + 타임존 + 캘린더
- DST 경계 연산 안전성이 중요할 때 기본 선택지

### `Temporal.PlainDate`, `PlainTime`, `PlainDateTime`

- 타임존 없는 wall time
- 생일, 매월 결제일, "매일 09:00" 같은 도메인 값에 적합

### `Temporal.Duration`

- 시점 간 차이나 연산 단위를 명시적으로 표현
- `total()` 같은 API로 단위 변환이 명확함

## 지금 코드에서 어디부터 바꾸면 좋을까

"전면 교체"부터 시작하면 실패할 확률이 높다. 대신 장애나 오류가 자주 나는 경로부터 범위를 좁혀 바꾸는 편이 낫다.

### 1단계: 저장 계층 정리

- 신규 저장값은 `Instant`(또는 ISO string of Instant) 기준으로 통일
- 기존 `Date` 직렬화 포맷과 혼용되는 경로 식별

### 2단계: 표시/입력 계층 분리

- 사용자 지역 시각 표시 로직은 `ZonedDateTime`
- 도메인 날짜값(생일/마감일)은 `PlainDate`로 모델링

### 3단계: 위험 구간 교체

- DST 경계 연산(정산, 예약, 알림)
- 문자열 파싱 분기 로직
- `Date` mutable 메서드에 의존한 유틸

### 4단계: 런타임 지원 전략

- 지원 브라우저/런타임 매트릭스 점검
- 미지원 환경은 polyfill 전략 명시

## Bloomberg 글에서 눈여겨볼 관점

Bloomberg 글은 단순 기능 소개를 넘어서, Temporal이 왜 "9년짜리 작업"이었는지 맥락을 잘 보여준다. 특히 실무 관점에서 눈에 띄는 건 세 가지다.

1. 표준 API가 실제 대규모 운영 문제(시간대, 캘린더, 정밀도)에서 출발했다는 점
2. Bloomberg, Google, Igalia, Mozilla 등 복수 조직이 장기간 협업하고, `temporal_rs`처럼 V8을 포함한 여러 엔진이 공유하는 Rust 구현 기반까지 갖췄다는 점
3. Test262 테스트 규모도 매우 커서, 표준화–구현–검증 체인이 비교적 단단하게 만들어졌다는 점

이건 팀에 Temporal 도입을 설득할 때도 쓸 수 있는 근거다. "새 문법"이 아니라 "기존 시간 모델의 구조적 리스크를 줄이는 투자"로 이야기할 수 있기 때문이다.

## 마무리

Temporal Stage 4를 환영한다. 우리는 이제 시간 데이터를 더 이상 Date 하나로 우겨 넣지 않아도 된다.

다음 스프린트에서 바로 시도해볼 수 있는 변화는 크지 않다.

- `Date` 신규 사용 금지 룰 추가
- 신규 시각 저장은 `Instant` 우선
- 타임존 연산 경로를 `ZonedDateTime` 후보로 분리

작게 시작해도 효과는 빨리 체감될 가능성이 높다. 시간 버그는 늦게 발견될수록 비싸다.

## 참고 링크

- [Temporal: The 9-Year Journey to Fix Time in JavaScript (Bloomberg)](https://bloomberg.github.io/js-blog/post/temporal/)
- [TC39 Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md)
- [Temporal Proposal Repository](https://github.com/tc39/proposal-temporal)
- [Temporal Documentation](https://tc39.es/proposal-temporal/docs/)
- [MDN Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)

### 이미지 출처

- 커버: [Photo by Pixabay on Pexels](https://www.pexels.com/photo/gray-and-black-pocket-watch-1252869/)
- 본문 이미지: 직접 제작 (SVG)
