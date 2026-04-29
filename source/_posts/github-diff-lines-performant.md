---
title: "[AI가 쓴 글] GitHub는 왜 diff 한 줄을 다시 설계했을까: Files changed 탭 성능 개선기"
description: GitHub가 React 기반 Files changed 탭에서 diff 한 줄 구조를 다시 설계하며 DOM, 컴포넌트, 이벤트 처리, 가상화 전략을 어떻게 손봤는지 정리했다. 대규모 리스트 UI를 다루는 프런트엔드 개발자에게 꽤 실용적인 힌트가 된다.
date: 2026-04-13 10:55:00
category:
    - React
    - Architecture
tags:
    - GitHub
    - React
    - Performance
    - Virtualization
    - Frontend
cover: cover.jpg
---

{% alert info '작성 방식 안내' %}
이 글은 생성형 AI를 활용해 초안을 작성했고, 저자가 사실관계와 표현을 검토하며 다듬은 글입니다.
{% endalert %}

프런트엔드 성능 최적화 얘기를 하면 보통 가상화(virtualization), 메모이제이션, CSS 최적화 같은 키워드가 먼저 나온다. 그런데 GitHub가 최근 공유한 Files changed 탭 개선기는 <strong>"우리가 지금 그리고 있는 UI 단위 자체가 너무 비싼 건 아닌가?"</strong> 하는 질문을 던진다.

이번 글에서는 GitHub Engineering 글 <a href="https://github.blog/engineering/architecture-optimization/the-uphill-climb-of-making-diff-lines-performant/" target="_blank" rel="noopener">The uphill climb of making diff lines performant</a>를 바탕으로, 대규모 diff 뷰를 어떻게 다시 설계했는지 정리해본다.

{% alert info '한 줄 요약' %}
GitHub의 최적화 포인트는 구조 정리에 있다. diff 한 줄당 DOM 노드, React 컴포넌트, 이벤트 핸들러, 상태 접근 비용을 줄이고, 정말 큰 PR에서만 TanStack Virtual 기반 가상화를 적용해 성능과 사용성의 균형을 잡았다.
{% endalert %}

## 왜 이 글이 재밌나

GitHub의 PR 화면은 그냥 코드 몇 줄 보여주는 페이지가 아니다. 작은 수정부터 수천 개 파일, 수만 줄 변경까지 제공해야하고, 댓글, 선택, 드래그, 컨텍스트 메뉴, syntax highlighting, split/unified 보기 같은 상호작용도 지원해야한다.

GitHub가 공개한 수치를 보면 최적화 전 극단적인 경우 JavaScript heap이 1GB를 넘고, DOM 노드 수가 40만 개를 초과하기도 했다. 상호작용 반응성 지표인 INP(Interaction to Next Paint)도 충분히 나빴고, 사용자가 체감할 정도로 입력 지연이 있었다고 한다.

여기서 중요한 건, "React라서 느리다"와 같이 단순하게 문제를 치부한게 아니라는 점이다. <strong>한 줄 단위의 렌더링 비용이 큰 상태에서, 데이터 양까지 폭증하면 어느 기술 스택이든 버티기 어렵다.</strong>

{% figure supporting.jpg '코드 작업 이미지' '그림 1. 대규모 코드 리뷰 UI는 단순 렌더링보다 상호작용과 상태 관리까지 함께 고려해야 한다' '900px' %}

## GitHub가 먼저 한 일: diff 한 줄을 싸게 만들기

보통 대규모 리스트 성능 얘기에서는 가상화부터 떠올리기 쉽다. 하지만 GitHub는 먼저 diff line 자체를 가볍게 만드는 데 집중했다. 평소 크기의 PR에서도 계속 렌더되는 기본 단위를 줄여야 전체 경험이 좋아지기 때문이다.

### v1에서는 한 줄이 너무 무거웠다

GitHub 설명에 따르면 기존 v1 구현은 unified view 기준 한 줄에 대략 DOM 요소 10개, split view 기준 15개 정도가 필요했다. syntax highlighting까지 붙으면 `<span>`이 더 늘어나니 실제 DOM 수는 더 커진다.

React 계층도 비슷했다. unified view는 최소 8개, split view는 최소 13개 컴포넌트가 필요했다. 여기에 hover, comment, focus 같은 상태가 더해지면 비용은 더 커진다.

이 구조가 만들어진 이유도 이해는 간다. Rails 기반 기존 화면을 React로 옮기면서, 작은 재사용 컴포넌트를 많이 두고 split/unified 공통 추상화를 올리는 방식은 구현하기 편하기 때문이다. 문제는 <strong>그 추상화 비용이 대규모 데이터에서 폭발했다</strong>는 데 있다.

GitHub가 정리한 v1의 한 줄 비용은 대략 이렇다.

- DOM 요소 10~15개 이상
- React 컴포넌트 8~13개 이상
- React 이벤트 핸들러 20개 이상
- split/unified 공용 추상화에 따른 추가 복잡도

프런트엔드 실무에서도 익숙한 장면이다. 작은 컴포넌트는 재사용성 측면에서는 예뻐 보이는데, 리스트 아이템 한 개에 그 패턴이 과하게 중첩되면 성능은 나빠지고 디버깅도 어려워진다.

## v2의 핵심은 "덜 그리기"가 아니라 "덜 얹기"

GitHub가 v2에서 한 가장 큰 변화는 "한 줄을 구성하는 책임"을 다시 나눈 것이다.

### 1) 컴포넌트 수를 확 줄였다

v2에서는 diff line당 컴포넌트 수를 8개에서 2개 수준으로 줄였다. 특히 split/unified 뷰를 하나의 추상화 계층으로 묶는 대신, 각 뷰 전용 컴포넌트를 따로 두었다.

코드 중복은 좀 늘었겠지만, 렌더링 경로는 단순해졌다. 실제로 이 선택은 꽤 현실적이다. <strong>렌더 비용이 민감한 구간에서는 "아름다운 추상화"보다 "단순한 전용 구현"이 낫다.</strong>

### 2) 이벤트 핸들러를 흩뿌리지 않았다

기존에는 작은 컴포넌트마다 5~6개의 이벤트 핸들러가 붙는 식이었고, 결과적으로 한 줄에 20개 넘는 핸들러가 생기기도 했다. 수천 줄이면 이 비용이 바로 누적된다.

v2에서는 이를 상단 단일 핸들러로 모으고, `data-*` 속성을 통해 어떤 줄이 선택됐는지 판단하도록 바꿨다. 예를 들어 여러 줄 선택 드래그를 할 때도 각 라인이 `mouseenter`를 개별로 들고 있는 대신, 이벤트 하나가 대상의 data attribute를 보고 처리하는 방식이다.

이 패턴은 성능에도 좋지만 코드 읽기에도 좋다. 리스트가 큰 화면에서는 이벤트 위임(event delegation)이 여전히 강력한 무기라는 걸 다시 보여준다.

### 3) 무거운 상태를 기본 diff line에서 분리했다

댓글 상태나 컨텍스트 메뉴 상태는 실제로 모든 줄에서 항상 필요한 게 아니다. 그런데 모든 라인이 그런 복잡한 상태를 기본으로 들고 있으면, 안 쓰는 비용까지 전부 선지불하게 된다.

GitHub는 comment/context menu 같은 상태를 조건부 렌더링되는 자식 컴포넌트 쪽으로 옮겼다. 덕분에 diff line의 주 책임은 다시 "코드 한 줄 렌더링"으로 좁혀졌다.

이 부분은 글에서도 Single Responsibility Principle과 연결해서 설명하는데, 개인적으로는 원칙 얘기보다 <strong>"기본 경로를 가볍게 만들었다"</strong>는 해석이 더 중요해 보였다.

### 4) 상태 조회를 O(n)에서 O(1)로 바꿨다

v1에서는 공용 스토어나 컴포넌트 상태에서 O(n) 조회가 점점 쌓였고, `useEffect`도 컴포넌트 트리 곳곳에 흩어져 있었다고 한다. 이건 대규모 리스트에서 꽤 위험한 조합이다. 조회도 비싸고, 다시 그리기도 자주 일어나기 때문이다.

v2에서는 두 가지를 손봤다.

- `useEffect` 사용을 diff file 상단 레벨로 제한
- 상태 머신과 글로벌 상태를 `Map` 기반 O(1) 조회 구조로 재설계

예를 들어 특정 줄에 댓글이 있는지 확인할 때도 파일 경로와 라인 번호로 바로 맵을 조회한다. 이런 구조가 되어야 diff line 컴포넌트 memoization도 예측 가능하게 먹고, 상태 접근 비용도 통제된다.

## 숫자로 보면 얼마나 좋아졌나

GitHub는 10,000 line changes 규모의 split diff 기준으로 v1과 v2를 비교했다.

- 총 코드 라인 수: 2,800 → 2,000 (27% 감소)
- 고유 컴포넌트 타입 수: 19 → 10 (47% 감소)
- 렌더된 전체 컴포넌트 수: 약 183,504 → 약 50,004 (74% 감소)
- DOM 노드 수: 약 200,000 → 약 180,000 (10% 감소)
- 메모리 사용량: 약 150∼250MB → 약 80∼120MB (약 50% 감소)
- 대형 PR에서 INP: 약 450ms → 약 100ms (약 78% 개선)

재밌는 건 DOM 노드 감소 폭은 10% 수준인데, 컴포넌트 수와 메모리, INP는 훨씬 더 크게 개선됐다는 점이다. 즉 이 최적화는 <strong>컴포넌트 구조와 상태 흐름을 정리하면서 상호작용 비용 자체를 크게 낮춘 결과</strong>를 낳았다.

## 그래도 한계는 있다, 그래서 가상화를 넣었다

하지만 GitHub도 인정하듯이 p95 이상, 즉 10,000줄을 훨씬 넘는 초대형 PR에서는 이런 최적화만으로 충분하지 않다. 아무리 가벼운 컴포넌트라도 수만 개를 한 번에 그리면 결국 브라우저가 힘들어한다.

그래서 여기서 TanStack Virtual 기반의 window virtualization을 도입했다. 화면에 보이는 diff 일부만 DOM에 유지하고, 스크롤에 따라 필요한 구간만 교체하는 방식이다.

이 선택은 초대형 PR에서 특히 효과가 컸다.

- JavaScript heap과 DOM 노드 수 10배 감소
- p95+ 대형 PR의 INP 약 275∼700ms 이상 → 약 40∼80ms

다만 가상화는 강력하지만, 전체 DOM이 없는 만큼 브라우저 기본 기능 일부를 잃기 때문에 GitHub는 이걸 "기본 모드"가 아니라, 큰 PR에서의 graceful degradation 전략으로 설명한다.

실제로 GitHub changelog에서도 다음 기능이 기대대로 동작하지 않을 수 있다고 밝힌다.

- 브라우저 내 전체 diff 검색
- 전체 텍스트 선택
- 인쇄/내보내기
- 전체 DOM이 필요한 확장 프로그램

즉, <strong>가상화는 만능 기본값이 아니라 대규모 데이터에 대한 전략적 타협</strong>이다. 평소 리뷰 경험에서는 브라우저 기본 동작을 최대한 유지하고, 정말 큰 PR에서만 성능을 위해 일부 기능을 양보한 셈이다.

## 그 밖에 눈에 띈 개선 포인트

원문에서는 "큰 구조 개선" 뿐 아니라 자잘하지만 실제로 효과 있는 최적화도 같이 공유했다.

예를 들면 이런 것들이다.

- line number cell의 불필요한 `<code>` 제거
- 무거운 CSS selector(`:has(...)` 등) 제거
- drag/resize 처리를 GPU transform 기반으로 재구현
- interaction 단위 INP, diff 크기 구간, memory tagging 모니터링 강화
- 서버 측에서 보이는 diff line만 hydrate하도록 최적화
- progressive diff loading과 background fetch 적용

이 대목을 보면 결국 성능 최적화는 <strong>기본 단위 단순화 + 병목 측정 + 작은 비용 제거의 누적</strong>이 중요해보인다.

## 이 글에서 실무적으로 가져갈 만한 포인트

이 사례는 GitHub처럼 거대한 서비스가 아니어도 꽤 많은 힌트를 준다.

### 1) 리스트 아이템 하나의 비용부터 보자

가상화, 스켈레톤, 코드 스플리팅보다 먼저 봐야 할 건 리스트 아이템 한 개가 얼마나 무거운지다. 한 행(row), 한 카드(card), 한 셀(cell)에 컴포넌트가 몇 겹으로 쌓이는지부터 점검해보는 게 좋다.

### 2) 재사용 추상화가 항상 이득은 아니다

split/unified처럼 경우의 수가 큰 UI에서 "공용 컴포넌트로 예쁘게 묶기"는 유지보수성에 좋아 보이지만, 성능 임계 구간에서는 오히려 손해일 수 있다. 렌더링 hot path에서는 중복보다 단순함이 이길 때가 많다.

### 3) 이벤트 위임은 아직도 유효하다

각 아이템에 핸들러를 심는 방식은 작성은 편해도 대규모 리스트에서는 부담이 커진다. `data-*` 속성과 상위 핸들러 조합은 여전히 좋은 선택지다.

### 4) 가상화는 "마지막 카드"에 가깝다

가상화 자체가 나쁜 건 아니지만, 브라우저 기본 경험 일부를 포기하게 만든다. 그래서 먼저 기본 아이템을 가볍게 만들고, 그 다음 정말 큰 데이터에서만 가상화를 켜는 GitHub 접근이 꽤 균형 있어 보인다.

## 마무리

GitHub의 Files changed 개선기에서는 <strong>복잡한 UI를 얼마나 단순한 기본 단위로 다시 설계할 수 있는가</strong>를 이야기한다. diff 한 줄이 너무 많은 책임을 지고 있었고, 그 비용이 대규모 PR에서 그대로 터졌던 것이다.

개인적으로는 이 사례에서 가장 인상적이었던 부분이 TanStack Virtual 도입 자체보다, 그 전에 먼저 한 줄의 구조를 다시 설계했다는 점이었다. 프런트엔드 성능 문제를 만났을 때도 비슷하다. 무거운 화면을 붙잡고 있을 때는 거창한 최적화 기법보다, <strong>"이 화면의 가장 작은 단위가 너무 비싼 건 아닌가"</strong>부터 의심해보는 게 좋겠다.

## 참고 링크

- <a href="https://github.blog/engineering/architecture-optimization/the-uphill-climb-of-making-diff-lines-performant/" target="_blank" rel="noopener">The uphill climb of making diff lines performant</a>
- <a href="https://github.blog/changelog/2026-01-22-improved-pull-request-files-changed-page-on-by-default/" target="_blank" rel="noopener">Improved pull request “Files changed” page on by default</a>
- <a href="https://tanstack.com/virtual/latest" target="_blank" rel="noopener">TanStack Virtual</a>
- <a href="https://web.dev/articles/inp" target="_blank" rel="noopener">Interaction to Next Paint (INP)</a>
- <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map" target="_blank" rel="noopener">MDN: JavaScript Map</a>

### 이미지 출처

- 커버 이미지: 기존 보유 이미지 재사용 (source/images/typescript-6-0-rc-highlights/code-screen.jpg)
- 본문 이미지: [Unsplash](https://unsplash.com/photos/monitor-showing-java-program-SYTO3xs06fU) — Photo by Ilya Pavlov
