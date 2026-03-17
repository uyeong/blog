---
title: Temporal Stage 4 확정, 이제 JavaScript에서 날짜/시간을 다시 배워야 하는 이유
description: TC39 2026년 3월 회의에서 Temporal이 Stage 4에 도달했다. Date의 구조적 한계가 무엇이었는지, Temporal이 어떤 타입으로 문제를 푸는지, 그리고 실무 마이그레이션 포인트를 정리한다.
date: 2026-03-17 15:45:00
category:
    - JavaScript
tags:
    - JavaScript
    - ECMAScript
    - Temporal
    - Date
    - TC39
cover: cover.jpg
comments: true
---

결론부터 말하면, <strong>Temporal Stage 4는 새 API 하나가 늘어난 정도가 아니라, JavaScript 표준에서 날짜/시간을 다루는 기본 관점을 넓힌 변화</strong>다.  
기존 `Date`가 "타임스탬프 숫자 하나를 로컬/UTC 문맥으로 해석"하는 모델이었다면, Temporal은 값의 성격에 따라 타입을 분리해 의도를 코드에서 더 분명히 드러내도록 설계됐다.

{% figure cover.jpg 'TC39 Temporal Stage 4 관련 이미지' 'TC39 Temporal Stage 4 관련 이미지 (출처: Socket)' %}

## 왜 이게 중요한가

프런트엔드/백엔드를 막론하고 날짜·시간 버그는 늘 비슷한 패턴으로 터진다.

- 지역 시간과 UTC 변환이 섞임
- DST(서머타임) 경계에서 1시간이 사라지거나 중복됨
- 문자열 파싱 결과가 런타임/환경마다 다름
- `Date` 객체 가변성(mutable) 때문에 중간 계산에서 상태 오염이 생김

이 문제를 팀마다 moment/dayjs/luxon 같은 라이브러리로 완화해 왔는데, TC39는 이제 이 영역을 언어 표준 안으로 끌어왔다.

## 이번 뉴스 핵심 요약

2026년 3월 TC39 회의에서 Temporal이 Stage 4로 올라갔다. Stage 4는 제안 단계가 끝나고 표준(ECMA-262/402) 반영으로 넘어가는 상태다. Temporal 제안 저장소 README에도 Stage 4와 병합 PR이 명시돼 있다.

구현 상태도 "아이디어" 수준은 이미 지났다. (지원 현황 기준: 2026-03)

- Firefox: 139에서 shipped ([release note](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/139#javascript))
- Chrome: 144에서 shipped ([release note](https://developer.chrome.com/release-notes/144#temporal_in_ecma262))
- Node.js: 구현 이슈 트래킹 중 ([nodejs/node#57127](https://github.com/nodejs/node/issues/57127))
- Safari(JavaScriptCore): 구현 버그 트래킹 중 ([WebKit bug 223166](https://bugs.webkit.org/show_bug.cgi?id=223166))

그래서 Temporal은 "먼 미래 기능"이라기보다, <strong>프로젝트별 도입 시점과 범위를 정리해 둘 필요가 있는 기능</strong>에 가깝다.

## Date에서 Temporal로: 모델 자체가 달라졌다

`Date`는 내부적으로 epoch 기준 밀리초 숫자 하나를 갖고, 이를 로컬/UTC 문맥으로 해석한다. 그 자체는 단순하지만, 현실의 시간(타임존, 캘린더, DST)을 다루기엔 문맥 의존성이 너무 크다.

Temporal은 이걸 "값의 성격" 기준으로 나눈다.

- `Temporal.Instant`: 절대 시점(UTC 축의 한 점)
- `Temporal.ZonedDateTime`: 타임존/캘린더를 가진 실제 지역 시각
- `Temporal.PlainDate`, `PlainTime`, `PlainDateTime`: 타임존 없는 벽시계/캘린더 값
- `Temporal.Duration`: 기간/차이 계산용 타입

{% figure temporal-transition-diagram.svg 'Date에서 Temporal로 넘어가는 개념 다이어그램' 'Date → 라이브러리 시대 → Temporal 전환 개념도 (직접 제작)' %}

이 구조가 좋은 이유는, "의도와 데이터 타입이 일치"하기 때문이다.  
예를 들어 예약 시각을 저장할 때 `Instant`를 쓸지, 사용자 지역 이벤트를 다룰 때 `ZonedDateTime`을 쓸지 코드 레벨에서 바로 드러난다.

## 실무에서 바로 체감되는 포인트

### 1) 불변(immutable) 기반이라 계산 체인이 안전하다

`Date`는 setter 기반이라 객체를 건드리면서 값이 바뀐다. Temporal은 새 값을 반환하므로 중간 상태 오염을 줄이기 쉽다.

### 2) DST/타임존 모호성 처리를 API 차원에서 다룬다

Temporal 문서는 타임존 변환 시 모호한 구간 처리 전략을 명시적으로 다룬다. 덕분에 "환경마다 다르게 해석"되는 위험을 줄일 수 있다.

### 3) 의미 단위가 분리돼서 도메인 모델링이 쉬워진다

생일(`PlainDate`), 로그 이벤트 시점(`Instant`), 캘린더 이벤트(`ZonedDateTime`)를 같은 타입으로 억지로 처리하지 않아도 된다.

## 지금 팀에서 할 일 (현실적인 체크리스트)

1. <strong>날짜/시간 사용처 인벤토리</strong>부터 만들기  
   - 저장(DB), 전송(API), 표시(UI), 계산(배치/리포트) 경로 분리

2. <strong>경계 지점부터 타입 전략 정하기</strong>  
   - 서버 저장 표준은 `Instant` 중심으로 두고, 사용자 표시 시 `ZonedDateTime`으로 변환

3. <strong>폴리필/런타임 지원 매트릭스 운영</strong>  
   - 브라우저/Node 버전에 따라 `@js-temporal/polyfill` 적용 여부 결정

4. <strong>신규 코드부터 점진 도입</strong>  
   - 기존 전면 교체보다 신규 기능·버그 다발 영역부터 전환

## 주의할 점

- Temporal이 들어와도 "시간대 정책"(저장 기준, 표시 기준, 사용자 입력 기준)은 팀이 정해야 한다.
- 타입이 좋아졌다고 도메인 의사결정이 자동으로 해결되지는 않는다.
- 특히 API 계약서(OpenAPI/GraphQL 스칼라)에서 시간 표현 규칙을 먼저 고정하는 게 중요하다.

## 마무리

Temporal Stage 4 소식의 핵심은, 날짜/시간 처리를 더 이상 "라이브러리 선택" 문제로만 보기 어렵다는 점이다.  
표준 차원에서 타입 모델이 정리됐기 때문에, 앞으로는 팀 단위의 시간 데이터 설계가 더 중요해진다.

한 줄로 정리하면 다음과 같다.

<strong>Date 사용 요령만 아는 것보다, 값의 성격에 맞게 Temporal 타입을 선택하고 경계를 설계하는 역량이 점점 더 중요해진다.</strong>

## 참고 링크

- Socket 기사: https://socket.dev/blog/tc39-advances-temporal-to-stage-4
- TC39 Temporal 제안 저장소: https://github.com/tc39/proposal-temporal
- Temporal 문서: https://tc39.es/proposal-temporal/docs/
- TC39 finished proposals: https://github.com/tc39/proposals/blob/main/finished-proposals.md
- MDN Date 레퍼런스: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
