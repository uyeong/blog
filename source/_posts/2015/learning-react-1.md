---
title: React.js를 이해하다(1)
description: 일본의 개발자 koba04님이 작성한 React.js Advent Calendar를 번역한 글로, React.js를 보다 쉽게 접근하고 이해하기 쉽게 설명합니다. 이 글은 시리즈로 작성됐으며 이 문서는 그 중 첫 편입니다.
date : 2015-06-23
category: JavaScript
tags:
    - JavaScript
    - React

---

{% alert info '읽기전에...' '
이 문서는 [koba04](http://qiita.com/koba04)님이 작성한 [React.js Advent Calendar](http://qiita.com/advent-calendar/2014/reactjs)를 번역한 것입니다. 본래 원문서는 캘린더 형식으로 소개하지만 여기에서는 회를 나눠 작성할 생각입니다. 또한, React 버전 0.12.1 때 작성된 문서이기 때문에 현 버전과 다른 점이 있을 수 있습니다. 최대한 다른 부분을 노트로 작성할 생각이지만, 만약 생략된 부분이 있다면 댓글로 알려주시면 감사하겠습니다.
' %}

올해(2014년) 들어 갑자기 대세가 된 듯한 React.js 지만, "조금 전까지만 해도 Angular.js가 대세라고 하더니!"라며 혼란스러워하는 사람도 많을 거라 생각해서 Advent Calendar 형식으로 간단히 소개하고자 합니다. React.js에서 중요한 개념인 VIRTUAL DOM(가상돔) 별도의 [Adevent Calendar](http://qiita.com/advent-calendar/2014/virtual-dom)에 작성돼 있으니 꼭 봐주시길 바랍니다.

## React.js 란?

왜 이 라이브러리가 뜨거운 감자가 됐는지는 솔직히 잘 모르겠지만, 필자는 개인적으로는 Github의 atom에서 성능 향상의 이유로 React.js를 사용하기로 했다는 기사([Moving Atom To React](http://blog.atom.io/2014/07/02/moving-atom-to-react.html))를 보고 흥미를 갖게 됐습니다. React.js는 Facebook이 만들고 있는 이른바 MVC 프레임워크에서의 뷰 부분을 컴포넌트로 만들기 위한 라이브러리입니다. Handlebars 같은 템플릿 엔진이 아닙니다. Facebook은 물론 instagram, AirBnb, Yahoo, Atlassian 등 여러 곳에서 사용하고 있습니다.

### 특징

공식 사이트에서는 특징을 크게 세 가지로 나눠 소개하고 있습니다.

* JUST THE UI
* VIRTUAL DOM
* DATA FLOW

이 세 가지 특징에 관해서 간단히 설명해 드리겠습니다.

#### JUST THE UI

React.js는 UI 컴포넌트를 만들기 위한 라이브러리입니다. 컴포넌트 지향 프레임워크는 여러 가지가 있지만 React.js는 정말 UI 컴포넌트만 지원합니다. 비록 지원하는 범위는 작지만, 애플리케이션을 만드는 방법을 크게 바꿀 수 있다는 점이 재미있습니다. 또한, 이해 비용이 적어 도입하기 쉬우며 Backbone.js의 뷰 부분을 React.js로 구현하거나 Angular.js의 directives를 React.js를 사용해 구현하는 등 여러 환경과 조합해 사용할 수 있습니다.

#### VIRTUAL DOM

React.js는 자바스크립트 내에 DOM Tree와 같은 구조체를 VIRTUAL DOM으로 갖고 있습니다. 다시 그릴 때는 그 구조체의 전후 상태를 비교하여 변경이 필요한 최소한의 요소만 실제 DOM에 반영합니다. 따라서 무작위로 다시 그려도 변경에 필요한 최소한의 DOM만 갱신되기 때문에 빠르게 처리할 수 있습니다.

#### DATA FLOW

React.js는 단방향 데이터 흐름을 지향합니다. 따라서 Angular.js의 양방향 데이터 바인딩을 사용할 때처럼 작성할 코드의 양이 확연히 줄거나 하지는 않습니다. 그렇지만, 애플리케이션의 데이터를 관리하는 모델 컴포넌트가 있고 그 데이터를 UI 컴포넌트에 전달하는 단순한 데이터 흐름으로 이해하고 관리하기 쉬운 애플리케이션을 만들 수 있습니다. 

{% alert info '역자노트' '
과거엔 데이터가 변경되면 전체를 새로 그리는 간편하고 단순한 방법으로 애플리케이션을 구현했습니다. 현대에 들어 애플리케이션을 개발하는 방법이 많이 복잡해졌다고 생각합니다. Angular.js의 양방향 데이터 바인딩은 코드를 줄여주고 사용하기 편하지만, 규모가 커질수록 데이터의 흐름을 추적하기 힘듭니다. React.js는 근원(根源)으로 돌아가는 개발 방법입니다. 그리고 그 과정에서 발생하는 비효율적인 부분, 예를 들어 DOM 전체를 갱신해야하는 문제를 VIRTUAL DOM과 비교(diff)로 해결했습니다.
' %}

### 기타

#### JSX

추가로 두 가지 더 설명하겠습니다. 첫 번째로 JSX입니다. React.js에서는 JSX라고 하는 XML과 비슷한 문법을 이용할 수 있습니다. 이는 선택적으로 사용할 수 있는 문법이므로 JSX가 마음에 들지 않는다면 자바스크립트로 작성할 수도 있습니다. JSX는 다음에 자세히 소개하겠습니다.

{% alert info '역자노트' '
[JSX](https://facebook.github.io/jsx/)는 페이스북에서 스펙을 정의한 ECMAScript 친화적인 XML 스러운 문법입니다. React.js에서는 이 문법을 VIRTUAL DOM(또는 컴포넌트의 계층)을 선언적(또는 명시적)으로 서술하여 표현하기 위해 사용됐습니다. 선택적으로 사용할 수 있다고는 하나 JSX가 React.js를 사용하는 이유 중 하나이기 때문에 사용하지 않는 건 개인적으로 추천하지 않습니다.
' %}

#### Flux

React.js에 조금 관심이 있는 분은 React.js와 Flux를 세트로 구성하는 방법에 관해 들은 적 있을 겁니다. 이것은 MVC와 같은 아키텍처를 구성하는 이야기이며 단지 Flux의 구성 요소로서 React.js를 사용하는 방법일 뿐 React.js에 포함된 것은 아닙니다. 이와 관련한 내용도 다음에 자세히 소개하겠습니다.

다음 절에서는 Hello World를 컴포넌트로 만드는 간단한 예제와 함께 React.js를 사용하는 방법을 소개하겠습니다. 예제 코드를 작성할 때는 아래 공식 jsfiddle 링크를 사용하면 더욱 쉽게 테스트할 수 있으니 참고하시길 바랍니다.

* [React JSFiddle](http://jsfiddle.net/reactjs/69z2wepo/)
* [React JSFiddle without JSX](http://jsfiddle.net/reactjs/5vjqabv3)

## Hello React.js

이번 절에서는 Hello World를 컴포넌트로 만들어보겠습니다. 기본적으로 React.createClass로 컴포넌트를 만듭니다. 그리고 그 컴포넌트들을 조합해 페이지를 만들고 React.render를 이용해 DOM과 짝을 맞춰 출력합니다.

### JSX 사용

JSX에 관해서는 다음 절에서 조금 더 자세히 소개할 예정입니다. 보통 아래와 같은 느낌으로 자바스크립트 내에 XML과 비슷한 마크업을 직접 사용할 수 있습니다.

{% prism jsx "
var React = require('react');

var Hello = React.createClass({
  render: function() {
    return (
      <div className=\"container\">Hello {this.props.name}</div>
    );
  }
});

React.render(<Hello name=\"React\" />, document.getElementById(\"app\"));
" %} 

위 코드를 브라우저에서 실행하면 당연히 에러가 발생합니다. 따라서 [react-tools](https://www.npmjs.com/package/react-tools)를 사용하여 사전에 컴파일하거나 [JSXTransformer](http://dragon.ak.fbcdn.net/hphotos-ak-xfp1/t39.3284-6/10734305_1719965068228170_722481775_n.js)를 불러와야 합니다. 또한, browserify와 reactify를 조합해 사용하는 변환 방법도 있습니다. 참고로 말씀드리면 div(division)은 흔히 우리가 생각하는 HTML 태그가 아니라 React의 컴포넌트입니다.

{% alert info '역자노트' '
JSX에서 보이는 div, a 등과 같은 HTML 태그는 사실 HTML 태그가 아니라 모두 React.js의 컴포넌트입니다. 기본 HTML 태그를 React.js에서 미리 컴포넌트로 작성해 제공할 뿐입니다. JSX로 작성되는 모든 요소는 React.js 컴포넌트로 보시면 됩니다.
' %}

#### JSX + ES6, 7의 문법(일부)
JSX의 transform에는 harmoney 옵션이 있습니다. 이 옵션을 켜면 ES6, 7의 문법을 일부 사용할 수 있습니다. ES6의 문법인 Arrow function은 map, filter 등과 조합해 사용하면 정말 편리합니다.

{% prism jsx "
var items = this.props.items.map((item) => {
  return <div>{item.name}</div>;
});
" %} 

{% alert info '역자노트' '
위에서 언급된 react-tools와 JSXTransformer는 곧 Babel로 옮겨집니다([참고](http://facebook.github.io/react/blog/2015/06/12/deprecating-jstransform-and-react-tools.html)). 자바스크립트 발전 속도에 대응하기 힘들었던 거로 보입니다. 반면, Babel은 잘 대응하고 있고 또 많은 개발자가 기본적으로 채택하는 빌드 도구이기 때문에 결정한 것 같습니다. 따라서 이를 사용하기보단 Babel과 함께 프로젝트를 구성하길 바랍니다.
' %}

### without JSX

JSX 없이 코드를 작성하면 아래와 같습니다. Hello 컴포넌트의 render 메서드 이외에도 React.render에 Hello 컴포넌트를 전달하는 방식도 바뀌었습니다.

{% prism jsx "
var React = require('react');

var Hello = React.createClass({
  render: function() {
    return React.DOM.div({className: 'container', 'Hello ' + this.props.name);
  }
})

React.render(
  React.createFactory(Hello)({name: 'React'}), document.getElementById(\"app\")
);
" %} 

이 Advent Calendar에서 소개하는 코드는 JSX에서 harmony 옵션을 켠 상태에서 작성했음을 알려드립니다. 그럼, 다음 절에서 JSX에 관해 조금 더 넓게 설명하도록 하겠습니다.

## React.js의 JSX

위 Hello React.js 절에서 JSX를 잠깐 소개했습니다. 이번에는 조금 더 넓게 살펴보도록 하겠습니다.

### JSX

{% prism jsx "
var Hello = React.createClass({
  render: function() {
    return (
      <div>Hello {this.props.name}</div>
    );
  }
});
" %}

위 코드에서 한눈에 HTML로 보이는 부분 `<div>...</div>`이 JSX 문법입니다. XML과 비슷한 형태로 태그를 작성해 나가면 됩니다. 따로 학습하고 기억해야 할 내용은 거의 없습니다. 이 문법에 관한 자세한 설명은 [JSX Specification](http://facebook.github.io/jsx/)에 작성돼 있습니다. 하나 주의해야 할 점으로는 JSX는 HTML이 아니므로 div에 container라는 클래스를 지정하고 싶은 경우, `<div class="container">...</div>`가 아니라 `<div className="container">...</div>`로 작성해야 한다는 것입니다. 자바스크립트의 예약어 문제를 회피하기 위해서 이런 문법으로 디자인됐습니다. 추가로 label의 for 속성은 htmlFor로 작성해야 합니다. 이와 관련한 내용은 [Tags and Attributes](http://facebook.github.io/react/docs/tags-and-attributes.html)에 정리돼 있습니다. HTML은 태그가 제대로 닫히지 않아도 에러가 발생하지 않지만 JSX는 태그를 닫지 않은 경우 에러가 발생하므로 문법 문제를 쉽게 알아차릴 수 있습니다.

### 사용법

#### Realtime로 변환

JSX Transformer를 불러오면 JSX 문법을 실시간으로 변환할 수 있습니다. 다만, 이 방법을 제품(서비스) 환경에서 사용하는 것은 성능면에서 좋지 않아 권장하지 않습니다. 보통 개발 및 디버깅의 편의를 위해 사용합니다.

#### Precompile로 변환

`npm install -g react-tools` 커맨드 라인으로 react-tools를 설치하면 jsx 명령을 사용할 수 있습니다.

{% prism bash "
$ jsx src/build/
" %}

파일을 감시하는 것도 가능합니다.

{% prism bash "
$ jsx --watch src/build/
" %}

#### browserify나 webpack으로 변환

browserify와 [reactify](https://www.npmjs.com/package/reactify)를 사용하여 변환할 수 있습니다.

{% prism js '
"browserify": {
  "transform": [
    ["reactify", {"harmony": true} ]
  ]
}
' %}

#### node-jsx로 변환

Server-Side rerendering과 같이 ndoe.js 환경에서 변환하고 싶은 경우엔 [node-jsx](https://www.npmjs.com/package/node-jsx)를 사용할 수 있습니다. require하고 install 하는 것으로 간단히 변환할 수 있습니다.

{% alert info '역자노트' '
Browserify와 [babelify](https://github.com/babel/babelify)([babel](https://babeljs.io))를 조합하면 ES6는 물론 React.js의 JSX 문법을 사용할 수 있습니다. [ECMAScript 6 compatibility table](http://kangax.github.io/compat-table/es6/)의 core.js + babel 항목을 보면 사용할 수 있는 ES6 문법을 확인할 수 있습니다. 여기에 Grunt를 이용해 자동화하면 조금 더 안락한 개발 환경을 구성할 수 있습니다.
' %}

### JSX 사용 의미

JSX를 사용하면 HTML 문법과 비슷한 느낌으로 작성할 수 있어 비엔지니어도 이해하기 쉽다는 장점이 있습니다. 개인적인 성향 차이가 있다고는 하지만 개인적으로 `React.DOM.div(null, 'hello')` 보다 `<div>hello</div>`와 같은 방식이 더 좋다고 생각합니다. 또, 버전 0.12는 버전 0.11에 비해 React.createClass의 동작 방식(인터페이스)이 바뀌었지만(이것에 관한 내용은 다음 절에서 소개하겠습니다.) JSX를 사용하고 있는 경우엔 코드를 그대로 사용 가능합니다. 즉, JSX에 대한 지원이 조금 더 좋습니다. JSX를 사용했을 때의 이 점은 이 정도로 생각하고 있으므로 자바스크립트로 작성하고 싶은 사람은 굳이 JSX를 사용하지 않아도 괜찮을 것 같습니다. JSX 이외로 커피스크립트 환경을 고려해 만들어진 [react-kup](https://github.com/snd/react-kup)도 있습니다.

### 변환 코드 확인

특정 코드를 변환한 결과를 확인하고 싶은 경우엔 아래 문서를 참고하세요.

* [JSX Compiler Service](http://facebook.github.io/react/jsx-compiler.html)
* [HTML to JSX](http://facebook.github.io/react/html-jsx.html)

### ES6, 7

harmony 옵션을 켜면 JSX의 변환할 시 Class나 Arrow Function 등 ES6, 7의 기능 일부를 사용할 수 있습니다. 개인적으로 아래와 같이 ES6, 7 문법으로 작성하는 것을 좋아해 옵션을 켜두고 사용하고 있습니다.

{% prism jsx "
var Items = React.createClass({
  itemName(item) {
    return `${item.name}:${item.count}`;
  },
  render() {
    var items = this.props.items.map(item => <span>{this.itemName(item)}</span>);

    return (
      <div>{items}</div>
    );
  }
});
" %}

아래와 같은 기능들을 사용할 수 있습니다.([참고](https://github.com/facebook/jstransform/blob/master/visitors/index.js#L57-L68))

* es6-arrow-functions
* es6-object-concise-method
* es6-object-short-notation
* es6-classes
* es6-rest-params
* es6-templates
* es6-destructuring
* es7-spread-

React.js를 처음 접하면 JSX라는 불가사의한 언어를 사용할 필요가 있어서 꺼리는 사람도 있을 것 같습니다만 컴포넌트를 알기 쉽게 정의하기 위한 문법이므로 조금 더 가볍게 생각했으면 좋겠습니다. 다음 절에서는 컴포넌트에 관해 조금 더 설명하겠습니다.

## React.js의 컴포넌트

이번에는 컴포넌트를 소개하겠습니다. React.js에서는 기본적으로 컴포넌트를 만들고 조합하여 애플리케이션을 만듭니다.

### render

컴포넌트는 React.createClass()에 render 메서드를 가진 리터럴 객체를 전달해 작성할 수 있습니다.

{% prism jsx "
var Hello = React.createClass({
  render() {
    return (
      <div><span>hello</span></div>
    )
  }
});
" %}

그러면서 render()는 컴포넌트를 하나만 반환해야 합니다. 아래 처럼 복수의 컴포넌트를 반환할 수 없습니다.

{% prism jsx "
// NO
render() {
   return (
     <div>title</div>
     <div>contents</div>
   );
}
 
// OK
render() {
  return (
    <div>
      <div>title</div>
      <div>contents</div>
    </div>
  );
}
" %}

또, render()는 어떤 타이밍에 몇번 호출될지 모르기 때문에 반드시 [멱등성](https://ko.wikipedia.org/wiki/%EB%A9%B1%EB%93%B1%EB%B2%95%EC%B9%99)을 지키는 방법으로 구현해야합니다.

### Separation of concerns?

React.js는 컴포넌트로써 마크업과 뷰의 로직을 createClass()의 안에 작성합니다. 하지만 마크업은 HTML이나 mustache로 작성하고 뷰의 로직은 자바스크립트로 나눠서 작성하는 기존의 방식을 취하지 않아 마음에 들지 않는 사람도 있을 것 같습니다. 이 사안에 대해 React.js의 개발자인 Pete Hunt는 "그것은 관심사의 분리(Separation of concerns)가 아니라 기술의 분리(Speparation of technologies)”라며 마크업과 뷰의 로직은 긴밀해야 한다고 언급했습니다. 거기에 템플릿의 문법으로 불필요하게 코드를 작성하는 것보다 자바스크립트로 작성하는 것이 더 좋다고 말하고 있습니다.

{% alert info '역자노트' '
HTML, CSS, 자바스크립트를 분리하는 건 관심사의 분리가 아니라 단순한 기술의 분리일 뿐, 그래서 React.js는 관심사를 컴포넌트 단위로 해석했다고 이해할 수 있습니다.
' %}

### 컴포넌트 간의 상호작용

Prop을 I/F로써 외부와 주고 받을 수 있습니다. `<Hello name="foo"/>` 처럼 작성하면, `this.props.name` 으로 참조할 수 있습니다.

{% prism jsx "
var Hello = React.createClass({
  render() {
    return (
      <div>Hello {this.props.name}</div>
    )
  }
});

// <Hello name=\"React\"/>
// <div>Hello React</div>
" %}

Prop에 관해서는 다음 편에서 소개할 예정입니다.

### 동적으로 갱신

유저의 액션이나 Ajax 요청 등으로 값이 동적으로 변화하는 경우는 State를 사용합니다. 특정 `this.state.xxx`을 갱신할 때는 `this.state`를 사용해 갱신하는 것이 아니라 반드시 `this.setState`를 사용해 갱신합니다.

{% prism jsx "
var Counter = React.createClass({
  getInitialState() {
    return {
      count: 0
    };
  },
  onClick() {
    this.setState({count: this.state.count + 1});
  },
  render() {
    return (
      <div>
        <div>count:{this.state.count}</div>
        <button onClick={this.onClick}>click!</button>
      </div>
    );
  }
});
" %}

State에 관한 내용은 다음 편에서 소개할 예정입니다.

### React.createClass

React.createClass()는 컴포넌트를 작성할 때 사용하는 함수입니다. 이 함수는 버전 0.12에서 동작 방식이 바뀌었습니다. 0.11에서는 컴포넌트의 정의하고 컴포넌트의 엘리먼트를 반환하는 두 가지의 일을 담당했지만 0.12부터 컴포넌트를 정의하는 작업만 담당하도록 분리됐습니다. 즉, 엘리먼트가 아니므로 사용할 때는 `React.createElement(Component, {name: 'xxx'})` 처럼 React Element로 변환할 필요가 있습니다. 이 작업은 `React.createFactory(Component)`로 해도 같습니다. 다만, JSX를 사용하고 있는 경우는 이전과 똑같이 React.createClass의 반환 값을 `<Component />`로 직접 전달해도 괜찮습니다.

{% prism jsx "
var Hello = React.createClass({
  render() {
    return <div>{this.props.name}</div>;
  }
});
 
React.render(React.createElement(Hello, {name: \"foo\"}), document.body);
// or
React.render(React.createFactory(Hello)({name: \"foo\"}), document.body);

// JSX는 이전과 같은 방식
React.render(<Hello name=\"foo\" />, document.body);
" %}

이 변경은 createClass()라는 이름 외에 또 다른 일을 담당하고 있었다는 문제를 해결하기도 하지만, createElement를 통해 컴포넌트를 만들도록 함으로써 최적화할 수 있도록 하고 장기적으로 React.createClass로 작성한 문법을 ES6의 class로 대체 할 수 있도록 하려는 뜻도 있습니다.

{% alert info '역자노트' '
최근에 릴리즈된 버전 0.13에는 ES6의 class 문법을 사용해 컴포넌트를 정의할 수 있게 됐습니다. ([참고](http://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#es6-classes)) ES6 Classes 문법을 이용해 컴포넌트를 작성할 때 몇 가지 주의점이 필요합니다. 이런 사항은 천천히 소개해 드리겠습니다.
' %}

## 정리

여기까지 React.js의 기본적인 특징과 컴포넌트를 명시적으로 서술하기 위한 JSX 문법 등을 알아봤습니다. 컴포넌트는 이 밖에도 Lifecycle을 이용해 hook을 하는 방법도 있습니다. 그 방법에 대해서는 추후 천천히 소개하도록 하고 다음편에서는 Prop와 State 그리고 이 두 속성을 이용해 컴포넌트를 작성하는 방법을 소개하겠습니다.
