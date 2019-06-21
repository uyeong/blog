---
title: React.js를 이해하다(4)
description: 일본의 개발자 koba04님이 작성한 React.js Advent Calendar를 번역한 글로, React.js를 보다 쉽게 접근하고 이해하기 쉽게 설명합니다. 이 글은 시리즈로 작성됐으며 이 문서는 그 중 네번째 편입니다.
permalink: learning-react-4
date : 2015-06-29
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

이번에는 React.js의 VIRTUAL DOM을 간단히 소개하겠습니다. VIRTUAL DOM의 자세한 설명은 [VirtualDOM Advent Calendar 2014](http://qiita.com/advent-calendar/2014/virtual-dom)(일본어)를 참고하세요. 사실 이 캘린더 만으로도 Virtual DOM을 충분히 이해할 수 있지만 흐름 상 한번 다뤄야 할 것 같아 작성합니다.

## React.js가 VIRTUAL DOM을 채택하고 있어 좋은 점

### VIRTUAL DOM의 좋은 점

자바스크립트를 사용해 DOM을 조작하여 UI를 변경하는 애플리케이션의 경우, 사용자 경험을 해치지 않기 위해서라도 갱신되는 DOM을 최소한으로 유지합니다. 예를 들어 Backbone.js를 사용한다면 기본적으로 뷰 단위로 렌더링 하므로 뷰를 아주 잘게 나누는 것이 중요합니다. 그러면 뷰의 개수가 늘어나고 관계가 복잡해져 관리하기 힘듭니다. Angular.js의 경우는 [Dirty Checking](http://sculove.pe.kr/wp/angularjs-dirty-checking-%EB%B0%A9%EB%B2%95/) 하여 변경이 있을 때 다시 랜더링 되는 형식입니다. 이런 방법은 감시 대상이 늘어날수록 성능이 떨어지는 문제가 있습니다.(이 성능 문제를 개선하고자 버전 2부터는 Object.observe를 사용하도록 변경됩니다.)

React.js의 경우는 setState(forceUpdate)가 호출되면 그 컴포넌트와 하위 컴포넌트가 다시 랜더링되는 대상이 됩니다. 이 말을 듣게 되면 매번 광범위하게 DOM이 갱신된다고 느껴지지만 React.js에서는 VIRTUAL DOM이라고 하는 형태로 메모리상에 DOM의 상태를 유지하고 있고 전/후 상태를 비교하여 달라진 부분만 실제 DOM에 반영합니다. 참고로 CSS도 마찬가지로 객체 형식으로 지정해 변경된 Style만 갱신합니다.

{% prism jsx %}
var Hoge = React.createClass({
  getInitialState() {
    return {
      style: {
        color: '#ccc',
        width: 200,
        height: 100
      }
    };
  },
  onChange() {
    var style = _.clone(this.state.style);
    style.color = '#ddd';
    this.setState({ style: style});
  },
  render() {
    return (
      <div style={this.state.style} onClick={this.onChange}>xxx</div>
    );
  }
}
{% endprism %}

이러한 방식으로 성능 문제를 해결한 것은 물론, 성능이 중요하지 않은 애플리케이션에서도 상위 레벨의 요소에 애플리케이션의 상태를 갖게 하고 그것을 setState()로 점점 갱신하는 것과 같은 조금은 거친 느낌으로 아키텍처도 할 수 있습니다. 서버 사이드의 렌더링과 비슷하네요. 즉, DOM을 다룰 때 신경 써야 하는 귀찮고 성능에 영향을 주는 부분을 React.js에 맡기는 것으로 애플리케이션의 구현을 단순하게 할 수 있는 특징이 있습니다.

애플리케이션 개발자가 VIRTUAL DOM을 직접 신경 쓰는 경우는 key 속성 지정과 성능 향상의 목적으로 shouldComponentUpdate()를 구현할 때입니다.

### shouldComponentUpdate

shouldComponenetUpdate()에 관해서는 Component Lifecycle을 다룰 때 설명했습니다. 이 메서드를 구현(재정의)하지 않는 경우엔 UI를 항상 갱신하도록 구현돼 있습니다. 이 메서드가 false를 반환하면 그 컴포넌트와 하위 컴포넌트의 UI를 갱신하지 않습니다.([참고](https://github.com/facebook/react/blob/c5fb3ff9870cc09a6ec82672e854ab54a412cef1/src/renderers/shared/reconciler/ReactCompositeComponent.js#L546-L549))

{% prism js %}
var shouldUpdate =
      this._pendingForceUpdate ||
      !inst.shouldComponentUpdate ||
      inst.shouldComponentUpdate(nextProps, nextState, nextContext);
{% endprism %}

최소한의 DOM만 갱신되는 메커니즘으로 인해 항상 UI를 갱신하도록 구현해도 문제가 안 될 것 같지만, 매번 VIRTUAL DOM 트리를 만들어 실제 DOM을 비교하는 작업을 하게 되므로 실제 DOM은 갱신되지 않더라도 비용 들어 갑니다. 따라서 컴포넌트의 State와 Prop의 전/후 상태를 비교하여 변경이 있는 경우에만 컴포넌트와 하위 컴포넌트의 VIRTUAL DOM의 트리를 만들어 실제 DOM과 비교하여 UI를 갱신하도록 하는 것이 조금 더 비용을 낮추는 방법입니다.

### React.js 이 외의 VIRTUAL DOM

React.js 외에도 VIRTUAL DOM을 채용하고 있는 라이브러리로는 [mercury](https://github.com/Raynos/mercury)와 [Mithril](http://lhorie.github.io/mithril/) 등 여러 가지가 있고, Ember.js도 버전 2.0에서 VIRTUAL DOM의 구현을 검토([참고](https://github.com/emberjs/rfcs/pull/15))하고 있습니다. 또한, 구현에 관해 알고 싶은 사람들은 [vdom](https://github.com/Matt-Esch/vdom)이나 [deku](https://github.com/dekujs/deku)의 소스부터 살펴나가는 것을 추천합니다.

여기까지 VIRTUAL DOM을 소개했습니다. 다음 절에서는 spread attributes를 사용하여 컴포넌트를 작성하는 방법을 소개하겠습니다.

## Spread Attributes

이번에는 기존의 컴포넌트를 Spread Attributes를 사용하여 간단하게 컴포넌트를 확장하는 방법을 가볍게 소개하려고 합니다. Spread Attributes는 React.js 버전 0.12에 추가된 기능입니다.

### 텍스트와 함께 출력되는 이미지 컴포넌트

예로써, 텍스트와 이미지를 한데 묶은 ImageText 컴포넌트를 사용합니다. 이 컴포넌트의 I/F는 이미지 경로와 텍스트를 전달할 수 있도록 디자인했습니다.

{% prism jsx %}
var ImageText = React.createClass({
  render() {
    return (
      <span>
        {this.props.text}
        <img src={this.props.src} width={this.props.width} height={this.props.height} />
      </span>
    );
  }
});

<ImageText text="이름" src="/img/foo.png" width="100" height="200" />
{% endprism %}

위와 같은 느낌으로 단순하게 구현할 수 있습니다. 하지만 이미지 태그를 표기할 때는 alt 어트리뷰트가 필요합니다. 여기에 또 추가하자니 귀찮습니다. 이런 문제는 Spread Attributes를 사용하면 다음과 같이 작성할 수 있습니다.

{% prism jsx %}
var ImageText = React.createClass({
  render() {
    var {text, ...other} = this.props;
    return (
      <span>{text}<img {...other} /></span>
    );
  }
});
{% endprism %}

Spread Attributes를 이용해 text와 ohter를 나누어 전달하면 이미지 어트리뷰트 갯수나 형식에 상관없이 사용할 수 있습니다. 자바스크립트로도 _.omit()을 이처럼 사용할 수 있습니다. 하지만 이렇게 작성할 경우 컴포넌트의 I/F를 알기 어려워지므로 PropTypes를 될 수 있으면 지정해두는 편이 좋다고 생각합니다.

### 클릭 이벤트 발생 시 Ajax 요청

이번에는 클릭 이벤트 발생 시 Ajax를 요청하도록 해보겠습니다.

{% prism jsx %}
var request = require('superagent');
var ImageText = React.createClass({
  onClick() {
    request.get('/click_img', { img: this.props.src });
  },
  render() {
    var {text, ...other} = this.props;
    return (
      <span>{text}<img {...other} onClick={this.onClick} /></span>
    );
  }
});
{% endprism %}

위와 같이 onClick()을 추가하면 Prop의 값과 자동으로 merge 합니다. 만약 {...other} 앞에 onClick()을 선언하면 Prop의 onClick을 우선시하여 덮어쓰므로 주의가 필요합니다.

{% prism jsx %}
var Hello = React.createClass({
    onClick() {
        alert('inner');
    },
    render: function() {
        var {name, ...other} = this.props;
        // 클릭시 inner 출력
        return <div>Hello <span {...other} onClick={this.onClick}>{name}</span></div>;
        // 클릭시 outer 출력
        return <div>Hello <span onClick={this.onClick} {...other}>{name}</span></div>;
    }
});
function onClick() {
    alert('outer');
}
React.render(<Hello name=\"World\" onClick={onClick}/>, document.getElementById('container'));
{% endprism %}

Spread Attributes는 JSX 없이도 _.extend(), Object.assign() 등을 사용하여 구현할 수 있습니다. 하지만 JSX의 spread attributes 사용하는 편이 조금 더 편리한 것 같습니다. 다음 절에서는 mixin을 소개하겠습니다.

## React.js의 믹스-인

이번에는 컴포넌트의 믹스-인 기능을 소개하겠습니다. 보통 믹스-인은 이름 그대로 기능을 수집하는 수단을 말하고 React.js에서 믹스-인은 컴포넌트의 공통 로직을 Object로 분리하여 공통적으로 사용할 수 있도록 하는 기능 뜻합니다. React.js 자체도 LinkedStateMixin이나 PureRenderMxin 등의 믹스-인을 제공하고 있습니다. 덧붙여 Marionette.js에서는 Behavior로, Vue.js에서는 믹스-인이라는 이름으로 같은 기능이 존재합니다.

{% alert info 역자노트 %}
아쉽지만 ES6 문법에서는 Mixin을 사용할 수 없습니다.([참고](http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#mixinshttp://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#mixins)), [react-mixin](https://github.com/brigand/react-mixin)으로 사용할 수 있지만, 개인적으로 깔끔하진 않은 거 같습니다.
{% endalert %}

### 사용 방법

Object를 배열로 지정하는 방식으로 사용합니다. 배열을 보면 알 수 있듯이 복수 지정이 가능합니다.

{% prism jsx %}
var Logger = {
  logging(str) {
    console.log(str);
  },
  componentDidMount() {
    this.logging('component did mount');
  }
};

var Hello = React.createClass({
  mixins: [Logger],
  render() {
    this.logging('render');
    return <div>Hello</div>
  }
});
{% endprism %}

### 믹스-인이 로드되는 순서

복수의 믹스-인을 지정할 수 있다고 말씀드렸습니다. 그럼 어떤 순서로 로드될까요? 예상대로 배열의 순서대로 믹스-인이 호출된 후 마지막에 컴포넌트의 메서드가 호출되는 것을 확인할 수 있습니다.

{% prism js %}
var MixinA = {
  componentWillMount() {
    console.log('mixinA');
  }
};
 
var MixinB = {
  componentWillMount() {
    console.log('mixinB');
  }
};
 
var Hello = React.createClass({
  mixins: [MixinA, MixinB],
  componentWillMount() {
    console.log('hello');
  },
  render() {
    return <div>hello</div>
  }
});

React.render(<Hello />, document.body);
// mixinA
// mixinB
// hello
{% endprism %}

### Conflict State or Prop

getInitialState와 getDefaultProps 등을 믹스-인으로 지정하면 어떻게 될까요?

#### getInitialState

아래 예제를 보면 알 수 있듯이 State 값을 합칩니다.

{% prism jsx %}
var Mixin = {
  getInitialState() {
    return {
      mixinValue: 'mixin state'
    };
  }
};

var Hello = React.createClass({
  mixins: [Mixin],
  getInitialState() {
    return {
      componentValue: 'component state'
    };
  },
  render() {
    console.log(this.state);
    return <div>hello</div>
  }
});

React.render(<Hello />, document.body);
//  Object {mixinValue: 'mixin state', componentValue: 'component state'}
{% endprism %}

#### getDefaultProps

Props도 State와 마찬가지로 값을 합칩니다.

{% prism js %}
var Mixin = {
  getDefaultProps: function() {
    return {
      mixinValue: 'mixin prop'
    };
  }
};
 
var Hello = React.createClass({
  mixins: [Mixin],
  getDefaultProps: function() {
    return {
      componentValue: 'component prop'
    };
  },
  render: function() {
    console.log(this.props);
    return <div>hello</div>
  }
});
 
React.render(<Hello />, document.body);
// Object {mixinValue: 'mixin prop', componentValue: 'component prop'}
{% endprism %}

#### getInitialState에서 같은 key를 지정

만약 믹스-인과 같은 key를 지정할 경우엔 에러가 발생합니다.

{% prism jsx %}
var Mixin = {
  getInitialState() {
    return {
      value: 'mixin state'
    };
  }
};
 
var Hello = React.createClass({
  mixins: [Mixin],
  getInitialState() {
    return {
      value: 'component state'
    };
  },
  render() {
    console.log(this.state);
    return <div>hello</div>
  }
});
 
React.render(<Hello />, document.body);
//  Uncaught Error: Invariant Violation: mergeObjectsWithNoDuplicateKeys(): Tried to merge two objects with the same key: `value`. This conflict may be due to a mixin; in particular, this may be caused by two getInitialState() or getDefaultProps() methods returning objects with clashing keys.
{% endprism %}

#### 메서드 재정의

믹스-인과 동일한 이름의 메서드를 컴포넌트에서 선언해 재정의 할때도 에러가 발생합니다.

{% prism jsx %}
var Mixin = {
  foo: function() {
    console.log('mixin foo');
  }
};
 
var Hello = React.createClass({
  mixins: [Mixin],
  foo: function() {
    console.log('component foo');
  },
  render: function() {
    return <div>hello</div>
  }
});
 
React.render(<Hello />, document.body);
// Uncaught Error: Invariant Violation: ReactCompositeComponentInterface: You are attempting to define `foo` on your component more than once. This conflict may be due to a mixin.
{% endprism %}

믹스-인을 이용하면 코드를 줄일 수 있습니다. 로직을 어렵게 하지 않을 수준에서 잘 사용하길 바랍니다. 여기까지 믹스-인을 소개했습니다. 다음 절에서는 애드온을 소개하겠습니다.

## React.js의 애드온

이번에는 에드온을 소개하겠습니다. 엔드온은 코어에 들어갈 수준은 아닌 편리한 믹스-인이나 테스트 유틸, 성능 측정 도구 등을 모아 놓은 부가 기능입니다.

### 사용 방법

애드온은 require하거나 js 파일을 로드하는 것으로 사용할 수 있습니다.

{% prism js %}
var React = require('react/addons');
{% endprism %}

{% prism html %}
<script src="//cdnjs.cloudflare.com/ajax/libs/react/0.12.1/react-with-addons.js"></script>
{% endprism %}

### 애드온

#### TransitionGroup and CSSTransitionGroup

애니메이션을 하기 위한 애드온입니다. 이 애드온은 다음에 자세히 소개하겠습니다.

#### LinkedStateMixin

이 애드온은 이전에 한번 소개한 폼을 다룰 때 양방향 데이터 바인딩과 같은 로직을 간결하게 작성하기 위한 믹스-인입니다.

#### ClassSet

className 지정을 쉽게 하기 위한 애드온입니다. {className: boolean} 형식으로 지정할 수 있고 boolean이 true인 className만 적용됩니다. Angular.js나 다른 프레임워크에도 있는 기능입니다.([참고](http://jsfiddle.net/koba04/4Le38o0n/1/)) 이 애드온은 곧 삭제될 예정입니다. 대신 [classnames](https://github.com/JedWatson/classnames) 같은 별도의 npm 모듈을 사용하도록 권고하고 있습니다.

{% prism jsx %}
var classSet = React.addons.classSet;
 
var Hello = React.createClass({
  getInitialState() {
    return {
      isWarning: false,
      isImportant: false
    };
  },
  toggleWarning() {
    this.setState({ isWarning: !this.state.isWarning });
  },
  toggleImportant() {
    this.setState({ isImportant: !this.state.isImportant });
  },
  render() {
    var style = classSet({
      'is-warning': this.state.isWarning,
      'is-important': this.state.isImportant
    });
    return (
      <div>
        <button onClick={this.toggleWarning}>warning</button>
        <button onClick={this.toggleImportant}>important</button>
        <p className={style}>( ´ ▽ ` )ﾉ</p>
      </div>
    );
  }
});
{% endprism %}

#### TestUtils

React.js를 테스트할 때 편리하게 사용할 수 있는 애드온이며 개발 환경에서만 사용할 수 있습니다. click 이벤트와 같은 이벤트를 시뮬레이터 하는 TestUtils.Simurate나 isElementOfType과 isDOMComponent 등 컴포넌트의 상태를 확인할 수 있는 함수까지 여러 가지 있습니다.(React.js 테스트는 추후 다시 소개하겠습니다.)

#### cloneWithProps

이 애드온을 사용하는 경우는 많지 않습니다. 어떤 컴포넌트에서 다른 Prop에 의한 새로운 컴포넌트를 만들고 싶을 때 사용합니다.

{% prism jsx %}
var cloneWithProps = React.addons.cloneWithProps;
 
var Item = React.createClass({
  render: function() {
    var text = this.props.text + (this.props.index != null ? ':' + this.props.index : '');
    return <div>{text}</div>
  }
});
 
var Loop = React.createClass({
  render: function() {
    var items = _.map(_.range(this.props.count), function(i) {
      return cloneWithProps(this.props.children, { key: i, index: i });
    }.bind(this));
    return <div>{items}</div>
  }
});
 
React.render(<Loop count=\"10\"><Item text=\"hoge\" /></Loop>, document.body);
{% endprism %}

위는 횟수만큼 children 컴포넌트를 만드는 과정을 cloneWithProps 애드온을 사용해 작성한 것입니다.

#### update

Object를 Immutable하게 조작하기 위한 애드온입니다. 뒤에서 설명할 PureRenderMixin() 또는 Prop과 State를 비교해 최적화하는 용도의 shouldComponentUpdate와 함께 조합해서 사용하면 편리합니다.

{% prism js %}
var update = React.addons.update;

var obj = {
  list: [1,2,3],
};

var obj2 = update(obj, {
  list: {
    $push: [4]
  }
});

console.log(obj2.list);     // ['a','b','c','d']
console.log(obj === obj2);  // false
{% endprism %}

참고로 페이스북은 별도의 [Immutable.js](http://facebook.github.io/immutable-js/)를 만들고 있습니다. 이를 다음과 같이 사용할 수도 있습니다.

{% prism js %}
var obj = Immutable.Map({
    list: Immutable.List.of(1, 2, 3)
});

var obj2 = obj.set('list', obj.get('list').push(4));

console.log(obj2.get('list').toArray()); // ['a','b','c','d']
console.log(obj === obj2); // false
{% endprism %}

#### PureRenderMixin

성능을 최적화하기 위한 믹스-인입니다. 아래 코드를 살펴보겠습니다.([참고](https://github.com/facebook/react/blob/master/src/addons/ReactComponentWithPureRenderMixin.js))

{% prism js %}
var ReactComponentWithPureRenderMixin = {
  shouldComponentUpdate: function(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
           !shallowEqual(this.state, nextState);
  }
};
{% endprism %}

위 믹스-인이 사용하는 shallowEqual은 다음과 같이 작성돼 있습니다. 중첩된 값까지는 고려하지 않고 단순하게 비교합니다.([참고](https://github.com/facebook/react/blob/38acadf6f493926383aec0362617b8507ddee0d8/src/shared/utils/shallowEqual.js))

{% prism js %}
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
{% endprism %}

#### Perf

성능 측정을 위한 애드온입니다. 개발 환경에서만 사용할 수 있습니다. Perf.start()와 Perf.stop()으로 성능을 측정하고 싶은 로직을 둘러싸고 수치화할 수 있습니다.

{% prism js %}
React.addons.Perf.start();
this.setState({ items: items }, function() {
  React.addons.Perf.stop();
  React.addons.Perf.printInclusive();
});
{% endprism %}

어떤 식으로 수치화되는지 확인하기 위해 Item 컴포넌트를 100개 추가하는 로직을 성능 측정하는 [예제](http://jsfiddle.net/koba04/Lpeubepw/1/)를 작성했습니다. 측정 결과는 개발자 콘솔에서 확인할 수 있습니다.

측정 결과의 수치가 매우 작은 경우엔 출력이 무시되니 참고바랍니다.

##### printInclusive

측정 중인 컴포넌트 처리에 걸린 시간을 알기 쉽게 출력합니다.

{% figure react_perf.01.png 'printInclusive의 성능 측정 결과' '그림 1 printInclusive' %}

##### printExclusive

컴포넌트 처리에 걸린 시간을 더 상세히 출력합니다.

{% figure react_perf.02.png 'printExclusive의 성능 측정 결과의 성능 측정 결과' '그림 2 printExclusive' %}

##### printWasted

실제 렌더링 처리 이외에 걸린 시간을 출력합니다. shouldComponenetUpdate()를 적용하는 타이밍을 찾기 위한 단서로 사용합니다.

{% figure react_perf.03.png 'printWasted의 성능 측정 결과의 성능 측정 결과' '그림 3 printWasted' %}

##### printDOM(measurements)

돔을 추가하거나 삭제한 내역을 출력합니다.

{% figure react_perf.04.png 'printDOM의 성능 측정 결과의 성능 측정 결과' '그림 4 printDOM' %}

##### getLastMeasurements

성능 측정 결과를 Object 형식으로 가져올 수 있습니다. 서버에 결과를 보내거나 위에서 소개한 각 메서드에 값을 넘겨줄 수도 있습니다. 측정 후 보기 좋게 정리하기 위해서도 사용할 수 있습니다.

## React.js에서 애니메이션 처리하기

이번에는 React.js에서 애니메이션을 다루는 방법을 소개하겠습니다. React.js에서는 애니메이션을 Addon으로 지원하고 있으며 CSS 애니메이션과 CSSTransitionGroup addon을 사용하는 방식과 컴포넌트의 Lifecycle 메서드와 같은 메서드에서 훅(hook)하여 작성하는 두 가지 패턴으로 애니메이션을 처리할 수 있습니다.

### CSSTransitionGroup

CSSTransitionGroup을 이용하면 컴포넌트를 추가/삭제 시 CSS 애니메이션을 줄 수 있습니다. 방법은 Angular.js와 Vue.js와 비슷합시다. 추가/삭제 시 클래스를 추가하여 CSS 애니메이션을 처리하는 방식입니다. `{transitionName}-{enter, leave}` 패턴으로 클래스 명이 추가된 뒤, 다음 이벤트 루프에서 `{transitionName}-{enter, leave}-active`의 className이 추가되는데 이때 이 클래스 명을 사용하여 CSS애니메이션을 처리합니다.([참고](http://jsfiddle.net/koba04/4L6oLfbg/4/))

{% prism jsx %}
var CSSTransitionGroup = React.addons.CSSTransitionGroup;
 
var Hello = React.createClass({
  getInitialState: function() {
    return {
      value: '(´・ω・｀)'
    };
  },
  onClick: function() {
    var value = this.state.value === '(´・ω・｀)' ? '(｀･ω･´)ゞ' : '(´・ω・｀)';
    this.setState({ value: value });
  },
  render: function() {
    var value = <span className=\"sample\" key={this.state.value}>{this.state.value}</span>;
    return (
      <div>
        <div>Animation!!<button onClick={this.onClick}>click!!</button></div>
        <CSSTransitionGroup transitionName=\"sample\">
          {value}
        </CSSTransitionGroup>
      </div>
    );
  }
});
 
React.render(<Hello />, document.body);
{% endprism %}

{% prism css %}
.sample-enter {
     -webkit-transition: 1s ease-in;
}
.sample-enter.sample-enter-active {
    font-size: 80px;
}
.sample-leave {
    -webkit-transition: .5s ease-out;
}
.sample-leave.sample-leave-active {
    font-size: 10px;
}
{% endprism %}

#### 주의할 점

애니메이션 되는 요소에는 반드시 key를 지정해야 합니다. 애니메이션 되는 요소가 1개라도 반드시 지정해야 합니다. 이는 컴포넌트가 추가됐는지 아니면 갱신됐는지를 알려주기 위함입니다. 이것을 이용하면 앞에서 소개한 예처럼 컴포넌트가 1개라도 key를 변경하는 것으로 애니메이션을 적용할 수 있습니다.(key를 변경했다는 뜻은 컴포넌트를 추가[또는 갱신]/삭제했다는 뜻이므로)

애니메이션은 추가(enter) 시와 삭제(leave) 시 두 경우 모두에 지정할 필요가 있습니다. 만약 한 경우에만 애니메이션을 지정하고 싶다면 transitionEnter={false}, transitionLeave={false}를 지정합니다.

{% prism jsx %}
<CSSTransitionGroup transitionName="sample" transitionLeave={false}>
  {value}
</CSSTransitionGroup>
{% endprism %}

CSSTransitionGroup의 컴포넌트는 애니메이션 시작 시엔 이미 랜더링 돼 있어야 합니다. 추가되는 요소와 함께 CSSTransitionGroup의 컴포넌트를 추가하면 애니메이션하지 않습니다. 예를 들어 아래의 경우 처음 click 시엔 CSSTransitionGroup이 없으므로 애니메이션하지 않습니다.

{% prism jsx %}
var Hello = React.createClass({
  getInitialState: function() {
    return {
      value: ''
    };
  },
  onClick: function() {
    var value = this.state.value === '(´・ω・｀)' ? '(｀･ω･´)ゞ' : '(´・ω・｀)';
    this.setState({ value: value });
  },
  render: function() {
    var value ;
    if (this.state.value) {
      value = (
        <CSSTransitionGroup transitionName=\"sample\">
          <span className=\"sample\" key={this.state.value}>{this.state.value}</span>
        </CSSTransitionGroup>
      );
    }
    return (
      <div>
        <div>Animation!!<button onClick={this.onClick}>click!!</button></div>       
          {value}
      </div>
    );
  }
});
{% endprism %}

### ReactTransitionGroup

CSS 애니메이션이 아니라 직접 유연하게 애니메이션 작성하고 싶은 경우엔 ReactTransitionGroup을 사용합니다. componentWillEnter(callback), componentDidEnter(), componentWillLeave(callback), componentDidLeave() 이 4개의 Lifecycle 메서드를 이용해 작성합니다. 또 ReactTransitionGroup은 기본으로 span 요소를 DOM에 추가하는데 `<ReactTransitionGroup compoenent="ul">` 문법으로 추가하는 요소를 지정할 수 있습니다.([참고](http://jsfiddle.net/koba04/hr5vkteL/5/))

{% prism jsx %}
var TransitionGroup = React.addons.TransitionGroup;
var duration = 1000;
var AnimationComponent = React.createClass({
  componentWillEnter: function(callback) {
    console.log('component will enter');
    $(this.getDOMNode()).hide();
    callback();
  },
  componentDidEnter: function() {
    $(this.getDOMNode()).show(duration);
    console.log('component did enter');
  },
  componentWillLeave: function(callback) {
    console.log('component will leave');
    $(this.getDOMNode()).hide(duration, callback);
  },
  componentDidLeave: function() {
    console.log('component did leave');
  },
  render: function() {
    return <div>{this.props.text}</div>
  }
});
 
var Hello = React.createClass({
  getInitialState: function() {
    return {
      value: '(´・ω・｀)'
    };
  },
  onClick: function() {
    var value = this.state.value === '(´・ω・｀)' ? '(｀･ω･´)ゞ' : '(´・ω・｀)';
    this.setState({ value: value });
  },
  render: function() {
    var value = <AnimationComponent key={this.state.value} text={this.state.value} />;
    return (
      <div>
        <div>Animation!!<button onClick={this.onClick}>click!!</button></div>
        <TransitionGroup>
          {value}
        </TransitionGroup>
      </div>
    );
  }
});
 
React.render(<Hello />, document.body);
{% endprism %}

#### 주의할 점

componentWillEnter()와 componentWillLeave() 처리가 끝나게 되면 반드시 callback을 호출해야 합니다.

여기까지 애니메이션에 관해서 간단히 소개했습니다. 이러한 방식으로 애니메이션을 처리하는데 익숙치 않기 때문에 보통 쓰기 어려운 감이 들 수 있습니다. React.js 측에서도 향후 개선점으로 애니메이션도 다루고 있으므로 앞으로는 더욱 쉬워질 것이로 생각합니다.

## 정리

이번 편에서는 React.js에서 VIRTUAL DOM을 채택해서 가능한 메커니즘과 간단하게 Props를 전달할 수 있는 Spread Attribute 그리고 믹스-인과 애드온, 마지막으로 애니메이션을 처리하는 방법을 소개했습니다. 여기까지 기본적인 React.js 사용법은 모두 소개했습니다. React.js를 이해하는 비용은 그리 비싸지 않습니다. 이 정도의 특징만 숙지해도 큰 무리 없이 컴포넌트를 개발할 수 있습니다. React.js 자체를 사용하는 것보다 컴포넌트를 설계하는 것이 더 어렵고 개발자의 역량에 따라 컴포넌트 효율성이나 디자인이 크게 좌우될 수 있습니다. 많이 만들고 고민해서 좋은 컴포넌트를 만들 수 있길 바랍니다.

다음편에서는 Server-side rendering과 컴포넌트를 테스트하는 방법 등을 소개하겠습니다.
