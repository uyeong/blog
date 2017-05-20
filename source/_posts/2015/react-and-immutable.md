---
title: React와 불변객체
description: 불변객체(Immutable Object)의 개념과 React에 그 개념을 적용했을 때 어떤 이점을 얻을 수 있는지 소개합니다.
date : 2015-08-16
category:
    - JavaScript
    - React
tags:
    - JavaScript
    - React
    - Immutable Object
---

이번에는 불변객체의 개념과 React에 그 개념을 적용했을 때 어떤 이점을 얻을 수 있는지 소개하고자 합니다.

## 불변객체란?

객체 지향 프로그래밍에 있어서 불변객체(Immutable object)는 생성 후 그 상태를 변경할 수 없는 객체를 말합니다. 불변객체의 반대말은 가변객체로 자바스크립트의 배열과 같이 객체 내에서 관리하는 값이나 상태를 변경할 수 있는 것을 말합니다.

{% prism javascript "
var greeting = new String('Hello World!!');

greeting.replace('World', 'Gil-dong');
greeting.valueOf(); // Hello World!!
" %}

위 예에서 `greeting` 변수에 문자열 객체를 생성해 대입했습니다. 그리고 문자열 객체의 `replace` 메서드를 이용해 'World'라는 문자열을 'Gil-dong'으로 변경했습니다. 하지만 여전히 `greeting`의 값은 'Hello World' 입니다.

`greeting`에 생성한 문자열 객체는 불변 객체이므로 객체 자신이 소유하거나 관리하는 값 또는 상태를 바꿀 수 없습니다. 따라서 `replace` 메서드는 새로운 상태를 가지는 또 다른 객체를 생성합니다.

변수에 값을 바꾸기 위해서는 아래 처럼 새로운 객체를 변수에 대입해야 합니다.

{% prism javascript "
var greeting = new String('Hello World!!');

greeting = greeting.replace('World', 'Gil-dong');
greeting.valueOf(); // Hello Gil-dong!!
" %}

### 값 객체

이러한 불변 객체의 특성은 우리가 밀접히 사용하는 `Number`, `String`, `Boolean`과 같은 값 객체에서 만날 수 있습니다. 값 객체란 비교 연산 시 자신의 상태보다 값(value)을 우선하는 단순한 객체를 말합니다.

{% alert info "자바스크립트에서 비교 연산" "
여기에서는 이해를 돕기 위해 생성자를 이용해 문자열이나 정수를 생성하고 있지만, 자바스크립트에서 생성자를 이용해 원시 타입 객체를 생성하면 비교 연산 시 참조를 이용해 비교합니다. 따라서 항상 리터럴 표기법으로 값을 다루기 바랍니다.
<pre style='display:block'>
<code class='language-javascript'>
    new String('Hello') === new String('Hello'); // false
    new Number(5) === new Number(5); // false
</code>
</pre>
" %}

값 객체는 값을 이용해 새로운 값을 만들어 낼 수 있지만 값 자체를 변경할 수 없습니다. 즉, 불변입니다.

{% prism javascript "
var num = new Number(2);
num = num + new Number(3);

num.valueOf(); // 5
" %}

위에서 숫자 `2`를 생성한 후 숫자 `3`을 더해 숫자 `5`를 얻고 있습니다. 숫자 `2`에 숫자 `3`을 더하는 것은 값 자체를 바꾸는 것이 아니라 새로운 값을 생성하는 것입니다. 이러한 특징은 상태를 변화시키지 않으며 새로운 값을 생성하는 함수형 스타일(functional style)과 닮았습니다.

## React.js와 불변객체

React 컴포넌트의 라이프 사이클 메서드 중에는 `shouldComponentUpdate` 메서드가 있습니다. 이 메서드는 컴포넌트가 다시 그려지기 전에 호출되며 만약 `false`를 반환하면 컴포넌트의 VirtualDOM을 비교하지 않습니다.

다량으로 엘리먼트를 출력하는 리스트나 피드와 같은 컴포넌트는 매번 VirtualDOM을 비교하게 되면 성능 문제가 발생할 수 있으므로 필수로 사용해야 하는 메서드입니다(대도록이면 모든 컴포넌트에 작성하는 습관을 들이는게 좋습니다).

### 가변 객체일 때

잘 알려진 TodoMVC를 예를 들어 설명하겠습니다.

{% prism javascript "
// todoItem.js
shouldComponentUpdate(nextProps, nextState) {
  return (
    nextProps.todo !== this.props.todo ||
    nextState.label !== this.state.label
  );
}
" %}

todoItem 컴포넌트의 `shouldComponentUpdate` 메서드는 prop 속성으로 전달된 todo 객체를 비교하여 VirtualDOM을 비교할지 말지 결정하고 있습니다.

{% prism javascript "
// todoHome.js
onUpdate(todoId, label) {
  this.todos.update(todoId, label);
}

// todos.js
update(todoId, label) {
    var todo = this._todos.find((todo) => todo.id === todoId);

    todo.update(label);
    this.emit('update');
}
" %}

특정 todo의 label 값을 변경하라고 todos 모델 객체에 요청하고 있습니다. todos 모델 객체는 자신이 관리하는 todo 객체들 중 하나를 찾아서 값을 변경하고 변경 사실을 통지합니다. 하지만 todoItem 컴포넌트의 단순한 비교문으로는 todo 객체의 값이 변경됐는지 알 수 없습니다.

todos 모델 객체에서 관리하는 todo 객체와 prop 속성으로 전달된 todo 객체의 참조가 동일하기 때문에 항상 참이되므로 의도한 결과를 얻을 수 없는 것입니다.

{% prism javascript "
// todoItem.js
shouldComponentUpdate(nextProps, nextState) {
  return (
    nextProps.todo.label() !== this.props.todo.label() ||
    nextProps.todo.completed() !== this.props.todo.completed() ||
    nextState.label !== this.state.label
  );
}
" %}

`shouldComponentUpdate` 메서드의 비교문을 변경했습니다. 조금 복잡해졌습니다. 만약 하나의 객체에서 관리하고 있는 상태가 많을수록 이 비교문은 아주 복잡해질 것입니다.

하지만 여전히 이 코드는 동작하지 않습니다. todos 모델 객체에서 특정 todo 객체의 상태를 변경하면 같은 todo 객체를 참조하는 todoItem 컴포넌트에도 동일하게 반영돼 상태가 변경됐는지 알 수 없습니다. 이처럼 가변 객체의 참조를 가지고 있는 어떤 장소에서 객체를 변경하면 참조를 공유하는 모든 장소에서 그 영향을 받기 때문에 객체를 참조로 다루기란 쉽지 않습니다.

{% prism javascript "
// todoHome.js
render() {
    var todos = this.props.todos.forEach((todo) => {
        return &lt;TodoItem key={todo.get('id')} todo={todo.clone()} />;
    });

    return (
        &lt;ul>{todos}&lt;/ul>
    );
}
" %}

이번엔 `clone` 메서드를 이용해서 todo의 객체 상태를 전부 복사하여 새로운 todo 객체를 만들어 todoItem 컴포넌트에 전달하고 있습니다. 이러한 방법을 방어적 복사(defensive copy)라고 합니다.

드디어 코드는 의도한대로 동작하겠지만, 비교문은 여전히 복잡하며 매번 객체를 전체적으로 복사하는건 성능면에서 좋지 않습니다. 또, 객체의 전달 방식이나 사용 방식을 예의주시해야하는 번거로움도 수반됩니다.

### 불변 객체일 때

이제 todos 모델 객체의 update 메서드를 [Immutable.js](https://facebook.github.io/immutable-js/)를 이용해 불변 객체로 관리하도록 변경해보겠습니다.

{% prism javascript "
// todos.js
class Todos extends events.EventEmitter {
    constructor() {
        this._todos = new Immutable.List();
    }

    // ... 생략 ...

    update(id, label) {
        // 새로운 List 객체를 생성한다.
        this._todos = this._todos.update(
            this._todos.findIndex(t => t.get('id') === id),
            t => t.set('label', label) // 새로운 todo 객체를 생성한다.
        )

        this.emit('update');
    }
}
" %}

todos 객체의 생성자 메서드를 통해 Immutable.js의 List 객체를 생성하고 있습니다. 특정 todo 객체의 값을 변경할 때는 List 객체의 update 메서드를 이용해 새로운 상태를 갖는 todo 객체와 List 객체를 다시 생성하여 설정합니다.

{% prism javascript "
// todoItem.js
shouldComponentUpdate(nextProps, nextState) {
    return (
        nextProps.todo !== this.props ||
        nextState.label !== this.state.label
    );
}
" %}

이제 비교문이 다시 단순해졌습니다. 객체의 상태가 변하지 않는 한 참조는 항상 같을 것이고, 객체의 상태가 변경될때만 새로운 객체가 생성되므로 참조가 달라집니다. 따라서 단순히 참조만 비교하는 것 만으로도 객체의 상태가 변경됐는지 판단할 수 있습니다.

매번 객체를 새로 생성하면 메모리 관리 시스템에 부담을 줄 수 있다고 생각할 수 있지만 이 점이 시스템 전체적인 병목을 일으키진 않습니다. 오히려 객체의 값을 전체적으로 복사하는 방어적 복사가 더 부담이 될 수 있습니다.

## 정리

불변 객체는 값을 복사할 필요 없습니다. 객체를 복사할 때는 항상 같은 객체를 참조하는 주소만 반환하면 됩니다. 즉, 객체를 하나 생성하고 이를 지속적으로 재사용할 수 있습니다(Intern) 이처럼 불변 객체는 복사를 단순화할 수 있어 성능적으로 유리할 수 있습니다. 동일한 값을 여러번 복사해도 참조를 위한 포인터 크기 만큼만 메모리가 늘어날 뿐입니다.

또한 React.js의 `shouldComponentUpdate` 메서드를 통해 알 수 있듯이 비교문을 크게 단순화할 수 있습니다. 이 점이 React.js에서 불변 객체를 사용했을때 가장 피부로 체감할 수 있는 부분입니다. 단순한 비교문은 코드를 관리하기 쉽게 만들어줍니다. 반면, 가변 객체를 여러 뷰 컴포넌트에서 의존하면 이를 추적하고 관리하기 쉽지 않을 뿐더러 비교문도 작성하기 어렵습니다.

[Flux 아키텍처](https://facebook.github.io/flux)에서 말하는 단방향 데이터 흐름과 Immutable.js의 불변 객체, 그리고 수동적인 뷰 특징을 가진 리액트 컴포넌트가 한데 어울어지면 보다 단순하고 사고하기 쉬운 프로그램을 작성할 수 있습니다.

## 참고

* [위키피디아:불변객체(한글)](https://ko.wikipedia.org/wiki/%EB%B6%88%EB%B3%80%EA%B0%9D%EC%B2%B4)
* [위키피디아:인턴(영어)](https://en.wikipedia.org/wiki/String_interning)
* [7 Patterns to Refactor JavaScript Applications(한글)](http://wit.nts-corp.com/2015/03/04/3118)
* [켄트 벡의 구현 패턴](http://www.yes24.com/24/Goods/2824034?Acode=101)
