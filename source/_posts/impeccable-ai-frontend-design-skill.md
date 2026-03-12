---
title: "impeccable은 어떤 프로젝트인가: AI 코딩 에이전트용 프론트엔드 디자인 스킬셋"
description: impeccable은 Claude Code, Cursor, Gemini CLI, Codex CLI에서 쓸 수 있는 프론트엔드 디자인 스킬/명령 세트다. 구성 요소와 실무 적용 포인트를 정리했다.
date: 2026-03-12 17:50:00
category:
    - Development
tags:
    - AI
    - UX
    - Design
    - Claude-Code
    - Cursor
cover: cover.jpg
comments: true
published: true
---

`pbakaus/impeccable`은 "AI가 UI를 만들 때 자주 내는 뻔한 결과"를 줄이기 위한 <strong>디자인 지향 스킬 번들</strong>이다.

코드를 생성하는 모델 성능이 좋아져도, 화면 결과물은 비슷비슷한 경우가 많다. 이 프로젝트는 그 지점을 다룬다. 단순히 "예쁜 UI 템플릿"을 주는 게 아니라, AI 에이전트의 <strong>디자인 품질을 조향(steering)</strong>하는 스킬과 명령 체계를 제공한다.

## 프로젝트를 한 줄로 정의하면

impeccable은 크게 다음 세 가지 묶음을 제공한다.

1. `frontend-design` 스킬(참고 문서 7개)
2. 품질/개선용 명령 17개
3. "하지 말아야 할 UI 안티패턴" 가이드

타이포, 색, 공간, 모션, 인터랙션, 반응형, UX writing 등 핵심 디자인 영역을 고르게 커버한다.

## 무엇이 들어 있나

### 1) 스킬 레퍼런스 7종

README 기준으로 다음 파일군이 핵심이다.

- typography
- color-and-contrast
- spatial-design
- motion-design
- interaction-design
- responsive-design
- ux-writing

즉, "컴포넌트 코드를 어떻게 짤까"보다 "사용자에게 어떻게 보이고 동작해야 하는가"를 강하게 규정한다.

### 2) 명령 17개

`/audit`, `/critique`, `/normalize`, `/polish`, `/distill`, `/animate` 같은 명령이 있고, 필요하면 특정 화면이나 영역을 지정해서 원하는 부분만 집중 점검할 수 있다(예: `/audit header`). 각 명령어를 간단히 소개하자면 다음과 같다.

- 진단/품질
  - `/audit`: 접근성, 성능, 반응형 등 기술 품질 이슈를 점검한다.
  - `/critique`: UX 관점에서 정보 위계, 명확성, 감성 톤을 리뷰한다.
  - `/optimize`: UI 렌더링/자산 중심으로 성능 개선 포인트를 찾는다.
  - `/harden`: 에러 처리, i18n, 엣지 케이스 대응을 보강한다.

- 정리/완성
  - `/normalize`: 디자인 시스템 기준에 맞춰 일관성을 정리한다.
  - `/polish`: 배포 직전 마감 품질을 다듬는다.
  - `/distill`: 불필요한 요소를 걷어내고 핵심만 남긴다.
  - `/extract`: 반복 UI를 재사용 가능한 컴포넌트로 분리한다.

- 표현/감성
  - `/animate`: 과하지 않은 모션으로 상태 변화와 맥락을 보강한다.
  - `/colorize`: 전략적으로 색을 도입해 계층과 포커스를 강화한다.
  - `/bolder`: 밋밋한 화면의 대비와 개성을 강화한다.
  - `/quieter`: 과한 시각 요소를 눌러 안정적인 톤으로 정리한다.
  - `/delight`: 작은 상호작용 디테일로 사용자 경험의 완성도를 높인다.

- 맥락/콘텐츠
  - `/teach-impeccable`: 프로젝트/브랜드 컨텍스트를 수집해 기본값으로 저장한다.
  - `/clarify`: 버튼/에러/가이드 문구를 더 명확한 UX writing으로 다듬는다.
  - `/adapt`: 디바이스/뷰포트 조건에 맞게 레이아웃을 조정한다.
  - `/onboard`: 온보딩 플로우와 첫 사용자 경험을 설계한다.

### 3) 안티패턴 가이드

README에 명시된 대표 금지/지양 항목은 다음과 같다.

- 과도하게 흔한 폰트 선택(예: Inter/system default) 남발
- 컬러 배경 위 저대비 회색 텍스트
- pure black/gray 위주 단조 팔레트
- 카드 안에 카드 중첩
- bounce/elastic easing 남용

이런 금지 목록은 생각보다 효과적이다. 모델은 긍정 지시만 있을 때보다, 명시적 금지 규칙이 함께 있을 때 결과물의 품질 편차가 줄어드는 편이다.

## 어떤 도구를 지원하나

공식 README 기준으로 다음을 지원한다.

- Cursor
- Claude Code
- Gemini CLI
- Codex CLI

각 도구별 설치 경로(`.cursor`, `.claude`, `.gemini`, `.codex`)가 다르고, 일부 도구는 별도 기능 활성화가 필요하다(예: Cursor Nightly/Agent Skills, Gemini preview + Skills enable). 자세한 설정 단계는 프로젝트 README를 참고하면 된다.

## 이 프로젝트의 실제 가치

단순한 "디자인 프롬프트 모음"으로 보기엔 아깝다. 실무에서 의미 있는 포인트는 다음 세 가지다.

### 1) 리뷰 기준을 문서로 남겨 재사용

좋은 디자이너가 한 번 코멘트해준 기준은 말로만 전달되면 팀에 남지 않는 경우가 많다. impeccable은 이런 기준을 명령과 레퍼런스 파일 형태로 남겨, 다음 작업에서도 같은 기준으로 다시 활용할 수 있게 만든다.

### 2) AI 결과물의 변동폭을 줄임

같은 요구사항인데도 매번 다른 톤의 UI가 나오는 건 AI 코드 생성의 고질적인 문제다. 스킬+안티패턴 조합은 이 편차를 줄이는 데 효과적이다.

### 3) "디자인 품질"을 작업 단계로 분해

`audit → normalize → polish` 같은 흐름은 처음부터 완성도를 기대하기보다, 점검하고 고치면서 점점 다듬는 방식에 가깝다. 새로 합류한 팀원이 작업 방식을 익히기에도 부담이 적다.

## 한계도 분명히 있다

도입 전에 알아둘 점도 있다.

- 특정 미학 취향이 과하게 고정될 수 있음
- 프로젝트 브랜드 톤이 약하면 스킬 기본값에 끌려갈 수 있음
- 명령이 많아 초반에는 "무엇부터 써야 하는지" 헷갈릴 수 있음

그래서 `/teach-impeccable` 같은 초기 컨텍스트 수집 단계를 생략하면 효과가 크게 떨어질 수 있다.

## 도입한다면 이렇게 시작하는 게 현실적

처음부터 전 화면에 적용하기보다, 변동폭이 큰 화면 1~2개(랜딩 Hero, 결제/가입 폼 등)부터 쓰는 게 낫다.

추천 흐름은 아래 정도면 충분하다.

1. `/teach-impeccable`로 기본 컨텍스트 입력
2. 기존 화면에 `/audit` + `/critique` 실행
3. `/normalize`로 디자인 시스템 정합성 맞춤
4. 배포 직전에 `/polish`

이렇게만 해도 "그럴듯한데 어딘가 촌스러운 UI"를 꽤 안정적으로 줄일 수 있다.

## 정리

impeccable은 AI가 코드를 잘 짜게 만드는 도구가 아니라, <strong>AI가 만드는 화면의 디자인 품질을 팀 기준에 맞추는 도구</strong>다.

AI가 만든 UI의 품질 편차 때문에 리뷰 비용이 크다면, 한번 실험해볼 만하다. 중요한 건 이 기능 저 기능 많이 쓰는 게 아니라 팀 컨텍스트를 먼저 이해하고 안티패턴을 명확히 잡아나가야 한다.

## 참고 링크

- [pbakaus/impeccable (GitHub)](https://github.com/pbakaus/impeccable)
- [impeccable.style](https://impeccable.style)
- [frontend-design skill source](https://github.com/pbakaus/impeccable/tree/main/source/skills/frontend-design)
- [Anthropic frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design)

### 이미지 출처

- 커버: [Photo by cottonbro studio on Pexels](https://www.pexels.com/photo/close-up-photography-of-people-using-laptop-3861969/)
