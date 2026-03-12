---
title: "Node.js 릴리스, 이제 연 1회로 간다"
description: 2026년 10월부터 Node.js 릴리스 모델이 바뀐다. 매년 나오는 메이저 버전이 6개월 Current를 거친 뒤 LTS로 전환되는 새 사이클의 핵심과 실무 영향 포인트를 정리했다.
date: 2026-03-12
category:
    - Node.js
tags:
    - Node.js
    - LTS
    - Release
    - Backend
cover: cover.jpg
comments: true
published: false
---

Node.js를 운영 환경에서 쓰고 있다면, 이번 릴리스 모델 변경은 짚고 넘어가야 한다.
핵심은 간단하다. **Node.js 27부터 메이저 버전이 연 1회로 바뀌고, 매년 나온 버전이 같은 해 10월 LTS로 승격된다.**

즉, 지금까지의 "짝수는 LTS, 홀수는 비LTS" 구분이 사라진다.

## 왜 바꾸는 걸까

Node.js 릴리스 팀이 공개한 배경은 이렇다.

- 홀수 버전 채택률이 낮다. 대부분 조직은 LTS 중심으로만 업그레이드한다.
- 홀수/짝수 모델이 입문자와 운영 관점에서 되려 헷갈린다.
- 동시에 유지해야 할 릴리스 라인이 많아질수록 보안 패치 백포팅(backporting) 부담이 커진다.

Node.js 유지보수는 커뮤니티 기여에 크게 의존하기 때문에, 릴리스 라인이 4~5개로 늘어나는 구간을 줄이고 실제 사용자가 많은 라인에 집중하려는 의도다.

## 새 릴리스 모델 한눈에 보기

{% figure timeline.svg 'Node.js 릴리스 전환 타임라인' 'Node.js 릴리스 전환 타임라인 (2026~2027)' %}

2026년 10월부터 적용되는 새 주기는 다음 3단계다.

1. **Alpha Phase (10월~3월, 6개월)**
   - semver-major(브레이킹 체인지) 허용
   - 라이브러리/프레임워크가 미리 호환성 검증하기 좋은 구간
   - Nightly와 달리 서명·태그가 붙고, [CITGM](https://github.com/nodejs/citgm) 테스트를 거친다
2. **Current Phase (4월~10월, 6개월)**
   - 브레이킹 체인지 없이 안정화하는 단계
3. **LTS Phase (30개월)**
   - 장기 지원

총 지원 기간은 기존과 비슷하게 **Current 시작 시점부터 약 36개월**이다.

## 기존 모델과 달라지는 지점

### 1) 홀수/짝수 구분을 신경 쓸 일이 줄어든다

이전에는 운영팀이 짝수 LTS만 추적하는 게 일반적이었다. 앞으로는 **매년 1개 메이저가 나오고, 그 라인이 같은 해 10월 LTS로 승격**되기 때문에 버전 선택 단순해진다.

### 2) 버전 번호가 달력 연도와 맞물린다

Node.js 27은 2027년에 Current로 나온다. Node.js 28은 2028년, 이런 식으로 직관적으로 읽힌다.

### 3) 조기 검증의 중심이 Alpha 채널로 이동한다

기존 홀수 릴리스가 맡던 "미리 부딪혀 보는 창구" 역할을 Alpha가 담당한다. 공식 안내에서도 라이브러리 제작자에게 Alpha를 CI에 넣어달라고 강조한다. LTS에서만 테스트하면, 실제 사용자에게 영향이 생긴 뒤에야 문제를 발견할 수 있기 때문이다.

## 전환 타임라인

v26이 마지막 구모델이고 v27이 첫 신모델이다. 공식 일정 기준으로 중요한 일정은 다음과 같다.

- **Node.js 26**: 2026년 4월 출시 (기존 모델의 마지막 라인)
- **Node.js 27 Alpha 시작**: 2026년 10월
- **Node.js 27.0.0(Current)**: 2027년 4월
- **Node.js 27 LTS 전환**: 2027년 10월

즉, 2026년 10월이 새 모델이 시작되는 시점이다. 라이브러리 유지보수자라면 이 시점부터 Alpha 트랙을 검토해 두는 편이 좋다.

## 실무 관점에서의 대응

### 애플리케이션 운영팀

애플리케이션 운영팀은 원래도 LTS 중심으로 움직였던 경우가 많아 업그레이드 횟수 자체는 크게 달라지지 않을 수 있다. 다만 Alpha~Current 기간에 최소한의 호환성 리허설을 미리 해두면 실제 전환 시 리스크를 줄이기 쉽다.

### 라이브러리/프레임워크 유지보수팀

라이브러리/프레임워크 유지보수팀이라면 **Alpha CI 트랙**을 별도로 두는 것을 강하게 권장한다. 공식 발표에서도 라이브러리 저자에게 Alpha 단계부터 CI를 돌려달라고 요청하고 있고, 브레이킹 체인지가 Alpha 단계에서 주로 발생하는 만큼 이 구간에서 미리 확인해야 사용자 영향을 줄일 수 있다.

### 조직 차원의 거버넌스

조직 차원에서는 "LTS만 추적" 정책을 유지하되 사전 검증 체크포인트를 Alpha 시점으로 앞당겨야 한다. 특히 Native addon이나 런타임 의존성이 큰 서비스는 Alpha 단계에서 검증해 두면 전환 비용을 줄이는 데 도움이 된다.

## 정리하며

이번 변경은 Node.js 생태계가 실제 사용 패턴에 맞춰 **유지보수 지속 가능성(sustainability)**을 높이고자 이뤄졌다.

개발자 입장에서도 나쁘지 않다.
버전 전략이 단순해지면서, 어떤 버전을 기준으로 따라가야 하는지에 대한 팀 내 커뮤니케이션 비용도 줄어들 수 있다.

다만 한 가지 주의할 점은 Alpha 채널을 활용하지 않으면, 브레이킹 체인지로 인한 문제가 사용자에게 전해질 수 있다는 것이다.
새 릴리스 모델은 안정성을 자동으로 보장해 주는 구조가 아니라, 검증 시점을 앞당길 수 있도록 공식 채널을 마련한 구조다.

## 참고 링크

- Node.js 공식 발표: [Evolving the Node.js Release Schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule)
- 배경 논의 이슈: [nodejs/Release#1113](https://github.com/nodejs/Release/issues/1113)
- 공식 지원 일정 데이터: [nodejs/Release/schedule.json](https://github.com/nodejs/Release/blob/HEAD/schedule.json)
- Node.js EOL 정책 설명: [Node.js End-Of-Life](https://nodejs.org/en/about/eol)

### 이미지 출처

- 커버: [Fronalpstock, Switzerland (Wikimedia Commons, Photo by Diliff, CC BY-SA 3.0)](https://commons.wikimedia.org/wiki/File:Fronalpstock_big.jpg)
- 본문 타임라인: 직접 제작 (SVG)
