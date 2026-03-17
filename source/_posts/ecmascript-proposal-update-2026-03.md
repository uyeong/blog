---
title: "TC39 2026년 3월 제안 업데이트 정리: ECMA-262/402에서 바뀐 것"
description: "ECMAScript Daily의 2026년 3월 업데이트를 기준으로 ECMA-262/402의 stage 이동과 withdrawn 항목을 정리하고, 각 제안이 어떤 문제를 풀기 위해 나왔는지 짧게 확장 분석한다."
date: 2026-03-17 15:58:00
category:
    - JavaScript
tags:
    - JavaScript
    - ECMAScript
    - TC39
    - ECMA-262
    - ECMA-402
cover: cover.jpg
comments: true
---

이번 TC39 2026년 3월에서 Temporal·Intl era/monthCode가 Stage 4에 도달했고, 동시에 에러·모듈·Promise 쪽 동작을 더 분명하게 다듬는 제안들도 진척됐다.

## 먼저 숫자부터: 이번 회의에서 이동한 항목

변경된 Stage만 빠르게 소개하면 다음과 같다.

- <strong>ECMA-262</strong>
  - `Temporal`: Stage 3 → 4
  - `Import Text`: Stage 2 → 3
  - `Error Stack Accessor`: Stage 2 → 2.7
  - `Thenable Curtailment`: Stage 1 → 2
  - `Iterator Includes`: 신규(2.7로 표기)
  - `Dynamic Import Host Adjustment`: withdrawn
  - `ArrayBuffer.prototype.transfer`: withdrawn

- <strong>ECMA-402</strong>
  - `Intl era and monthCode`: Stage 3 → 4

{% alert info 'Stage 2.7 표기 확인' %}
TC39 Process 문서 기준으로 현재 제안 단계는 `0, 1, 2, 2.7, 3, 4`로 정의된다.  
`2.7`은 설계 자체는 사실상 완료됐고, 테스트/구현/사용 경험으로 마지막 검증을 진행하는 단계다.
{% endalert %}

## ECMA-262 변경

이번 절에서는 Stage 정보와 함께 각 제안이 어떤 문제를 해결하고 왜 중요한지에 초점을 맞춰 간단히 소개하고자 한다.

### 1) Temporal (3 → 4)

- <strong>핵심 문제</strong>: `Date`의 모호한 시간대 처리, 가변 객체, DST 경계 문제
- <strong>제안 방향</strong>: `Instant`, `ZonedDateTime`, `PlainDate` 같은 타입 분리로 의도 명확화
- <strong>의미</strong>: 날짜/시간 버그를 라이브러리 규약이 아니라 언어 표준 레벨에서 줄이려는 흐름

### 2) Import Text (2 → 3)

- <strong>핵심 문제</strong>: 텍스트 리소스 로딩을 `fetch(...).text()`로 우회하면 경로 기준, async 강제, 실행 시점 제약이 생김
- <strong>제안 방향</strong>: `import ... with { type: "text" }` 같은 형태로 모듈 시스템에 텍스트 import를 정식 통합
- <strong>의미</strong>: 빌드 도구 의존이 강했던 패턴을 런타임/플랫폼 표준으로 끌어올리는 단계

### 3) Error Stack Accessor (2 → 2.7)

- <strong>핵심 문제</strong>: `Error.prototype.stack`은 사실상 표준처럼 쓰였지만, 사양 수준 정의가 약했음
- <strong>제안 방향</strong>: 새 기능 추가보다 기존 웹 현실(de facto API)을 안전하게 표준화
- <strong>의미</strong>: 디버깅/로깅 생태계의 기반 동작을 엔진 간 더 일관되게 맞추려는 정리 작업

### 4) Thenable Curtailment (1 → 2)

- <strong>핵심 문제</strong>: thenable 동화(assimilation) 과정에서 예기치 않은 사용자 코드 실행 경로가 생겨 보안/복잡성 이슈 유발
- <strong>제안 방향</strong>: thenable 처리 경계에서 실행 시점/동작을 더 제어 가능한 형태로 축소
- <strong>의미</strong>: Promise 상호운용성은 유지하되, 플랫폼/호스트 구현이 안전하게 다룰 수 있게 하는 시도

### 5) Iterator Includes (신규)

- <strong>핵심 문제</strong>: iterator에서 특정 값 존재 확인을 매번 우회 패턴으로 작성해야 함
- <strong>제안 방향</strong>: `Array.prototype.includes`에 대응하는 `Iterator.prototype.includes`
- <strong>의미</strong>: 큰 기능은 아니지만, iterator helper 흐름과 맞물려 코드 의도를 더 직접적으로 표현 가능

### 6) Withdrawn 항목 2개는 어떻게 읽어야 하나

`withdrawn`은 “문제 자체가 사라졌다”는 게 아니라 “현재 제안 문서 트랙을 종료했다”는 뜻이며, 실무에선 문제의 재등장 가능성과 대체 경로를 함께 봐야한다.

#### Dynamic Import Host Adjustment (withdrawn)
- Trusted Types/보안 맥락에서 `import(...)` 처리 지점을 조정하려던 제안
- 이번 집계 기준으로는 withdrawn 상태지만, 동적 import의 보안 경계 이슈 자체가 완전히 끝났다고 보긴 어렵다

#### ArrayBuffer.prototype.transfer (withdrawn)
- 이번 집계에서 withdrawn으로 표시됨
- 관련 사용성/성능 요구는 다른 ArrayBuffer 계열 제안(예: resizable/growable)에서 계속 다뤄질 수 있으므로, 기능 단위로 추적하는 게 현실적이다

## ECMA-402 변경

이번 절도 같은 기준으로, Stage 정보와 함께 어떤 문제를 해결하고 왜 중요한지 짧게 정리한다.

### 1) Intl era/monthCode (3 → 4)

이 정보는 Temporal과 연결해서 보길 바란다(Temporal 타입 자체는 ECMA-262, 국제화 포맷/캘린더 해석 규칙은 ECMA-402가 담당한다).

- <strong>핵심 문제</strong>: ISO 달력 밖의 달력(예: era 기반)에서 `era`, `eraYear`, `monthCode` 처리 규칙이 구현마다 흔들릴 수 있음
- <strong>제안 방향</strong>: 비-ISO 캘린더 환경에서 필요한 추상 연산/필드 동작을 ECMA-402에서 명확화
- <strong>의미</strong>: Temporal의 국제화 캘린더 사용성을 “실제로 동작하는 수준”으로 올리는 필수 퍼즐

## 마무리

이번 업데이트에서 시간/국제화(Temporal, Intl), 모듈(Import Text), 에러(stack), 비동기 경계(thenable) 모두 예측 가능성을 높이는 방향으로 움직였다.

실무에서는 특정 제안 하나보다, 런타임/엔진 간 차이가 나던 지점을 줄여 주는지에 주목하면 좋다.  
이번 회의 결과는 그 정리 작업이 계속 진행 중이라는 근거로 볼 수 있다.

## 참고 링크

- ECMAScript Daily 요약: https://ecmascript-daily.github.io/ecmascript/2026/03/16/ecmascript-proposal-update
- TC39 March 2026 agenda: https://github.com/tc39/agendas/blob/main/2026/03.md
- TC39 finished proposals: https://github.com/tc39/proposals/blob/main/finished-proposals.md
- Temporal: https://github.com/tc39/proposal-temporal
- Import Text: https://github.com/tc39/proposal-import-text
- Error Stack Accessor: https://github.com/tc39/proposal-error-stack-accessor
- Thenable Curtailment: https://github.com/tc39/proposal-thenable-curtailment
- Iterator Includes: https://github.com/tc39/proposal-iterator-includes
- Intl era/monthCode: https://github.com/tc39/proposal-intl-era-monthcode
- Dynamic Import Host Adjustment: https://github.com/tc39/proposal-dynamic-import-host-adjustment
