---
title: 리액트 훅스(react hooks)와 험블 객체 패턴(humble object pattern) 그리고 테스트
description: 훅스 관점에서 어떻게 테스트 용이성과 유지보수성 높은 애플리케이션을 일관된 루틴으로 개발하고 설계할 수 있는지 소개한다.
date : 2021-04-21
category:
- JavaScript
- React
tags:
- JavaScript
- Development
- React
- Hooks
- ReactHooks
- Design
- HumbleObjectPattern
- DesignPattern
- Test
- UnitTest

---

{% figure hooks.00.jpg '' '' %}

UI를 개발하는 프런트엔드 개발자라면 누구나 빠질 수 있는 함정이 있다. UI 개발 특성상 무엇보다 뷰가 중요해 보이기 때문에 너무나 쉽게 뷰부터 시작한다는 것. 

컴포넌트를 작성하다가 필요한 데이터가 있으면 선언하고, 이어서 작성하다가 장황한 로직이 생기면 커스텀 훅스로 분리하는 등 일정한 규칙 없이 산발적으로 이뤄진다. 자연스럽게 중요한 모델 정보와 그 모델을 조작하는 로직도 산발적으로 흩뿌려지는데 결과적으로 테스트하기 매우 불편한 코드가 작성되고 결국엔 테스트를 포기하게 한다.

중 / 대규모 프로젝트에 참여해 본 사람은 알 것이다. 낮은 응집성이나 관심사 파편화도 큰 문제지만 무엇보다 테스트 코드 없는 영역을 수정해야 할 때만큼 불안감을 가져다주는 경우는 없다. UI 개발에서 테스트가 어렵다는 건 충분히 공감한다. 하지만 중요한 비즈니스 로직은 가능한한 테스트를 작성해야만 한다.

## 험블 객체 패턴

> 험블 객체 패턴은 디자인 패턴으로, 테스트하기 어려운 행위와 테스트하기 쉬운 행위를 단위 테스트 작성자가 분리하기 쉽게하는 방법으로 ... 중략 ... 가장 기본적인 본질은 남기고, 테스트하기 어려운 행위를 모두 험블 객체로 옮긴다. 나머지 모듈에는 험블 객체에 속하지 않은, 테스트하기 쉬운 행위를 모두 옮긴다.
> 
> Clean Architecture, 로버트 C. 마틴 저 / 송준이 역 | 인사이트(insight) 출판

뷰 그러니까 리액트 컴포넌트는 험블 객체다. 테스트하기 어렵고 불편하다. 이곳에 중요한 로직을 두면 자연스럽게 그 로직도 테스트하기 어려워진다. 중요한 로직은 컴포넌트에서 분리하고 테스트하기 쉬운 곳에 두어야 한다. 그럼 테스트하기 쉬운 공간이 어딜까?

## 건강한 개발 루틴

그 공간을 이야기 하기에 앞서 건강한 개발 루틴을 이야기해보자. 필자가 말하는 건강한 개발 루틴이란 개발의 순서가 일정하며 그 과정에 생산된 코드가 충분히 검증될 수 있는 순서와 방법을 말한다. 

1. 요구사항을 분석하고 모델을 정리한다.
2. 모델을 토대로 데이터를 실체화하고 비즈니스 로직을 작성한다.
3. 비즈니스 로직을 검증하는 테스트 코드를 작성한다.
5. 뷰를 작성하고 사용자 이벤트와 비즈니스 로직을 잇는다.
6. (중요도에 따라) 컴포넌트를 검증하는 테스트 코드를 작성한다.

컴포넌트에서 시작하지 말자. 만들어야 할 것이 무엇인지 알아야만 좋은 코드를 작성 할 수 있다. 키보드에서 손을 내려놓고 조금은 멀리서 관찰할 시간이 필요하다. 어떤 문제를 해결해야 하는지 이해하고 다양한 정책을 찾고 정리해야 한다.

그러고 나면 모델을 찾을 수 있다. 그리고 이 모델을 토대로 데이터를 실체화하고 표현에 활용한다. 이제 구현할 데이터와 비즈니스 로직을 어디에 두어야 할지 고민할 순서다. 중요한 로직은 테스트하기 쉬운 곳에 둬야 한다. 그래야만 지속해서 테스트를 작성하고 커버리지도 높일 수 있다.

테스트하기 쉬운 공간? 그래 훅스다. 훅스를 활용하면 중요한 데이터와 정책을 효율적으로 캡슐화하고 관리할 수 있다. 훅스를 단순히 뷰만을 위한 함수 공간 정도로 바라보는 관점에서 벗어나면 더 다양한 아키텍처를 찾아낼 수 있다.

## 사례 소개

### useBasicFormData

```typescript
function useBasicFormData(initialData: UserBasicData): State {
  const [state, setState] = useState(initialData)
  const changeName = (name: string) => {/* ... */};
  const changeEmail = (email: string) => {/* ... */};
  const changeWorkStatus = (workStatus: WorkStatus) => {
    const newState = produce(state, draft => {
      if (workStatus === WorkStatus.InEmploy) {
        draft.offboardingDate = undefined;
      }
      draft.workStatus = workStatus;
    });
    setState(newState);
  };
  /* ... 생략 ... */
}
```

`useBasicFormData`는 사용자 기본 정보를 관리하는 훅스다. 해당 훅스 내에는 사용자의 기본 정보 즉, 이름이나 이메일, 근무 상태 등을 변경할 수 있는 함수가 존재한다. 

여기에서 `changeWorkStatus` 함수 내 위치한 분기 문에 집중해보자. 해당 분기 문은 "근무 상태를 재직자로 설정하면 퇴직일을 초기화해야 한다"라는 서비스 정책을 나타내는 중요한 로직이다. 이 정책은 테스트 될 필요가 있으며 또 드러나야 한다.

이 로직이 특정 컴포넌트 공간에 존재한다고 생각해보자. 해당 컴포넌트에는 다른 다양한 로직이 뒤섞여 있다. 테스트는 둘째치고 중요한 로직이 여러 곳에 흩뿌려지거나 드러나지 않아 지나치기 쉽다.

### 테스트 케이스

```typescript
it('재직자로 설정하면 퇴직일이 undefined로 설정 돼야 한다.', () => {
  const { result } = renderHook(() => useBasicFormData({
    workStatus: WorkStatus.OffBoard,
    offboardingDate: new Date(),
  }));
  act(() => {
    result.current.changeWorkStatus(WorkStatus.InEmploy);
  });
  expect(result.current.workStatus).toEqual('IN_EMPLOY');
  expect(result.current.offboardingDate).toBeUndefined();
});
```

훅스 테스트에 `@testing-library/react-hooks`의 `renderHook`과 `act`를 사용하고 있다. 해당 라이브러리가 훅스를 한층 더 테스트하기 쉽도록 한다.

`useBaiscFormData`로 데이터를 생성하고 `act`를 이용해 근무상태를 변경한다. 변경 후 `offboardingDate`가 `undefined`으로 변경됐는지 확인하여 정책을 검증한다.

훅스 테스트는 컴포넌트보다 상대적으로 쉽고 단순하다. 이곳에 데이터와 비즈니스 로직을 두는 것으로 험블 객체 패턴을 실현하고 패턴의 장점을 취할 수 있다. 

## 끝으로

리액트 v16.8에 훅스가 추가되고 벌써 2년이 지났다. 커뮤니티는 Redux 기반 리액트 애플리케이션에서 훅스와 컨텍스트를 활용하는 방식으로 전환하고 있다. 필자는 Redux 기반 애플리케이션에서 데이터와 비즈니스 로직을 액션에 작성하고 테스트했다. 액션 생성자라는 단순한 함수 정의에서 벗어나면 뷰 외의 다양한 로직을 테스트하기에 좋은 공간이 된다.

하지만 훅스와 컨텍스트 기반으로 넘어오면서 건강한 개발 루틴을 잠시 잃었다. 필자는 훅스를 단순하게 해석했고 때문에 비즈니스 로직을 둘 적당한 장소가 없어 자연스럽게 컴포넌트부터 시작했는데 이때부터 혼란이 찾아왔다.

현재는 애플리케이션 규모에 따라 훅스를 여러 가지 용도로 정의하고 활용한다. 훅스를 뷰만을 위한 단순한 기능이 아니라 뷰보다 저수준인 다른 계층으로써 활용하면 개발 간 만나는 많은 문제를 해결할 수 있다.

이해를 돕기 위해 할 일 관리 애플리케이션을 작성했다. 관심 있는 분은 참고하길 바란다. 해당 예제는 요구사항 규모에 맞춰 작성했으므로 구현 형태, 디렉터리 구조 등이 다른 애플리케이션에는 잘 어울리지 않을 수 있다는 점을 인지해주길 바란다.

 * [uyeong/todomvc-with-hooks](https://github.com/uyeong/todomvc-with-hooks)

예제를 보면 `hooks` 디렉터리와 `sources` 디렉터리에 모두 훅스가 존재한다. 단순한 유틸리티 성 훅스를 하나의 디렉터리에 두게 되면 중요한 훅스가 파일 구조 내에서 드러나지 않기 때문에 `sources` 라는 별도의 디렉터리로 분리했다.

필자가 작성한 [useTodos](https://github.com/uyeong/todomvc-with-hooks/blob/main/src/sources/useTodos.ts)와 클래스로 구현한 [todoModel](https://github.com/tastejs/todomvc/blob/gh-pages/examples/typescript-react/js/todoModel.ts)를 함께 비교해보면 뭔가 아하! 하는 게 있지 않을까 기대한다.
