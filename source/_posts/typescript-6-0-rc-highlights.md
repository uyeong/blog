---
title: "TypeScript 6.0 RC 핵심 정리: 지금 바로 챙겨야 할 변화들"
description: TypeScript 6.0 RC는 단순 기능 추가 릴리스가 아니라 7.0 네이티브 전환을 준비하는 브리지 릴리스다. 실무에서 바로 영향이 큰 변경점과 마이그레이션 포인트를 빠르게 정리했다.
date: 2026-03-11
category:
    - JavaScript
    - Development
tags:
    - TypeScript
    - JavaScript
    - Compiler
    - Release Note
cover: cover.png
---

TypeScript를 실무에서 오래 쓰다 보면 버전 업 공지가 두 종류로 나뉜다. 하나는 "기능 몇 개 추가" 느낌이고, 다른 하나는 "다음 세대 준비" 느낌인데 이번 6.0 RC는 확실히 두 번째에 해당한다. 관련해 오늘은 TypeScript 6.0 RC 발표 글을 기준으로, 중요한 변화만 빠르게 훑고 당장 우리 프로젝트에서 뭘 확인하면 좋은지 정리해본다.

{% alert info '한 줄 요약' %}
TypeScript 6.0 RC는 기능 추가 릴리스이면서 동시에 TypeScript 7.0(네이티브 코드베이스)로 넘어가기 위한 정렬(alignment) 릴리스다. 그래서 "새 기능"만 보기보다 "마이그레이션을 준비"하는 관점으로도 살펴봐야 한다.
{% endalert %}

## 왜 6.0이 중요한가: 7.0으로 가는 징검다리

공식 발표가 가장 강조한 포인트. 6.0은 기존 JavaScript 코드베이스 기반의 마지막 큰 릴리스로 계획되어 있고, 이후 7.0부터는 Go로 작성된 네이티브 코드베이스를 기반으로 간다. Microsoft가 별도 글에서 공유한 방향(빌드/체크 성능 대폭 개선, 언어 서비스 개선)까지 같이 보면, 6.0은 단순한 중간 버전이 아니라 전환을 위한 준비 단계에 가깝다.

{% figure code-screen.jpg '코드 화면 이미지' '그림 1. 6.0은 새 기능 소개이면서 동시에 7.0 전환 준비 성격이 강한 릴리스다' '900px' %}

## 이번 RC에서 실무 영향이 큰 핵심 변경

### 1) this를 안 쓰는 함수의 추론 개선

제네릭 추론에서 메서드 문법 함수가 `unknown`으로 떨어지던 케이스가 있었는데, 6.0은 함수 내부에서 `this`를 실제로 쓰지 않으면 추론 후보로 더 적극적으로 잡아준다. 결과적으로 객체 리터럴 안의 메서드 순서 때문에 추론 품질이 들쭉날쭉하던 문제가 줄어든다.

이건 특히 유틸 함수 조합이 많은 프런트엔드 코드에서 체감될 가능성이 크고, "왜 같은 코드인데 위치 바꾸면 깨지지?" 같은 이상한 순간을 줄여준다는 점에서 꽤 반갑다.

### 2) Node 서브패스 import `#/` 지원

Node가 최근 허용한 `#/` 서브패스 import를 TypeScript도 `moduleResolution` 옵션이 `node20`, `nodenext`, `bundler`일 때 지원한다. 경로 별칭에서 불필요한 접두 경로를 줄일 수 있어서 설정이 좀 더 깔끔해진다.

### 3) `--moduleResolution bundler` + `--module commonjs` 조합 허용

기존에는 이 조합이 막혀 있었는데, deprecated 경로를 피하면서 점진적으로 옮기려는 프로젝트 입장에서는 꽤 현실적인 업그레이드 경로가 된다. 특히 "지금 당장 전부 ESM으로 못 바꾸는" 팀이라면 완충 구간으로 쓸 수 있다.

### 4) `--stableTypeOrdering` 플래그 추가

6.0과 7.0의 내부 타입 정렬 차이 때문에 `.d.ts` 출력물을 비교하면 실제 의미 변화가 없는데도 diff가 과하게 많이 잡힐 수 있는데, 이 플래그가 그런 비교 노이즈를 줄이는 데 도움을 준다. 다만 공식 안내대로 상시 사용 플래그라기보다는 마이그레이션 진단 도구에 가깝고, 성능 저하(코드베이스에 따라 최대 25%) 가능성이 있으니 CI 기본값으로 바로 넣는 건 신중해야 한다.

{% alert info '적용 팁' %}
`--stableTypeOrdering`을 켰을 때 타입 에러가 새로 보이면, 추론 순서에 기대고 있던 코드일 가능성이 있다. 이 경우 제네릭 타입 인자나 변수 주석 타입을 명시해 주면 대부분 정리된다.
{% endalert %}

### 5) `es2025` target/lib, Temporal 타입, RegExp.escape, upsert 타입 반영

6.0은 큰 아키텍처 전환 릴리스지만 언어/라이브러리 쪽 실용 업데이트도 같이 들어왔다.

- `es2025` target/lib 추가
- `Temporal` 타입 제공(`esnext` 계열)
- `RegExp.escape` 타입 반영
- `Map/WeakMap`의 `getOrInsert`, `getOrInsertComputed`(upsert 계열) 타입 지원
- `dom`에 `dom.iterable`, `dom.asynciterable` 내용 통합

## 마이그레이션 관점에서 지금 할 일

6.0을 올릴 때 아래를 함께 점검하면 삽질 시간을 크게 줄일 수 있겠다.

1. `tsconfig`에서 deprecated 옵션 사용 여부 먼저 체크
2. 모듈 해석 전략을 프로젝트 유형별로 분리해 결정
   - 번들러 앱: `module preserve` + `moduleResolution bundler`
   - Node 앱: `module nodenext` 검토
3. 선언 파일 diff가 중요한 저장소는 `--stableTypeOrdering`으로 비교 실험
4. 추론 불안정 구간(복잡한 제네릭 호출)은 타입 인자 또는 주석을 명시해 방어


## 마무리

TypeScript 6.0 RC를 기능 목록으로만 보면 평범해 보일 수 있지만, 릴리스 의도를 보면 전략적인 버전이다. 팀 입장에서는 "무엇이 새로 생겼는가"와 함께 "지금 어떤 부채를 정리해 두면 7.0에서 편해지는가"를 같이 보는 게 맞고, 그 관점에서 6.0은 당장 올려서 실험해볼 가치가 있다.

## 참고 링크

- [Announcing TypeScript 6.0 RC](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0-rc/)
- [Announcing TypeScript 6.0 Beta](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0-beta/)
- [A 10x Faster TypeScript (Native Port)](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [TypeScript npm RC 설치](https://www.npmjs.com/package/typescript)

### 이미지 출처

- 커버 이미지: [TypeScript logo](https://github.com/remojansen/logo.ts) (MIT)
- 본문 이미지: [Cool Reflecting Source Code Screen at GGJ Berlin 2015](https://www.flickr.com/photos/21051491@N02/15787237274) — © qubodup, CC BY 2.0
