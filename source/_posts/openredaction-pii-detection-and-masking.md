---
title: OpenRedaction — 텍스트에서 민감 정보를 자동으로 찾아 마스킹하는 라이브러리
description: JavaScript/TypeScript 환경에서 이메일, 전화번호, 카드번호 등 570개 이상의 PII 패턴을 정규식 기반으로 탐지하고 마스킹하는 오픈소스 라이브러리 OpenRedaction을 소개한다.
date: 2026-03-19 11:00:00
category:
    - JavaScript
    - Security
tags:
    - JavaScript
    - TypeScript
    - Security
    - PII
    - Privacy
    - Open Source
cover: cover.jpg
comments: true
---

서비스를 운영하다 보면 로그에 사용자 이메일이 찍히고, 분석 파이프라인에 전화번호가 섞여 들어간다. 요즘은 LLM에 보낸 프롬프트에 카드번호가 실려 나가는 일까지 생긴다. GDPR, HIPAA 같은 규정이 아니더라도 개인정보가 의도치 않게 유출되는 건 누구에게나 부담스러운 일이다.

[OpenRedaction](https://github.com/sam247/openredaction)은 이런 문제를 정규식 기반으로 해결하는 JavaScript/TypeScript 라이브러리다. 570개 이상의 PII(Personal Identifiable Information) 패턴을 내장하고 있고, 외부 API 호출 없이 로컬에서 동작한다. MIT 라이선스이고 테스트도 450개 넘게 작성돼 있어서, 실무에 도입하기에 부담이 적다.

## 어떤 문제를 풀려는 걸까

텍스트 데이터에서 민감 정보를 걸러내는 일은 생각보다 까다롭다. 이메일 주소 하나만 해도 포맷이 다양하고, 전화번호는 국가마다 형식이 다르다. 카드번호 같은 경우 단순 패턴 매칭으론 부족하고, Luhn 알고리즘으로 유효성까지 검증해야 정확도가 올라간다.

기존에도 Microsoft의 [Presidio](https://github.com/microsoft/presidio) 같은 도구가 있었지만, 이쪽은 Python 기반이고 NLP 모델에 의존하는 구조라 JavaScript 생태계에서 가볍게 쓰기엔 부담이 있었다. OpenRedaction은 "정규식 우선(Regex-first)"이라는 접근으로 이 빈자리를 채운다. AI 모델 없이도 빠르고, 같은 입력에는 항상 같은 결과를 보장한다(deterministic). 필요할 때는 호스팅 API를 통해 AI 보조 탐지도 붙일 수 있다.

## 기본 사용법

설치는 npm 한 줄이면 된다.

```bash
npm install @sam247/openredaction
```

가장 간단한 사용 예시를 보자.

```typescript
import { OpenRedaction } from '@sam247/openredaction';

const redactor = new OpenRedaction({
  redactionMode: 'placeholder'
});

const result = await redactor.detect(
  'My name is John Smith and my email is john@example.com'
);

console.log(result.redacted);
// "My name is [NAME_XXXX] and my email is [EMAIL_XXXX]"
```

텍스트를 넣으면 PII를 자동으로 탐지해서 `[NAME_XXXX]`, `[EMAIL_XXXX]` 같은 플레이스홀더로 치환해준다. `result.detections`를 통해 어떤 타입의 PII가 어디서 감지됐는지도 확인할 수 있다.

## 마스킹 모드

마스킹 방식을 다섯 가지 중에서 골라 쓸 수 있다.

| 모드 | 설명 | 예시 |
|-----|------|------|
| `placeholder` | 타입별 플레이스홀더로 대체 | `[EMAIL_XXXX]` |
| `mask-middle` | 양쪽 끝만 남기고 마스킹 | `s***@example.com` |
| `mask-all` | 전체 마스킹 | `****************` |
| `format-preserving` | 원본 형식을 유지하며 마스킹 | 형식은 동일, 값만 변경 |
| `token-replace` | 결정적 토큰으로 교체 | 동일 값은 항상 같은 토큰 |

상황에 따라 골라 쓸 수 있는데, 예를 들어 로그에서는 `mask-all`로 완전히 가리고 LLM 파이프라인에서는 `token-replace`로 대체한 뒤 나중에 복원하는 식이다.

```typescript
const redactor = new OpenRedaction({
  includeNames: true,
  includeEmails: true,
  includePhones: true,
  redactionMode: 'mask-middle'
});

const input = 'Contact Sarah Jones at sarah@example.com or call +1 202-555-0110';
const { redacted } = await redactor.detect(input);

console.log(redacted);
// "Contact S***h J***s at s***@example.com or call +1 ***-***-0110"
```

## 탐지할 수 있는 PII 패턴

570개 이상의 패턴을 내장하고 있고, 크게 다음과 같은 카테고리로 나뉜다.

<strong>개인 정보</strong> — 이메일, 전화번호(미국·영국·국제), 이름(문맥 인식 검증), 주민등록번호(SSN), 여권, 운전면허

<strong>금융 정보</strong> — 신용카드(Luhn 검증), IBAN, 은행 계좌, SWIFT 코드, 라우팅 번호, 암호화폐 주소

<strong>디지털 신원</strong> — API 키, OAuth 토큰, JWT, Bearer 토큰, 소셜 미디어 ID

이 외에도 50개국 이상의 정부 발급 ID, 의료 정보, 소매·법률·물류·보험 등 25개 이상 산업 분야의 패턴까지 커버한다.

단순히 정규식만 돌리는 게 아니라, 체크섬 검증(카드번호의 Luhn 알고리즘 등)과 문맥 기반 필터링까지 결합해서 오탐(false positive)을 줄이는 방향으로 설계돼 있다.

## LLM 파이프라인에서의 활용

요즘 가장 쓸모 있는 시나리오는 LLM 연동이다. 사용자 입력을 외부 AI API로 보내기 전에 민감 정보를 마스킹하고, 응답을 받은 뒤 원본으로 복원하는 식이다.

```typescript
import { OpenRedaction } from '@sam247/openredaction';

const redactor = new OpenRedaction({
  preset: 'gdpr',
  redactionMode: 'token-replace',
  deterministic: true
});

async function sanitizeForLLM(text: string) {
  const { redacted, redactionMap } = await redactor.detect(text);

  // 마스킹된 텍스트를 LLM에 전송
  const response = await sendToLLM(redacted);

  // 신뢰할 수 있는 목적지에는 복원해서 전달
  const restored = redactor.restore(response, redactionMap);
  return { redacted, restored, redactionMap };
}
```

`deterministic: true` 옵션을 주면 같은 값에 대해 항상 같은 토큰이 생성된다. 그래서 LLM이 응답에서 해당 토큰을 그대로 사용하면, `restore()`로 원본 값을 복원할 수 있다. 이 방식을 쓰면 외부 API에 실제 개인정보를 노출하지 않으면서도 문맥을 유지한 채 AI 기능을 활용할 수 있다.

## 컴플라이언스 프리셋

규정별로 미리 정의된 프리셋도 제공한다.

- `gdpr` — EU 일반 데이터 보호 규정
- `hipaa` — 미국 의료 정보 보호
- `ccpa` — 캘리포니아 소비자 프라이버시법
- `finance` — 금융 분야
- `education` — 교육 분야
- `transportation` — 교통 분야

프리셋을 지정하면 해당 규정에서 요구하는 PII 카테고리가 자동으로 활성화된다. 물론 `categories`나 `patterns` 옵션으로 세밀하게 조정할 수도 있다.

## 커스텀 패턴 추가

내장 패턴으로 부족하다면 커스텀 패턴을 추가할 수 있다. 예를 들어 회사 내부의 사원번호 같은 걸 탐지하고 싶다면 이런 식이다.

```typescript
const redactor = new OpenRedaction({
  customPatterns: [
    {
      type: 'EMPLOYEE_ID',
      regex: /EMP-\d{4}/g,
      priority: 10,
      placeholder: '[EMPLOYEE_ID_{n}]',
      severity: 'medium',
    },
  ],
  whitelist: ['ACME Corp'], // 허용 목록에 등록된 값은 마스킹하지 않음
});
```

`whitelist`를 쓰면 특정 값을 마스킹에서 제외할 수도 있어서, 회사명이나 공개된 정보가 불필요하게 가려지는 걸 방지할 수 있다.

## 한계와 주의점

정규식 기반 접근이기 때문에 몇 가지 한계가 있다.

<strong>문맥에 따라 달라지는 PII는 놓칠 수 있다.</strong> "철수"가 사람 이름인지 "물을 철수하다"의 동사인지, 정규식만으로는 판단하기 어렵다. 이름 탐지에는 문맥 분석(Context Analysis)을 결합하고 있지만, NLP 모델만큼의 정확도를 기대하기는 어렵다.

<strong>패턴 커버리지가 완벽하지 않다.</strong> 570개 이상의 패턴이 많아 보이지만, 세상의 모든 PII 형식을 다루진 못한다. 특히 한국의 주민등록번호나 사업자등록번호 같은 로컬 패턴이 포함돼 있는지는 별도로 확인이 필요하다.

<strong>민감한 데이터를 다루는 만큼 수동 검토가 권장된다.</strong> 라이브러리 자체도 README에서 "고도로 민감한 사용 사례에서는 마스킹 결과를 수동으로 검토하라"고 안내하고 있다.

## 생태계

이런 한계를 보완할 수 있도록 OpenRedaction은 단일 라이브러리가 아니라 작은 생태계를 이루고 있다.

- <strong>[@sam247/openredaction](https://github.com/sam247/openredaction)</strong> — 핵심 라이브러리. 로컬 정규식 기반 탐지·마스킹
- <strong>[openredaction-api](https://github.com/sam247/openredaction-api)</strong> — 호스팅 API 서버. AI 보조 탐지 제공
- <strong>[openredaction.com](https://openredaction.com)</strong> — 웹 플레이그라운드. 브라우저에서 바로 체험 가능

핵심 라이브러리만 쓰면 완전히 로컬에서 무료로 동작하고, 정규식으로 부족한 부분은 호스팅 API의 AI 보조 탐지로 보완할 수 있는 구조다.

## 정리

OpenRedaction은 PII 탐지와 마스킹이라는 명확한 문제 하나를 정규식으로 깔끔하게 풀어낸 라이브러리다. AI 모델에 의존하지 않아서 가볍고 빠르며, 로컬에서 돌아가기 때문에 데이터가 외부로 나갈 일이 없다. LLM 파이프라인의 전처리 단계에 끼워 넣거나, 로그·분석 파이프라인에서 개인정보를 자동으로 걸러내는 용도로 실용적이다.

다만 정규식만으로 모든 케이스를 잡을 순 없으니, 1차 방어선으로 두고 AI 보조 탐지나 수동 검토를 함께 쓰는 게 현실적이다.

## 참고 링크

- [GitHub — sam247/openredaction](https://github.com/sam247/openredaction)
- [OpenRedaction 공식 사이트](https://openredaction.com)
- [npm — @sam247/openredaction](https://www.npmjs.com/package/@sam247/openredaction)
