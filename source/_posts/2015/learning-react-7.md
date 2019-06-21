---
title: React.js를 이해하다(7)
description: 일본의 개발자 koba04님이 작성한 React.js Advent Calendar를 번역한 글로, React.js를 보다 쉽게 접근하고 이해하기 쉽게 설명합니다. 이 글은 시리즈로 작성됐으며 이 문서는 그 중 마지막 편입니다.
permalink: learning-react-7
date : 2015-07-12
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

## React.js + CSS

React.js 개발자인 [vjeux](https://twitter.com/vjeux)가 「[React:CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js)」 라는 주제로 발표를 했는데 그 내용이 꽤 흥미있고 React.js와도 관계가 있는 것이기 때문에 소개하고자 합니다. 또다른 React.js 개발자 zpao의 「[React Through the Ages](https://speakerdeck.com/zpao/react-through-the-ages)」 라는 발표에서도 이 관점에 관해 언급하고 있습니다.

### CSS를 확장할 때의 문제점

1. Global Namespace
2. Dependencies
3. Dead Code Elimination
4. Minification
5. Sharing Constantsn
6. Non-deterministic Resolution
7. Isolation

여기에서 말하는 확장은 페이스북 정도의 규모에서 확장을 말하는 것 같습니다.

#### Global Namespace

CSS에서 모든 것은 글로벌 공간에 선언되기 때문에 명명 규칙 등으로 분할할 필요가 있습니다.(부트스트랩은 600개의 전역 이름을 정의하고 있습니다.)

#### Dependencies

컴포넌트와의 의존 관계를 관리하기 힘듭니다. 컴포넌트 내에서 requireCSS 처럼 CSS를 읽어 들이도록 했다고 하더라도 다른 곳에서 이미 그 CSS를 require 했다면 이미 동작하게 됩니다.

#### Dead Code Elimination

미사용 코드를 검출하기 어렵습니다.

#### Minification

class 명의 minification에 관한 것입니다. (저자: 할 필요가 있는지 의문입니다) 이것도 템플릿(HTML or JS)과 CSS를 대응하여 개발할 필요가 있습니다.

#### Sharing Constantsn

CSS와 JS 측에서 변수를 공유하기 어렵습니다.

#### Non-deterministic Resolution

CSS에서는 상세한 속성이 같은 경우 나중에 작성한 것이 우선됩니다. 그래서 requireCSS 등의 구조를 사용해 컴포넌트와 같이 비동기로 CSS를 읽을 경우 읽는 순서에 따라 다르게 출력돼 의도하지 않는 결과가 발생할 수 있습니다.

{% prism html %}
<div class="foo bar">xxx</div>
{% endprism %}

{% prism css %}
.foo {color: red}
.bar {color: blue}

/* or */

.bar {color: blue}
.foo {color: red}
{% endprism %}

이를 회피하기 위해서 상세한 속성을 수정하는 등의 작업이 필요할 수 있습니다.

#### Isolation

React.js에서 Button 컴포넌트를 만들었을 때 이 button 태그의 스타일을 지정하려면 Button 컴포넌트가 어떤 태그 구조로 구현돼 있는지를 알아야 할 필요가 있어 컴포넌트를 잘 분리 할 수 없습니다.

{% prism html %}
<div className="foo">
  <Button/> <!-- <div><button>xxx</button></div> -->
</div>
{% endprism %}

{% prism css %}
.foo > div {
  ...
}
{% endprism %}

### 그렇다면 CSS in JS

위와 같은 문제는 Sass 같은 CSS Preprocessor 등을 사용하거나 설계 레벨에서 해결 가능한 것도 있지만, CSS를 JavaScript의 Object 형태로 컴포넌트의 스타일을 지정하는데 사용하면 문제를 해결할 수 있지 않을까 하는 접근법입니다. 즉, 템플릿(HTML)을 JS의 안에 가지고 온 것(JSX)처럼 CSS도 JS 안으로 가지고 오겠다는 뜻입니다.

{% prism js %}
var style = {
  container: {
    backgroundColor: '#ddd',
    width: 900
  }
}

var Container = React.createClass({
  render() {
    return <div style={style.container}>{this.props.children}</div>;
  }
});
{% endprism %}

아래와 같은 함수를 이용하면 조금 더 유연하게 스타일을 지정할 수 있습니다.

{% prism jsx %}
function m() {
  var res = {};
  for (var i=0; i < arguments.length; ++i) {
    if (arguments[i]) assign(res, arguments[i]);
  }
  return res;
}

<div style={m(
  style.container,
  { marginTop: 10 },
  this.props.isWarning && {color: 'red'}
)}>xxx</div>
{% endprism %}

또, Prop을 공개해 밖에서 스타일을 지정하도록 할 수 있습니다.

{% prism jsx %}
propTypes: {
  style: React.PropTypes.object
},
render() {
  return <div style={m(style.container, this.props.style)}>xxx</div>
}
{% endprism %}

스타일의 우선 순위는 순서를 조절하는 것으로 간단히 변경할 수 있습니다.

{% prism jsx %}
propTypes: {
  style: React.PropTypes.object
},
render() {
  return <div style={m(this.props.style, style.container)}>xxx</div>
}
{% endprism %}

이처럼 컴포넌트에 직접 지정하는 것으로 상세한 속성 등은 알 필요 없어지고 JavaScript에 가져오는 것으로 프로그래밍적으로 처리 가능하며 공통화나 상속 등도 간단히 실현할 수 있어 그 결과 처음에 언급한 여러가지 문제를 해결할 수 있습니다. 예에서는 스타일을 컴포넌트의 안에 작성했지만 다른 파일에 작성하고 require 해서 사용할 수도 있습니다. 

JavaScript 쪽으로 마크업을 가지고 온 JSX 처럼 CSS도 JavaScript로 가져오자는 이 접근에 관해 어떻게 생각하시나요? 여기까지 CSS in JS를 소개했습니다.

## React.js in future

React.js의 향후라는 주제로 이번 절을 작성할까 합니다. React.js의 로드맵은 facebook/react와는 다른 저장소 인 [react-future](https://github.com/reactjs/react-future)에서 논의되고 있습니다. 여기에 있는 것은 어디까지나 아이디어 수준이지만 구체적인 코드로 설명돼 있어서 어떤 모습일지 예측하기 쉽습니다.

또, 이전 절에서도 소개했던 「React Through the Ages」 슬라이드에서도 React.js의 현재와 미래에 대해서 이야기하고 있으므로 참고하세요.

### 지금까지의 React.js

React.js는 원래 페이스북이 PHP + XML로 만든 [XHP](https://github.com/facebook/xhp-lib) 프로젝트에서 시작됐습니다. 이를 JavaScript에 가져온 것이 React.js입니다. 애플리케이션 전체적으로 rerender 하는 구조는 서버 측의 rendering 방식과 비슷하다는 점에서도 이런 흐름을 예측할 수 있습니다. 또, React.js는 최초엔 [Standard ML](https://ja.wikipedia.org/wiki/Standard_ML)로 만들어졌다가 그 뒤 Haxe가 되어 지금의 Pure한  JavaScript가 됐습니다.

### 1.0과 그 앞

「React Through the Ages」를 보면 API의 안정화와 삭제 그리고 ES6, 7 사양을 따르려고 하는 의도를 느낄 수 있습니다. ES6, 7에서 사용할 수 있는 기능을 최대한 활용하여 React.js 자체에서는 부가적인 처리를 하지 않겠다는 방향성을 엿볼 수 있습니다.

{% prism jsx %}
class Button extends React.Component {
  getInitialState() {
    return {count: 0};
  },
  render() {
    return (
      <button onClick={() => this.setState({count: this.state.count + 1}) }>
        {this.state.count}
      </button>
    );
  }
}
{% endprism %}

* **CSS in JS** : 이는 이전 절에서 소개한 CSS의 문제를 해결하기 위한 접근 방식입니다.
* **Web Workers** : VirtualDOM 계산을 WebWorkers에서 하는 것으로 UI 단에 좋은 영향을 줄 수 있다면 도입하고 싶다고 합니다.
* **Layout & Animation** : 어떠한 방식으로 정의하도록 하느냐가 어려운 문제이지만 중요한 기능이기 때문에 지원하고 싶다고 합니다.
* **M(V)C** : 자신(페이스북)은 필요하지 않지만 많은 개발자가 React.js를 사용했을 때의 MVC의 M과 C에 대해 논의하거나 개발하고 있는 것을 보고 이에 대한 지원도 중요한 사항으로 여기는 것 같습니다. React.js가 풀-프레임워크가 되는 일은 없을 것 같습니다만...
* **Other** : 이 외에도 새로운 테스트 지원이나 문서, Immutable Data 등 다양한 아이디어가 있는 것 같습니다.

### React.js의 미래

react-future의 저장소를 보면 ES6, 7의 기능을 도입할 경우의 형태를 볼 수 있습니다. 단, 여기에서 소개하는 기능은 아직 구현돼 있지 않고 합의된 것도 아니기 때문에 이렇게 지원된다고 장담할 순 없습니다.

{% alert info 역자노트 %}
일부 기능은 이미 사용할 수 있습니다. 원문이 2014년 12월에 작성됐다는 사실을 감안해주세요.
{% endalert %}

#### Class

{% prism jsx %}
import {Component} from 'react';

export class Button extends Component {
  props : {
    width: number
  }
  static defaultProps = {
    width: 100
  }
  state = {
    counter: Math.round(this.props.width / 10)
  }
  handleClick = (event) => {
    event.preventDefault();
    this.setState({counter: this.state.counter + 1});
  }
  render(props, state) {
    return (
      <div>
        This button has been clicked: {state.counter} times
        <button onClick={this.handleClick} style=&#123;&#123;width: props.width}}/>
      </div>
    );
  }
}
{% endprism %}

ES6의 Module이나 Class, ArrowFunction 등이 사용됐고 React.js 독자적인 부분이 적어졌습니다. 또 props의 형 지정 방식도 변경 됐는데 이는 facebook/flow와 연계될 수도 있을 것 같습니다. (댓글에는 TypeScript compatible syntax로 작성돼 있지만) 또, render에 props와 state를 인자로 전달하는 것 같은 형태로 돼 있습니다.

#### mixin

{% prism jsx %}
import { mixin } from 'react-utils';

const A = {
  componentDidMount() {
    super();
    console.log('A');
  }
};

class B extends mixin(A) {
  componentDidMount() {
    console.log('B');
    super();
  }
}

new B().componentDidMount(); // B, A

import { Component } from 'react';

class Component extends mixin(Component, C) {
  render() {
    return <div/>;
  }
}
{% endprism %}

mixin은 util로써 준비하고, super로 부모의 것을 호출하는 식으로 디자인돼 있습니다. state의 merge 방식에 관한 문제가 있는 것 같습니다.

#### Stateless Functions

{% prism jsx %}
export function Button(props : {width: number, onClick: function}) {
  return (
    <div>
      Fancy button
      <button onClick={props.onClick} style=&#123;&#123;width: props.width}}/>
    </div>
  );
}
{% endprism %}

Prop 만을 갖는 Stateless한 컴포넌트는 Prop을 전달받는 함수로써 정의할 수 있도록 돼 있습니다.

#### Elements

JavaScript 객체 문법이나 JSX 이외에도 여러가지 방법으로 React Element를 작성할 수 있도록 하고자 하는 바램이 있는 것 같습니다.

##### Object 리터럴

{% prism jsx %}
{
  type: Button,
  props: {
    foo: bar,
    children: [
      { type: 'span', props: { children: a } },
      { type: 'span', props: { children: b } }
    ]
  },
  // optional
  key: 'mybutton',
  ref: myButtonRef
}
{% endprism %}

##### Native Components

React.DOM 이하의 API는 없어지고 단순한 문자열로 정의할 수 있도록 돼 있습니다. 또 Web Components의 커스텀 태그에도 호환성을 지니게 돼 있습니다.

##### Template Strings

ES6의 Template Strings을 이용해 정의할 수 있도록 돼 있습니다.

{% prism jsx %}
X`
 <my-button foo=${bar} key="mybutton" ref=${myButtonRef}>
   <span>${a}</span>
   <span>${b}</span>
 </my-button>
`
{% endprism %}

이외에도 여러가지 소개하고 있으므로 흥미가 있다면 꼭 한번 읽어보시길 바랍니다.

## React.js에 관한 리소스, 그리고 정리

여기까지 React.js를 소개했습니만, 조금이라도 사용하는데 참고가 됐다면 좋겠습니다. React.js는 facebook, instagram이나 Github의 AtomEditor 물론, 「Atlassian」, 「Netflix」, 「Reddit」, 「The New York Times」, 「Yahoo」 등 많은 곳에서 사용하고 있는 것 같습니다([참고](https://github.com/facebook/react/wiki/Sites-Using-React)).

또, 내년 1월말에는 [React.js Conf](http://conf.reactjs.com/)가 있으므로 여러가지 소식이 공유되고 점점 분위기도 무르익을 것으로 생각됩니다. 내년도 즐거운 한해가 될 것 같습니다.

React.js의 [공식 블로그](http://facebook.github.io/react/blog/)나 [#reactjs](https://twitter.com/hashtag/reactjs?f=realtime&src=hash) 해쉬 태그를 구독하면 여러가지 정보를 모을 수 있습니다.

### 리소스 정리

개인적으로 읽고 재미있었던 것이나 공식적인 사이트를 정리해봤습니다.

#### 공식 사이트

* [공식 홈페이지](http://facebook.github.io/react/)([한국어](http://reactkr.github.io/react/index.html))
* [Flux](http://facebook.github.io/flux/)
* [Complementary Tools](https://github.com/facebook/react/wiki/Complementary-Tools)
* [Immutable.js](http://facebook.github.io/immutable-js/)
* [Jest](http://facebook.github.io/jest/)

#### 컴포넌트, 샘플 모음집

* [React Coponents](http://react-components.com/): 공개된 React.js 컴포넌트가 정리돼 있습니다.
* [React Rocks](http://react.rocks/): React.js의 샘플이나 데모가 모여있습니다.

#### 입문

* [Learning React.js: Getting Started and Concepts](https://scotch.io/tutorials/learning-react-getting-started-and-concepts): React.js를 사용하여 앱을 만드는 과정을 순차적으로 쉽게 설명하고 있습니다.
* [React JS and why it's awesome](http://www.slideshare.net/AndrewHull/react-js-and-why-its-awesome): React.js의 장점이 잘 설명돼 있습니다.

#### Virtual DOM

* [OSCON - React Architecture](https://speakerdeck.com/vjeux/oscon-react-architecture): 페이스북 개발자가 설명하는 React.js의 VirualDOM 구현 단의 이야기 입니다.
* [Components, React and Flux](http://slides.com/danabramov/components-react-flux-wip#/): React.js와 Flux를 코드와 함께 이해하기 쉽게 설명하고 있습니다.

#### Flux

* [Isomorphic Flux](https://speakerdeck.com/mridgway/isomorphic-flux): Yahoo가 Isomorphic한 Flux 애플리케이션을 만든 이야기입니다.
* [flux-meetup](https://speakerdeck.com/fisherwebdev/flux-meetup): 페이스북의 개발자가 하는 React.js와 Flux에 관한 설명입니다.

#### Developer tool

소개하는 것을 깜빡 잊고 있었습니다. React.js 개발을 할 때에 편리하게 사용할 수 있는 크롬 확장 도구인 [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)도 있습니다.

아래 그림과 같이 React.js를 사용하는 페이지에 가면 개발자 도구에 React탭이 표시되고 거기서 HTML의 태그가 아니라 Component로 볼 수 있습니다. 또, Prop과 State및 EventListener와 Component의 값도 확인 할 수 있어 편리하게 디버깅할 수 있습니다.

{% figure react_debugging_tool.01.png 'React Developer Tools' '그림 1 React Developer Tools' %}

## 정리

역시 읽을 때와 번역해서 공유할 때 느낌은 많이 다르네요. 알아서 이해했던 것들도 신경 써야 하니 시간이 좀 걸렸습니다.  koba04님의 React.js Advent Calendar는 제가 처음 React.js를 학습할때 도움을 받았던 문서였기 때문에 무엇부터 차근차근 봐야 할지 모르시는 분들이 있을 것 같아서 일본어 문서를 번역했습니다. React.js를 이해하는데 많은 도움이 되길 간절히 바라면서 이만 마치도록 하겠습니다.

여기까지 React.js를 소개했습니다. 끝까지 읽어주셔서 감사합니다!
