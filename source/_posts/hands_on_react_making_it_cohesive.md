---
title: 실전! 리액트, 응집성 있게 가자!
description: React.js에서 로직을 어떻게 응집성 있게 관리할 수 있는지 간단한 송금 예제와 함께 소개한다.
date : 2023-02-27
category:
- JavaScript
- React
tags:
- JavaScript
- React
- Design
- Architecture
---

{% figure react_cohesive.01.jpg '' '' %}

React, 아니 근래의 대부분 프레임워크는 컴포넌트를 지향한다. 문제를 작은 단위로 나누고 그것을 블랙박스 형태로 잘 포장, 조합하여 더 큰 문제를 해결하는 방법은 모든 공학 분야에서 공통적으로 애용하는 문제 해결 접근법이다.

하지만 소프트웨어 세계에서는 이런 접근법이 꽤 자주 지켜지지 않을 때가 있다. 가령 여러분이 은행 서비스의 주요 기능 중 하나인 송금 기능을 만들어야 한다고 해보자. 송금 기능에서 우리는 다양한 애플리케이션 비즈니스 로직을 도출할 수 있는데 여기에서는 간단히 송금액을 입력하는 과정만 생각해보자.

1. 송금액 입력 시 대상 계좌의 잔여금을 초과하지 않아야 한다.
2. 송금액 입력 시 일회 이체 한도를 초과하지 않아야 한다.
3. 송금액 입력 시 일일 이체 한도를 초과하지 않아야 한다.
4. 초과 입력 시 송금이 가능한 최대 금액으로 자동 조정하고, 사용자에게 상황을 인지시켜야 한다.

여러분은 유지보수성, 재사용성 등을 위해 송금액 입력 UI 요소와 관련 애플리케이션 비즈니스 로직을 하나의 컴포넌트 단위로 잘 포장하고 싶을 것이다.

{% codeblock lang:jsx %}
interface Props {
  account: Account;
}

function RemittanceInput({ account }: Props) {
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    // 송금액 입력시 필요한 여러가지 검증 처리
  }, []);
  return (
    <>
      <label>
        <span>송금액 : </span>
        <input
          name="remittance"
          type="string"
          value={amount || ''}
          placeholder="송금액을 입력해 주세요."
          onChange={handleChange}
        />
      </label>
      <p>{message}</p>
    </>
  );
}
{% endcodeblock %}  

UML 다이어그램으로 표현해보면 다음과 같다(문법은 함수지만 상태를 갖게 된 이상 객체와 다를 게 없기 때문에 UML 다이어그램으로 표현할 수 있다).

{% figure react_cohesive.02.png '컴포넌트 내에 모두 위치 시켰을 경우의 UML 다이어그램' '' %}

이 컴포넌트만으로 문제를 해결 할 수 있다면 다행이지만 실제 세계는 좀 더 복잡하다. 예를 들어 컴포넌트 내에서 관리하는 송금액(`amount`) 상태를 외부에 배치해야 하는 경우라면 어떨까? 사용자가 송금 버튼을 클릭하면 송금액을 알아야 하기 때문에 `RemittanceInput` 컴포넌트 내부에 감출 수 없다. 이 문제를 해결하는 방법은 실로 다양하지만 일단 다음과 같이 간단하게 풀어보자.

{% codeblock lang:jsx %}
function App() {
  const [account, setAccount] = useAccount();
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const handleChangeAccount = useCallback(() => {
    // 계좌 선택 시 필요한 여러가지 검증 처리
  }, []);
  const handleChangeRemittance = useCallback(() => {
    // 송금액 입력시 필요한 여러가지 검증 처리
  }, []);
  return (
    <>
      <AccountSelecor value={account} onChange={handleChangeAccount} />
      <RemittanceInput value={amount} message={message}  onChange={handleChangeRemittance} />
      <RemitButton account={account} amount={amount} />
    </>
  );
}
{% endcodeblock %}  

송금액 상태와 관련된 애플리케이션 비즈니스 로직을 상위 컴포넌트로 모두 옮겼다. 이제 상태는 상위 컴포넌트에서 관리되므로 송금액 데이터가 필요한 다른 기능을 다루기 쉬워졌다. `RemittanceInput`은 수동적인 컴포넌트로 요소의 스타일만 결정할 뿐 송금액 입력과 관련한 어떠한 결정도 하지 않는다.

이러한 구현은 때에 따라서 충분할 수 있지만 유지보수성, 재사용성에 그다지 좋은 편은 아니다. 만약 다른 페이지에서도 `RemittanceInput`이 필요하다면 `App` 파일을 열어서 관련한 로직이 무엇인지 진중하게 살펴보며 살을 발라 복사해야 한다. 코드 중복은 두말 할 것 없고 중요한 로직을 누락하는 실수를 하기에도 좋다. 또, 추후 송금 정책이 변경된다면 송금액 입력 UI 요소가 있는 모든 페이지를 뒤져 빠짐없이 수정해야한다.

이번엔 송금액과 관련된 로직을 별도 훅스로 추출하고 `RemittanceInput` 가까이에 위치시켜보자. 그러면 테스트용이성도 높일 수 있으며 코드 중복이나 구현 누락도 피할 수 있다.

{% codeblock lang:jsx %}
interface Remittance {
  amount: number;
  message: string;
  change: (amount: number) => void;
}

function useRemittance(account: Account): Remittance {
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const change = useCallback((amount: number) => {
    // 송금액 입력시 필요한 여러가지 검증 처리
  }, [account]);
  return { 
    amount, 
    message, 
    change 
  };
}
{% endcodeblock %}

`useRemittance`는 `Account`의 데이터를 기준으로 송금액 입력을 검증한다. 표현 로직이 없어 테스트하기 쉬우므로 테스트용이성을 높인다.

`App`은 다음과 같이 수정할 수 있다.

{% codeblock lang:jsx %}
function App() {
  const [account, setAccount] = useAccount();
  const remittance = useRemittance(account);
  const handleChangeAccount = useCallback(() => {
    // 계좌 선택 시 필요한 여러가지 검증 처리
  }, []);
  return (
    <>
      <AccountSelecor value={account} onChange={handleChangeAccount} />
      <RemittanceInput remittacne={remittance} />
      <RemitButton account={account} amount={remittance.amount} />
    </>
  );
}
{% endcodeblock %}

다이어그램으로 표현하면 다음과 같다.

{% figure react_cohesive.03.png '훅스를 분리한 경우의 다이어그램' '' %}

하나의 논리적인 패키지 단위를 만들고 그곳에 `RemittanceInput`, `useRemittance`를 함께 뒀다. `RemittanceInput`과 `useRemittance`는 `Remittance` 객체를 통해 소통한다. 서로 연관있는 것을 가까이 배치하여 관계에 대한 착오를 줄여 유지보수성을 높인다.

아직 아쉬운 부분이 있는데 논리적인 패키지 단위로 나눴으나 여전히 `RemittanceInput`과 `useRemittance`의 관계를 코드 상에서 알기 어렵다는 것이다. 그렇다고 `useRemittance`를 `RemittanceInput` 내부로 옮기면 송금액 데이터를 다른 컴포넌트가 참조할 수 없기 때문에 옳지 않다. 문제를 해결하기 위해 컨텍스트를 추가하여 `Remittance` 패키지를 좀 더 보강해보자.

{% codeblock lang:jsx %}
const RemittanceContext = createContext<Remittance>({
  amount: 0,
  message: '',
  change: () => undefined
});

const RemittanceProvider = (
  { children, ...account }: PropsWithChildren<Account>
) => {
  const remittance = useRemittance(account);
  return (
    <RemittanceContext.Provider value={remittance}>
      {children}
    </RemittanceContext.Provider>
  )
};
{% endcodeblock %}

`Remittace` 객체를 컨텐스트 내에서 접근할 수 있도록 `RemittaceContext`와 `RemittanceProvider`를 추가했다. `RemittanceProvider`는 `useRemittance`의 반환값인 `Remittance` 객체를 `RemittaceContext.Provider`로 전달한다.

이제 `RemittacneContext`와 `RemittanceInput`을 연결하는 간단한 브릿지 컴포넌트를 작성해보자.

{% codeblock lang:jsx %}
const RemittanceInputWithContext = () => {
  const remittance = useContext(RemittanceContext);
  return (
    <RemittanceInput remittance={remittance} />
  );
}
{% endcodeblock %}

`App`은 다음과 같다.

{% codeblock lang:jsx %}
function App() {
  const [account, setAccount] = useAccount();
  const handleChangeAccount = useCallback(() => {
    // 계좌 선택 시 필요한 여러가지 검증 처리
  }, []);
  return (
    <>
      <AccountSelecor 
         value={account} 
         onChange={handleChangeAccount} 
       />
      <RemittacneProvider account={account}>
        <RemittanceInputWithContext />
        <RemittacneContext.Consumer>
          {({ amount }) => <RemitButton account={account} amount={amount} />
        <RemittacneContext.Consumer>
      </RemittacneContext>
    </>
  );
}
{% endcodeblock %}

`RemittanceInputWithContext`의 이름을 통해 특정 컨텍스트가 필요하다는 사실을 알 수 있다. `RemittanceProvider` 내부로 `useRemittance`를 감추고 `RemittanceInput`과의 관계를 맺어주므로 더이상 클라이언트가 신경쓸 필요 없다. 이제 적절한 위치에 `RemittacneContext`를 배치하여 송금액 상태를 보존하고 필요시 다른 컴포넌트에서도 활용할 수 있도록 한다. 이제 송금액 UI 요소를 관련 애플리케이션 비즈니스 로직과 함께 재활용 할 수 있고, 때로는 `RemiitanceInput`을 직접 사용할 수도 있어 확장성도 달성한다.

다이어그램으로 표현하면 다음과 같다.

{% figure react_cohesive.04.png '컨텍스트를 활용한 경우의 다이어그램' '' %}

중요한 건 관심사다. 기능 단위로 분리하는 게 아닌 관심사 단위로, 이곳 저곳에서 필요로 하는 로직이라는 점에 초점을 맞추지 말고 응집성 있게 관리하면 유지보수성, 재사용성을 높일 수 있다.
