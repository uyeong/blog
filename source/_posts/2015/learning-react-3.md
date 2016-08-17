---
title: React.js를 이해하다(3)
description: 일본의 개발자 koba04님이 작성한 React.js Advent Calendar를 번역한 글로, React.js를 보다 쉽게 접근하고 이해하기 쉽게 설명합니다. 이 글은 시리즈로 작성됐으며 이 문서는 그 중 세번째 편입니다.
date : 2015-06-27
category: JavaScript
tags:
    - JavaScript
    - React
---

{% alert info '읽기전에...' '
이 문서는 [koba04](http://qiita.com/koba04)님이 작성한 [React.js Advent Calendar](http://qiita.com/advent-calendar/2014/reactjs)를 번역한 것입니다. 본래 원문서는 캘린더 형식으로 소개하지만 여기에서는 회를 나눠 작성할 생각입니다. 또한, React 버전 0.12.1 때 작성된 문서이기 때문에 현 버전과 다른 점이 있을 수 있습니다. 최대한 다른 부분을 노트로 작성할 생각이지만, 만약 생략된 부분이 있다면 댓글로 알려주시면 감사하겠습니다.
' %}

이번에는 컴포넌트의 라이프사이클(Lifecycle)을 소개하겠습니다. 

## Component Lifecycle

React.js는 컴포넌트의 상태 변화에 맞춰 호출되는 여러 가지 메서드를 제공 합니다. 그 메서드를 사용해 초기화나 후처리 등을 할 수 있습니다. 자주 사용하는 메서드는 componenetDidMount()나 componentWillUnmount() 입니다. componentDidMount()에서 이벤트를 등록하고 componentWillUnmount()에서 이벤트를 해제하는 패턴을 많이 사용합니다.

### componentWillMount()

컴포넌트가 DOM 트리에 추가되기 전 한 번만 호출됩니다. 초기화 처리를 하는 데 사용할 수 있습니다. 이 안에서 setState하면 render 시에 사용됩니다. **Server-side rendering 시에도 호출되므로 어느 쪽에서도 동작할 수 있는 코드를 작성해야 합니다.**

{% alert info '역자노트' '
Server-side rendering 시에도 호출 되므로 대도록 이 Lifecycle 메서드에서 DOM을 컨트롤 하는 브라우저에서만 동작하는 로직을 작성하면 안됩니다. Node.js 환경에서는 DOM이 없으므로 에러가 발생하게 됩니다.
' %}

### componentDidMount()

컴포넌트가 DOM 트리에 추가된 상태에 호출됩니다. DOM과 관련된 초기화를 하고 싶을 때 편리하게 사용할 수 있습니다. componentWillMount()와 다른 게 **Server-side rendering 시에 호출되지 않습니다.** 따라서 DOM을 다루는 처리 외에, Ajax 요청이나 setInterval 등의 Server-side rendering 시에는 불필요한 초기화 처리는 이 메서드를 통해 진행합니다.

### componentWillReceiveProps(nextProps)

Prop이 갱신될 때 호출됩니다. 컴포넌트가 새로운 DOM 트리에 추가될 때는 호출되지 않습니다. 부모 컴포넌트의 State가 Prop으로 전달되고, 그 값이 변화한 할 때 화면의 표시 이외 Notification 같은 추가 작업을 이 메서드를 통해 할 수 있습니다. 마지막으로 Prop의 값에 따라 State의 값을 갱신 할 때에도 사용합니다.

### shouldComponentUpdate()

이 메서드는 다른 메서드 Lifecycle 메서드와 달리 true나 false를 반환할 필요가 있습니다. 컴포넌트가 rerender 하기 전에 호출되며, 만약 false를 반환하면 VirtualDOM 비교를 하지 않고 rerender도 하지 않습니다. 즉, 독자적으로 Prop이나 State 비교 처리를 구현하는 것으로 불필요한 계산을 하지 않을 수 있습니다. 보통 성능 향상을 목적으로 사용합니다. 이 메서드가 반환하는 기본값은 true 이므로 재정의 하지 않으면 항상 rerender 합니다. 강제적으로 rerender 하고자 할땐 forceUpdate()를 사용합니다. forceUpdate()가 호출되는 경우엔 shouldComponentUpdate()는 호출되지 않습니다.

Porp과 State가 Immutable한 데이터라면 다음과 같이 단순한 객체 비교로 구현이 가능합니다.

{% prism js '
shouldComponentUpdate: function(nextProps, nextState) {
  return nextProps.user !== this.props.user || nextState.user !== this.state.user;
}
' %}

### componentWillUpdate(nextProps, nextState)

컴포넌트가 갱신되기 전에 호출됩니다. 최초엔 호출되지 않습니다. 이 안에서는 setState를 호출할 수 없으므로 Prop의 값을 이용해 setState 하고 싶은 경우엔 componentWillReceiveProps()를 사용합니다.

### componentDidUpdate(prevProps, prevState)

컴포넌트가 갱신된 뒤에 호출됩니다. 최초엔 호출되지 않습니다. DOM의 변화에 hook 하여 또 다른 작업을 하고 싶을 때 사용할 수 있습니다.

### componentWillUnmount()

컴포넌트가 DOM에서 삭제될 때 호출됩니다. 이벤트 해제 같은 clean-up 처리 시 할 때 사용합니다. ComponentDidMount()에서 등록한 Timer의 처리나 DOM의 이벤트 등은 여기에서 해제해야 합니다.

### 추가

#### isMounted()

개발 시 Ajax를 요청하고 그 결과를 setState 하는 패턴이 자주 발생합니다. 그때 Ajax의 응답이 왔을 때 컴포넌트가 이미 Unmount 된 경우가 있는데, 바로 setState나 forceUpdate를 호출하면 에러가 발생하게 됩니다. 따라서 isMounted()를 사용해 방어 코드를 작성할 필요가 있습니다.

{% prism js "
componentDidMount() {
  request.get('/path/to/api', res => {
    if (this.isMounted()) {
      this.setState({data: res.body.data});
    }
  });
}
" %}

여기까지 컴포넌트의 Lifecycle를 소개했습니다. 다음절에서는 이벤트를 소개하겠습니다.

## React.js의 이벤트

이번 절에서는 DOM 이벤트 처리를 소개하겠습니다.

### SyntheticEvent

React.js에서는 DOM을 VIRTUAL DOM으로 랩핑한 것처럼 DOM의 이벤트 객체도 SyntheticEvent이라는 객체로 랩핑하여 크로스 브라우저에 대응하고 있습니다. SyntheticEvent의 인터페이스는 아래와 같습니다.

 * **boolean** bubbles
 * **boolean** cancelable
 * **DOMEventTarget** currentTarget
 * **boolean** defaultPrevented
 * **Number** eventPhase
 * **boolean** isTrusted
 * **DOMEvent** nativeEvent
 * **void** preventDefault()
 * **void** stopPropagation()
 * **DOMEventTarget** target
 * **Date** timeStamp
 * **String** type

이처럼 preventDefault()나 stopPropagation() 그리고 target 등을 지금까지 다뤘던 방식으로 사용할 수 있습니다. 추가로 이벤트 리스너에서 false를 반환하는 방법으로 이벤트의 전파를 정지할 수 있었지만, 이 방법은 이해하기 어렵다는 이유로 React.js 버전 0.12에서는 사용할 수 없도록 변경됐습니다.

### 이벤트 핸들러

기본적인 이벤트는 모두 지원하고 있습니다. 예를 들어 click 이벤트를 처리하고 싶은 경우엔 아래와 같이 작성합니다.

{% prism jsx "
var Counter = React.createClass({
  getInitialState() {
    return {
      count: 0
    };
  },
  onClick(e) {
    // e is SyntheticEvent
    this.setState({ count: this.state.count + 1 });
  },
  render() {
    return (
      <div>
        <span>click count is {this.state.count}</span>
        <button onClick={this.onClick}>click!</button>
      </div>
    );
  }
});
" %}

`onClick={this.onClick}`으로 클릭 이벤트를 받고 있습니다. 이때 React.js는 컴포넌트의 문맥을 리스너에 bind 해주므로 따로 `this.onClick.bind(this)`와 같은 별도의 바인딩 작업이 필요하지 않습니다. 따라서 리스너 내에서 바로 this.setState()와 같은 메서드를  사용할 수 있습니다. 참고로 자동으로 this를 바인딩하는 동작은 앞으로 ES6의 ArrowFunction를 사용하도록 권고하고 지원하지 않을 수 있습니다.

{% alert info '역자노트' '
객체 리터럴로 컴포넌트를 생성할때는 실행 문맥 바인드가 필요 없지만 ES6 Classes 문법으로 작성할 땐 필요합니다.([참고](http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html))
' %}

### Event delegation

Event Delegation은 jQuery에도 널리 알려진 대중적인 개념입니다. React.js는 자동으로 최상위 요소에만 이벤트를 등록하고 그곳에서 이벤트를 취합하여 내부에서 관리하는 맵핑 정보를 바탕으로 대응하는 컴포넌트에 이벤트를 발행합니다. 이때 이벤트는 캡처링, 버블링 되는데, 각 리스너마다 SyntheticEvent의 객체가 만들어지기 때문에 메모리의 얼로케이트를 여러 번 할 필요가 있습니다. 이 문제를 해결하기 위해 React.js는 객체를 풀(pool)로 관리하고 재사용하여 가비지 컬렉터의 횟수를 줄일 수 있도록 구현돼 있습니다. 추가로 DOM에 설정된 data-reactid을 사용해서 맵핑하고 있는 것 같습니다. 그리고 id로 부모와 자식 관계를 알 수 있도록 디자인돼 있습니다.([참고](http://react-serverside-rendering.herokuapp.com))

{% prism jsx '
<ul class="nav nav-pills nav-justified" data-reactid=".1px6jd5i1a8.1.0.0.0.1.0">
  <li class="" data-reactid=".1px6jd5i1a8.1.0.0.0.1.0.0">
    <a href="/artist" data-reactid=".1px6jd5i1a8.1.0.0.0.1.0.0.0">Artist</a>
  </li>
  <li class="" data-reactid=".1px6jd5i1a8.1.0.0.0.1.0.1">
    <a href="/country" data-reactid=".1px6jd5i1a8.1.0.0.0.1.0.1.0">Country</a>
  </li>
</ul>
' %}

### Not provided event

React.js가 지원하는 기본적인 이벤트 외에 window의 resize 이벤트나 jQuery Plugin의 독자 포멧 이벤트를 사용하고 싶은 경우 componentDidMount()에서 addEventListener를 통해 이벤트를 등록하고 componentWillUnmount()를 이용해 removeEventListener 하여 이벤트를 해제해 사용합니다.([참고](http://facebook.github.io/react/tips/dom-event-listeners.html)) 참고로 이 경우 역시 this를 자동으로 bind 합니다.

{% prism jsx "
var Box = React.createClass({
  getInitialState() {
    return {
      windowWidth: window.innerWidth
    };
  },
  handleResize(e) {
    this.setState({windowWidth: window.innerWidth});
  },
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  render() {
    return <div>Current window width: {this.state.windowWidth}</div>;
  }
});

React.render(<Box />, mountNode);
" %}

글로벌 이벤트를 선언하는 방법에 여러 논의가 있었습니다. [이슈285](https://github.com/facebook/react/issues/285)을 참고하세요.

### touch event

터치 이벤트는 기본적으로 비활성화 돼 있습니다. 활성화하고 싶은 경우엔 `React.initializeTouchEvents(true)`를 호출합니다.

여기까지 Event를 정리했습니다. 다음으로 Form을 다루는 방법을 소개하겠습니다.

## React.js에서 폼 다루기

이번 절에서는 React.js에서 폼을 다루는 방법을 소개하겠습니다. React.js에서는 아래와 같이 Input 폼을 작성하면 변경할 수 없는 텍스트 필드가 생성됩니다.([데모](http://jsfiddle.net/koba04/kb3gN/8198/))

{% prism jsx '
<input type="text" value="initial value" />
<input type="text" value={this.state.textValue} />
' %}

### Controlled Component

Controlled Component는 State에 따라 값을 관리하는 Componenet 입니다. 이를 이용해 텍스트 필드를 재작성합니다.

{% prism jsx '
var Text = React.createClass({
  getInitialState() {
    return {
      textValue: "initial value"
    };
  },
  changeText(e) {
    this.setState({textValue: e.target.value});
  },
  render() {
    return (
      <div>
        <p>{this.state.textValue}</p>
        <input type="text" value={this.state.textValue} onChange={this.changeText} />
      </div>
    );
  }
});
' %}

value를 State로 관리하고, onChange()에서 setState()하여 명시적으로 값을 갱신하고 전달합니다.

### UnControlled Component

UnControlled Componenent는 반대로 값을 관리하지 않는 컴포넌트로 초기값을 설정한 값은 defaultValue로 지정합니다. 이 경우는 앞 절에서처럼 onChange()에서 항상 값을 state에 반영해도 되고, 반영하고 싶을 때만 DOM에서 value를 취득하여 갱신하는 것도 가능합니다.

{% prism jsx '
var LiveText = React.createClass({
  getInitialState() {
    return {
      textValue: "initial value"
    };
  },
  changeText(e) {
    this.setState({textValue: this.refs.inputText.getDOMNode().value });
  },
  render() {
    return (
      <div>
        <p>{this.state.textValue}</p>
        <input type="text" ref="inputText" defalutValue="initial value" />
        <button onClick={this.changeText}>change</button>
      </div>
    );
  }
});
' %}

### textarea

textarea의 경우도 텍스트 필드와 마찬가지로 value를 지정합니다. HTML 처럼 `<textarea>xxx</textarea>` 으로 작성하면 xxx는 defaultValue로 취급됩니다.([데모](http://jsfiddle.net/koba04/wkkvrh4m/2/))

{% prism jsx "
var OreTextArea = React.createClass({
  getInitialState() {
    return {
      textAreaValue: 'initial value'
    };
  },
  onChangeText(e) {
    this.setState({textAreaValue: e.target.value});
  },
  onClick() {
    this.setState({textAreaValue: this.refs.textArea.getDOMNode().value});
  },
  render() {
    return (
      <div>
        <div>{this.state.textAreaValue}</div>
        <div>
          <textarea value={this.state.textAreaValue} onChange={this.onChangeText} />
        </div>
        <div>
          <textarea ref=\"textArea\">this is default value</textarea>
          <button onClick={this.onClick}>change</button>
        </div>
      </div>
    );
  }
});
" %}

### 셀렉트 박스

셀렉트 박스도 역시 value를 지정합니다. `multiple={true}`와 같이 Prop을 지정하면 요소를 복수로 선택할 수 있습니다.([데모](http://jsfiddle.net/koba04/khdftsuu/))

{% prism jsx "
var OreSelectBox = React.createClass({
  getDefaultProps() {
    return {
      answers: [1, 10, 100, 1000]
    };
  },
  getInitialState() {
    return {
      selectValue: 1,
      selectValues: [1,100]
    };
  },
  onChangeSelectValue(e) {
    this.setState({selectValue: e.target.value});
  },
  // 더 좋은 방법이 있을지...
  onChangeSelectValues(e) {
    var values = _.chain(e.target.options)
      .filter(function(option) { return option.selected })
      .map(function(option) { return +option.value })
      .value()
    ;
    this.setState({selectValues: values});
  },
  render() {
    var options = this.props.answers.map(function(answer) {
      return <option value={answer} key={answer}>{answer}</option>;
    });
    return (
      <div>
        <div>selectValue: {this.state.selectValue}</div>
        <div>
          <select value={this.state.selectValue} onChange={this.onChangeSelectValue}>
            {options}
          </select>
        </div>
        <div>selectValues: {this.state.selectValues.join(',')}</div>
        <div>
          <select multiple={true} defaultValue={this.state.selectValues} onChange={this.onChangeSelectValues}>
            {options}
          </select>
        </div>
      </div>
    );
  }
});
" %}

### LinkedStateMixin

LinkedStateMixin이라는 addon을 사용하면 앞에서 처럼 onChange()를 일일이 구현하지 않아도 state에 반영할 수 있습니다. 체크박스에 사용할 때는 checkLink를 사용합니다.

{% prism jsx "
var React = require('react/addons');
var LinkedStateMixin = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState() {
    return {
      textValue: 'initial value'
    }
  },
  render() {
    return (
      <div>
        <div>value: {this.state.textValue}</div>
        <input type=\"text\" valueLink={this.linkState('textValue')} />
      </div>
    );
  }
});
" %}

이 mixin이 하고 있는 것은 간단합니다. 내부 로직을 한번 살펴보는 것도 재미있을 것 같습니다.

#### LinkedStateMixin의 동작 방식

우선 Mixin해서 사용하는 linkState의 내부 로직을 보면 value와 무엇인가 작성한 Setter를 전달해서 ReactLink 객체의 인스턴스를 생성해 반환하고 있습니다.([참고](https://github.com/facebook/react/blob/3aa56039c60add45eb30f1edbaf40ddf195c54ce/src/addons/link/LinkedStateMixin.js#L31-L36))

{% prism js "
linkState: function(key) {
  return new ReactLink(
    this.state[key],
    ReactStateSetters.createStateKeySetter(this, key)
  );
}
" %}

ReactStateSetters.createStateKeySetter의 내부를 보면 전달된 State의 키에 대응해서 setState를 하는 함수를 반환하고 있습니다.([참고](https://github.com/facebook/react/blob/3aa56039c60add45eb30f1edbaf40ddf195c54ce/src/core/ReactStateSetters.js#L45-L61))

{% prism js "
  createStateKeySetter: function(component, key) {
    // Memoize the setters.
    var cache = component.__keySetters || (component.__keySetters = {});
    return cache[key] || (cache[key] = createStateKeySetter(component, key));
  }
};

function createStateKeySetter(component, key) {
  // Partial state is allocated outside of the function closure so it can be
  // reused with every call, avoiding memory allocation when this function
  // is called.
  var partialState = {};
  return function stateKeySetter(value) {
    partialState[key] = value;
    component.setState(partialState);
  };
}
" %}

ReactLink의 Constructor(생성자)에서는 값(value)과 requestChange(createStateKeySetter에서 반환한 함수)를 프로퍼티로 설정합니다.([참고](https://github.com/facebook/react/blob/3aa56039c60add45eb30f1edbaf40ddf195c54ce/src/addons/link/ReactLink.js#L44-L47))

{% prism js "
function ReactLink(value, requestChange) {
  this.value = value;
  this.requestChange = requestChange;
}
" %}

여기에서, valueLink의 Prop을 살펴보면 requestChange에 전달하는 인자는 `e.target.value`라는 사실을 알 수 있습니다.([참고](https://github.com/facebook/react/blob/3aa56039c60add45eb30f1edbaf40ddf195c54ce/src/browser/ui/dom/components/LinkedValueUtils.js#L58-L69))

{% prism js "
function _handleLinkedValueChange(e) {
  /*jshint validthis:true */
  this.props.valueLink.requestChange(e.target.value);
}

/**
  * @param {SyntheticEvent} e change event to handle
  */
function _handleLinkedCheckChange(e) {
  /*jshint validthis:true */
  this.props.checkedLink.requestChange(e.target.checked);
}
" %}

input의 컴포넌트를 보면, onChange 이벤트에 valueLink가 있으면 _handleLinkedValueChange를 호출하여 그 결과, setState 한다는 것을 알 수 있습니다.([참고1](https://github.com/facebook/react/blob/3aa56039c60add45eb30f1edbaf40ddf195c54ce/src/browser/ui/dom/components/LinkedValueUtils.js#L140-L149), [참고2](https://github.com/facebook/react/blob/3aa56039c60add45eb30f1edbaf40ddf195c54ce/src/browser/ui/dom/components/ReactDOMInput.js#L114-L119))

{% prism js "
getOnChange: function(input) {
  if (input.props.valueLink) {
    _assertValueLink(input);
    return _handleLinkedValueChange;
  } else if (input.props.checkedLink) {
    _assertCheckedLink(input);
    return _handleLinkedCheckChange;
  }
  return input.props.onChange;
}
" %}

{% prism js "
_handleChange: function(event) {
  var returnValue;
  var onChange = LinkedValueUtils.getOnChange(this);
  if (onChange) {
    returnValue = onChange.call(this, event);
  }
" %}

여기까지 폼을 다루는 방법을 소개했습니다. 마지막에 간단한 Mixin을 살펴봄으로써 Mixin이 동작하는 방식도 알 수 있을 것이라 생각합니다. 다음 절에서는 React.js의 VIRTUAL DOM 구현에서 중요한 역할을 맡고 있는 key 속성을 소개하겠습니다.

## React.js에서 중요한 key

이번 절에서는 React.js의 Virtual DOM 구현의 내에서도 유저가 인지할 수 있는 Key를 소개하겠습니다. React.js에서는 Prop에 key라는 값을 지정할 수 있고 컴포넌트의 리스트를 렌더링할 때 이를 지정하지 않으면 Development 환경에서 아래와 같은 경고가 출력됩니다.

{% prism text "
Each child in an array should have a unique \"key\" prop. Check the render method of KeyTrap. See http://fb.me/react-warning-keys for more information.
" %}

이 key는 VIRTUAL DOM과 비교하여 실제 DOM에 반영할 때 최소한으로 변경하기 위해 사용됩니다. key를 사용하는 예는 다음과 같습니다.([참고](http://jsfiddle.net/koba04/tttLsmuL/))

{% prism jsx "
var KeySample = React.createClass({
  getInitialState() {
    return {
      list: [1,2,3,4,5]
    };
  },
  add() {
    this.setState({ list: [0].concat(this.state.list) });
  },
  render() {
    var list = this.state.list.map(function(i) { return <li key={i}>{i}</li> });
    return (
      <div>
        <ul>{list}</ul>
        <button onClick={this.add}>add</button>
      </div>
    );
  }
});
" %}

위와 같은 원소로 유니크한 ID가 지정돼 있는 배열을 리스트로 출력하는 컴포넌트가 있다고 했을때, 새로 추가 시 배열의 앞에 0을 추가하면 DOM에도 실제로 변경이 필요한 부분만 반영됩니다. 만약 key를 사용하지 않으면 이런 비교가 불가능하여 전체 리스트를 갱신하게 됩니다. 이 예제에는 문제가 있는데 한번 추가한 후 다시 추가하면 0이라는 key를 가진 배열이 계속 추가되므로 실제로 변경된 사항이 없다 판단하여 DOM은 바뀌지 않습니다. 이러 형태의 문제가 발생했을때는 아래와 같은 경고가 출력됩니다.

{% prism text "
Warning: flattenChildren(...): Encountered two children with the same key, .$0. Child keys must be unique; when two children share a key, only the first child will be used.
" %}

key를 제거하고 예제를 실행하면 같은 값을 가지는 엘리먼트가 계속 추가됩니다. 이와 비슷한 아이디어는 Angular.js의 track by와 Vue.js의 trackby 등 다른 라이브러리나 프레임워크에서도 만날 수 있습니다.

### key must by unique

위 경고로 알 수 있듯이 key는 해당 리스트에서 반드시 유니크한 값으로 지정할 필요가 있습니다. 예를 들어 사용자 목록을 출력한다면 사용자의 ID가 key로 사용될 수 있습니다. 배열의 index를 key로 지정하는 것은 사실 큰 의미가 없습니다.

### ReactCSSTransitionGroup

React.js에는 CSS 애니메이션을 위한 addon이 있습니다. 이는 애니메이션 대상이 되는 요소가 1개인 경우에도 key를 지정해야합니다. 이는 ReactCSSTransitionGroup에서 요소의 추가, 삭제를 추적해야 하기 때문에 key를 필요로 하는 것 같습니다.(실제 구현을 살펴보진 않았습니다.) ReactCSSTransitionGroup에 관해서는 추후 다시 소개하겠습니다.

### 추가 내용

마지막으로 [React.js and Dynamic Children - Why the Keys are Important](http://blog.arkency.com/2014/10/react-dot-js-and-dynamic-children-why-the-keys-are-important/)을 참고해 key에 관해 생략된 부분을 소개하겠습니다.

{% prism jsx "
<CountriesComponent>
  <TabList />  {/* 나라 리스트 */}
  <TabList />  {/* 위 나라에 해당하는 도시 리스트 */}
</CountriesComponent>
" %}

위와같은 컴포넌트를 구성하고 있고 TabList는 각각 활성화된 탭의 index를 State로 가지고 있다고 합시다. 그리고 국가 목록을 변경했을 때 도시 목록의 활성화된 index도 0으로 되돌리고 싶지만 의도한대로 동작하지 않습니다. getInitialState()에 활성화 index가 0으로 초기화 되도록 작성돼 있습니다. 따라서 나라가 변경됐을 때 도시 목록의 TabList는 나라에 대응한 도시의 리스트로 갱신되면서 초기화 될 것으로 보이지만 실제로 TabList를 재사용하므로 목록만 갱신됩니다. 즉, getInitialState()가 호출되지 않아 활성화 index가 갱신되지 않아 발생하는 문제입니다.

이 문제는 TabList에 key를 지정하고 국가가 달라졌을 때 도시 컴포넌트가 다시 생성되도록 하는 방식으로 해결할 수 있습니다.즉, key를 명시함으로써 새로운 컴포넌트를 만들도록 할 수 있습니다.

{% prism jsx '
<CountriesComponent>
  <TabList key="countriesList" />
  <TabList key={this.state.currentCountry} />
</CountriesComponent>
' %}

위 블로그에도 언급돼 있지만 이런 경우엔 TabList 컴포넌트에서 활성화 index를 State로 관리하는게 아니라 ContriesComponent가 관리하고 Prop으로 활성화 index를 TabList 컴포넌트에 전달하는게 더 맞는 방법인 것 같습니다.

## 정리

여기까지 React.js 컴포넌트의 Lifecycle과 이벤트 그리고 폼과 Key를 소개했습니다. 다음 편에서는 VIRTUAL DOM의 장점과 믹스-인 등을 소개하겠습니다.
