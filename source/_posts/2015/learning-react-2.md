---
title: React.js를 이해하다(2)
description: 일본의 개발자 koba04님이 작성한 React.js Advent Calendar를 번역한 글로, React.js를 보다 쉽게 접근하고 이해하기 쉽게 설명합니다. 이 글은 시리즈로 작성됐으며 이 문서는 그 중 두번째 편입니다.
permalink: learning-react-2
date : 2015-06-24
category:
    - JavaScript
    - React
tags:
    - JavaScript
    - React
---

{% alert info 읽기전에... %}
이 문서는 [koba04](http://qiita.com/koba04)님이 작성한 [React.js Advent Calendar](http://qiita.com/advent-calendar/2014/reactjs)를 번역한 것입니다. 본래 원문서는 캘린더 형식으로 소개하지만 여기에서는 회를 나눠 작성할 생각입니다. 또한, React 버전 0.12.1 때 작성된 문서이기 때문에 현 버전과 다른 점이 있을 수 있습니다. 최대한 다른 부분을 노트로 작성할 생각이지만, 만약 생략된 부분이 있다면 댓글로 알려주시면 감사하겠습니다.
{% endalert %}

전편에서 잠깐 등장한 Props을 소개하겠습니다.

## React.js의 Prop

### 기본 사용법

Prop은 컴포넌트의 속성(어트리뷰트)으로 정의하고 컴포넌트 내에서는 `this.props.xxx`로 참조해 사용합니다. 이것이 전부입니다. Prop으로는 객체, 함수 등 어떤 타입이든 지정할 수 있습니다.

{% prism jsx %}
var Avatar = React.createClass({
  render() {
    var avatarImg = `/img/avatar_${this.props.user.id}.png`;

    return(
      <div>
        <span>{this.props.user.name}</span>
        <img src={avatarImg} />
      </div>
    );
  };
});

var user = {
  id: 10,
  name: 'Hoge'
};

// <Avatar user={user} />
{% endprism %}

### I/F(인터페이스)로써의 Prop

Prop은 외부에서 전달하는 값이지 그 컴포넌트가 자체적으로 관리하는 값이 아니므로 내부에서 변경하면 안 됩니다. 컴포넌트가 관리할 필요가 있는 값은 다음 절에서 소개할 State로 정의해야 합니다. 즉, Prop은 Immutable(불변) 하며 외부와 I/F로써 작용합니다.

### PropTypes

컴포넌트의 Prop은 외부로부터 값을 지정받기 때문에 검증(벨리데이션)이 필요합니다. 이때 React.js에서는 PropsTypes으로 Prop에 대한 타입 제약을 지정할 수 있습니다. 화려하진 않지만 좋은 기능입니다.

{% prism jsx %}
var Avatar = React.createClass({
  propTypes: {
    name:   React.PropTypes.string.isRequired,
    id:     React.PropTypes.number.isRequired,
    width:  React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    alt:    React.PropTypes.string
  },
  render() {
    var src = `/img/avatar/${this.props.id}.png`;
    return (
      <div>
        <img src={src} width={this.props.width} height={this.props.height} alt={this.props.alt} />
        <span>{this.props.name}</span>
      </div>
    );
  }
});

<Avatar name=\"foo\" id=1 width=100 height=100 />
{% endprism %}

위와 같은 느낌으로 작성합니다. PropTypes을 지정하는 것으로 컴포넌트의 I/F를 조금 더 명확하게 표현할 수 있습니다. PropTypes의 지정은 아래와 같은 느낌으로 유연하게 지정할 수 있습니다.

{% prism js %}
React.PropTypes.array           // 배열
React.PropTypes.bool.isRequired // Boolean, 필수
React.PropTypes.func            // 함수
React.PropTypes.number          // 정수
React.PropTypes.object          // 객체
React.PropTypes.string          // 문자열
React.PropTypes.node            // Render가 가능한 객체
React.PropTypes.element         // React Element
React.PropTypes.instanceOf(XXX) // XXX의 instance
React.PropTypes.oneOf(['foo', 'bar']) // foo 또는 bar
React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.array]) // 문자열 또는 배열
React.PropTypes.arrayOf(React.PropTypes.string)  // 문자열을 원소로 가지는 배열
React.PropTypes.objectOf(React.PropTypes.string) // 문자열을 값으로 가지는 객체
React.PropTypes.shape({                          // 지정된 형식을 충족하는지
  color: React.PropTypes.string,
  fontSize: React.PropTypes.number
});
React.PropTypes.any.isRequired  // 어떤 타입이든 가능하지만 필수

// 커스텀 제약도 정의 가능
customPropType: function(props, propName, componentName) {
  if (!/^[0-9]/.test(props[propName])) {
    return new Error('Validation failed!');
  }
}
{% endprism %}

아래와 같이 제일 처음 소개한 예제 코드에 PropTypes를 정의할 수 있습니다.

{% prism jsx %}
var Avatar = React.createClass({
  propTypes: {
    user: React.PropTypes.shape({
      id:   React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired
    })
  },
  render() {
    var avatarImg = `/img/avatar_${this.props.user.id}.png`;
    return(
      <div>
        <span>{this.props.user.name}</span>
        <img src={avatarImg} />
      </div>
    );
  }
});
{% endprism %}

주의점으로는 React.js의 제약은 성능적인 이유로 실 서비스 환경에서는 검증하지 않습니다. 또 개발 환경에서도 에러가 발생하는 것이 아닌 `console.warn`으로 출력됩니다. 에러가 발생하도록 변경해 달라는 issue도 등록됐었기 때문에 앞으로 어떻게 변경될진 모르겠습니다.

{% alert info 역자노트 %}
ES6에서 PropTypes을 지정하는 방식은 다음과 같습니다.
<pre><code class="language-js">
class Avatar extends React.Component {
  render() {
    var avatarImg = `/img/avatar_${this.props.user.id}.png`;

    return(
      &lt;div>
        &lt;span>{this.props.user.name}&lt;/span>
        &lt;img src={avatarImg} />
      &lt;/div>
    );
  }
}

Avatar.propTypes =  {
  user: React.PropTypes.shape({
    id:   React.PropTypes.number.isRequired,
    name: React.PropTypes.string.isRequired
  })
};

export default Avatar;
</code></pre>
{% endalert %}

### 기본값 지정

getDefaultProps()에서 리터럴 객체를 반환하면 기본값으로 지정됩니다. 이는 컴포넌트 인스턴스가 만들어질 때 호출되는 것이 아니라 컴포넌트가 정의될 때만 호출되므로 주의가 필요합니다. 다음 절에서 소개할 getInitialState()은 다릅니다.

{% prism jsx %}
var Hello = React.createClass({
  getDefaultProps() {
    return {
      name: 'React'
    };
  },
  render() {
    return <div>Hello {this.props.name}</div>
  }
});

// <Hello />
{% endprism %}

{% alert info 역자노트 %}
ES6에서 PropTypes을 지정하는 방식은 다음과 같습니다.
<pre><code class="language-jsx">
class Hello extends React.Component {
  render() {
    return &lt;div>Hello {this.props.name}&lt;/div>
  }
}

Hello.defaultProps = {
  name: 'React'
};

export default Hello;

// &lt;Hello />
</code></pre>
{% endalert %}

### setProps & replaceProps

컴포넌트에 새로운 Prop을 전달하고 다시 rerender 하고 싶은 경우엔 setProps()와 replaceProps()를 사용합니다. 이 메서드를 이용하면 Prop을 갱신하면서 rerender 할 수 있습니다.

{% prism jsx %}
var Test = React.createClass({
  getDefaultProps: function() {
    return {
      id: 1
    };
  },
  render: function() {
    return (
      <div>{this.props.id}:{this.props.name}</div>
    );
  }
});

var component = React.render(<Test name=\"bar\" />, document.body);

component.setProps({ name: \"foo\" });      // <div>1:foo</div>
component.replaceProps({ name: \"hoge\" }); // <div>:hoge</div>
{% endprism %}

setProps()은 기존의 Prop과 새로운 Prop을 합치(merge)지만 replaceProps()는 대체합니다. 그리고 각각 두 번째 인수에 콜백 함수를 지정할 수 있습니다.

{% alert info 역자노트 %}
replaceProps()는 ES6에서 사용할 수 없으며, 곧 제거될 예정입니다.
{% endalert %} 

여기까지 React.js의 Prop을 살펴봤습니다. 다음 절에서는 State를 소개하겠습니다.

## React.js의 State

Porp은 Immutable하지만 State는 Mutable(이변)한 값을 정의할 수 있습니다.

### 기본 사용법

getInitialState()을 이용해 state의 초기값을 반환하고 데이터 변경이 있는 경우 this.setState()로 갱신합니다. 상태가 갱신되면 컴포넌트가 rerender 되어 UI가 갱신됩니다. 이때, 자식 컴포넌트도 함께 rerender 됩니다.

{% prism jsx %}
var Counter = React.createClass({
  getInitialState() {
    return {
      count: 0
    };
  },
  onClick() {
    this.setState({ count: this.state.count + 1});
  },
  render() {
    return (
      <div>
        <span>{this.state.count}</span>
        <button onClick={this.onClick}>click</button>
      </div>
    );
  }
});
{% endprism %}

setState()의 두 번째에 인수에는 setProps() 처럼 콜백 함수를 지정할 수 있습니다. 또 replaceProps()와 비슷한 replaceState()도 있습니다.

{% alert info 역자노트 %}
replaceState()는 ES6에서 사용할 수 없으며, 곧 제거될 예정입니다.
{% endalert %}

### State를 사용한 UI

State는 텍스트 필드 같은 컴포넌트 내에서 사용자 인터렉션에 따라 변경되는 값을 관리하는 경우에 가장 자주 사용됩니다. 또 컴포넌트 내에서 Ajax로 데이터를 요청하고 성공 시 콜백 함수에서 응답 데이터를 setState() 하는 방식으로도 사용합니다.

### 주의할 점

state의 값을 프로퍼티로 접근해 직접 변경하면 안 되고 반드시 setState()를 사용해 갱신해야 합니다. 이는 setState()가 호출되어야 rerender 되기 때문입니다. this.state 값 자체도 Immutable 하다라고 생각하는 것이 좋습니다. 만약, this.state.list라는 배열이 있고 list에 요소를 추가하고 싶은 경우도 push()하고 setState()하는 것이 아니라 `this.setState({list: this.state.list.concat([value]})`로 새로운 값(배열)을 지정하는 것이 좋습니다. 이 방법이 shouldComponentUpdate()로 성능 최적화 할 때와 undo의 구현 시에 좀 더 유용합니다.

### State는 최소화

Prop만 가지고 있는 Immutable한 컴포넌트가 조작하거나 이해하기 쉬우므로, 기본적으로는 Prop을 고려하고, State를 가진 컴포넌트는 최소화 하는 게 좋습니다. 최상위 컴포넌트만 State를 갖게 하고, 하위 컴포넌트는 전부 Prop만을 가지는 Immutable한 컴포넌트로 구성하여 어떤 변경이 있을 때 최상위 컴포넌트에서 setState()하여 rerender 하는 설계도 가능합니다. 이는 VirtualDOM의 기술을 이용한 설계 방법입니다. 이와 관련된 내용은 다음에 소개하겠습니다.

여기까지 State를 소개했습니다. 다음으로 Prop과 State를 사용한 컴포넌트 간의 상호작용을 소개하겠습니다.

## Prop과 State를 사용한 컴포넌트 상호작용

이번에는 지금까지 소개한 Prop과 State를 사용해 컴포넌트 간 상호작용 하는 방법에 대해서 작성하겠습니다.

### 부모의 State를 자식의 Prop으로 전달

컴포넌트 설계 시 인터페이스를 고려해서 Prop을 설계하고 그 컴포넌트가 관리할 값 중 변경되는 값을 추려 State로 정의합니다. 컴포넌트 간의 부모와 자식 관계를 의식해서 설계해야 합니다. 부모는 State를 갖고 있고, 자식의 Prop으로 값을 전달하는 것이 기본 흐름입니다. 자식은 값을 사용하기만 할 뿐 관리는 부모가 합니다.

{% prism jsx %}
var User = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    id:   React.PropTypes.number.isRequired
  },
  render() {
    return (
      <div>{this.props.id}:{this.props.name}</div>
    );
  }
});
 
var request = require('superagent');
 
var Users = React.createClass({
  getInitialState() {
    return {
      users: [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]
    }
  },
  componentDidMount() {
    request.get('http://example.com/users/', (res) => {
      this.setState({users: res.body.users});
    });
  },
  render() {
    var users = this.state.users.map((user) => {
      return <User id={user.id} name={user.name} key={user.id}/>
    });
    return (
      <div>
        <p>사용자 목록</p>
        {users}
      </div>
    );
  }
});
{% endprism %}

### 자식의 이벤트를 부모에서 처리

자식 컴포넌트 내에서 발생하는 이벤트를 부모에서 처리하고 싶은 경우엔 자식이 이벤트를 처리하기 위한 함수를 Prop 즉, I/F로 공개하고 부모가 자식의 Prop을 이용해 리스너를 전달하는 형태로 처리합니다. 예를 들어 TodoList에서 각 Todo는 자식 컴포넌트가 되고 자식 컴포넌트에 삭제나 편집 기능이 있을 때 삭제와 편집 처리 로직은 부모 컴포넌트에 정의하고 이벤트는 자식 컴포넌트에서 버블링되는 느낌으로 동작합니다.

{% prism jsx %}
var Todo = React.createClass({
  propTypes: {
    todo: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      text: React.PropTypes.string.isRequired
    }),
    // 삭제 처리를 I/F로 정의
    onDelete: React.PropTypes.func.isRequired
  },
  // 부모에게 이벤트 처리를 위임한다.
  _onDelete() {
    this.props.onDelete(this.props.todo.id);
  },
  render() {
    return (
      <div>
        <span>{this.props.todo.text}</span>
        <button onClick={this._onDelete}>delete</button>
      </div>
    );
  }
});
 
var TodoList = React.createClass({
  getInitialState() {
    return {
      todos: [
        {id:1, text: 'advent calendar1'},
        {id:2, text: 'advent calendar2'},
        {id:3, text: 'advent calendar3'}
      ]
    };
  },
  // TodoList는 이 컴포넌트가 관리하고 있으므로 삭제 처리도 여기에 존재한다.
  deleteTodo(id) {
    this.setState({
      todos: this.state.todos.filter((todo) => {
        return todo.id !== id;
      })
    });
  },
  render() {
    var todos = this.state.todos.map((todo) => {
      return <li key={todo.id}><Todo onDelete={this.deleteTodo} todo={todo} /></li>;
    });
    return <ul>{todos}</ul>;
  }
});
 
React.render(<TodoList />, document.body);
{% endprism %}

### State 초기값을 Prop에서 전달

State의 초기값을 Prop에서 전달해야 하는 경우엔 아래와 같이 처리합니다.

{% prism jsx %}
var Counter = React.createClass({
  propTypes: {
    count: React.PropTypes.number
  },
  getDefaultProps() {
    return {
      count: 0
    };
  },
  getInitialState() {
    return {
      count: this.props.count
    }
  },
  onClick() {
    this.setState({ count: this.state.count + 1 });
  },
  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.onClick}>click</button>
      </div>
    );
  }
});
 
// <Counter count=10 />
{% endprism %}

하지만 위와 같은 형태로 작성하면 값이 증가할 때마다 Prop의 count도 함께 증가할 것으로 보이기 때문에 Prop을 초기값으로 사용할 때는 의도를 명확하게 드러내는 이름으로 작성합니다.

{% prism jsx %}
var Counter = React.createClass({
  propTypes: {
    initialCount: React.PropTypes.number
  },
  getDefaultProps() {
    return {
      initialCount: 0
    };
  },
  getInitialState() {
    return {
      count: this.props.initialCount
    }
  },
  onClick() {
    this.setState({ count: this.state.count + 1 });
  },
  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.onClick}>click</button>
      </div>
    );
  }
  :
});
 
// <Counter initialCount=10 />
{% endprism %}

### ref

컴포넌트 내에서 ref 프로퍼티를 사용하여 자식 컴포넌트를 참조할 수 있습니다. 이 프로퍼티를 사용하면 부모에서 자식의 메서드를 호출할 수 있습니다. 하지만 한번 사용하기 시작하면 컴포넌트 간의 관계를 알기 어려워지므로 기본적으로 div나 button 등과 같은 내장 컴포넌트를 참조할 때만 사용하는 게 좋습니다. 보통 다음 절에서 설명할 getDOMNode()와 함께 사용하는 경우가 많습니다.

{% prism jsx %}
var Test = React.createClass({
  componentDidMount() {
    console.log(this.refs.myDiv.props.children);  // xxx
  },
  render() {
    return (
      <div ref=\"myDiv\">xxx</div>
    );
  }
});
{% endprism %}

### getDOMNode

React.js에서 DOM은 VirtualDOM에 감춰져 있어서 직접 DOM을 조작하지 않습니다. 하지만 focus 하거나, jQuery Plugin을 쓰고자 할 때는 직접 DOM을 조작해야 하는 경우도 있습니다. 그런 경우에는 ref와 함께 getDOMNode()를 사용하여 DOM을 참조합니다. 다만, DOM을 직접 수정하게 되면 VirtualDOM과의 관계가 틀어지기 때문에 읽기 전용으로 사용해야 합니다.

{% prism jsx %}
var Focus = React.createClass({
  componentDidMount() {
    this.refs.myText.getDOMNode().focus();
  },
  render() {
    return (
      <div>
        <p>set focus</p>
        <input type=\"text\" ref=\"myText\" />
      </div>
    );
  }
});
{% endprism %}

{% alert info 역자노트 %}
getDOMNode()는 deprecated 됩니다([참고](https://facebook.github.io/react/docs/component-api.html#getdomnode)). 대신 다음과 같이 사용하세요.
<pre><code class="language-js">
componentDidMount() {
  React.findDOMNode(this.refs.myText).focus();
}
</code></pre>
{% endalert %}

### Props.children

`<myComponent>xxx</myComponent>`와 같이 작성할 때 xxx를 얻고자 할때는 `this.props.children` 프로퍼티를 사용합니다.

{% prism jsx %}
var Hello = React.createClass({
  render() {
    return <div>{this.props.children}</div>;
  }
});
 
console.log(
  React.render(
    <Hello>xxx</Hello>,
    document.body
  ).props.children
);
// => xxx
 
console.log(
  React.render(
     <Hello><span>1</span><span>2</span></Hello>,
     document.body
  ).props.children
);
// => [React.Element, React.Element]

console.log(
  React.render(
    <Hello></Hello>,
    document.body
  ).props.children
);
// undefined
{% endprism %}

위와 같이 props.children은 지정 방식에 따라 문자열이거나 원소가 React Element로 이뤄진 배열이거나 undefined 일 수도 있습니다. 그래서 배열이라는 가정에 따라 원소의 개수를 확인하기 위해 children.length 한 경우 만약 문자열이 전달되면 String.length의 값이 반환되므로 chdilren을 사용할 때는 어떤 타입인지 검사할 필요가 있습니다. React.Children에는 count, forEach, map, only 등 편리한 함수를 제공하고 있습니다. 이 메서드를 잘 사용하면 자식을 조작할 때 발생하는 문제를 잘 회피할 수 있습니다.

{% prism jsx %}
var Hello = React.createClass({
  render() {
    return <div>{this.props.children}</div>;
  }
});

[
  <Hello>xxx</Hello>,
  <Hello><span>1</span><span>2</span></Hello>,
  <Hello></Hello>
].forEach( jsx => {
  var children = React.render(jsx, document.body).props.children;
  console.log("#########" + children + "##########");
  console.log(React.Children.count(children));
  React.Children.forEach(children, (child) => { console.log(child) });
});

// #########xxx##########
// 1
// xxx
// #########[object Object],[object Object]##########
// 2
// ReactElement {type: \"span\", key: null, ref: null, _owner: null, _context: Object…}
// ReactElement {type: \"span\", key: null, ref: null, _owner: null, _context: Object…}
// #########undefined##########
{% endprism %}

위 예제를 보면 알 수 있듯이 React.Children의 메서드를 사용하여 배열과 문자열의 문제를 해결하고 있습니다. 참고로 React.Children.only는 children의 React.element가 하나 이상일 때 오류를 발생시키는 함수입니다.

## 정리

여기까지 Prop과 State를 알아보고 그 속성을 사용해 컴포넌트에서 상호작용하는 방법도 알아봤습니다. prop과 state는 컴포넌트에서 데이터와 상태를 관리하는 데 중요한 속성이므로 꼭 기억해두시길 바랍니다. 다음편에서는 React 컴포넌트 작성 시 유용하게 사용할 수 있는 Lifecycle와 이벤트 등을 소개하겠습니다.
