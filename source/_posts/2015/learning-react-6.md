---
title: React.js를 이해하다(6)
description: 일본의 개발자 koba04님이 작성한 React.js Advent Calendar를 번역한 글로, React.js를 보다 쉽게 접근하고 이해하기 쉽게 설명합니다. 이 글은 시리즈로 작성됐으며 이 문서는 그 중 여섯번째 편입니다.
permalink: learning-react-6
date : 2015-07-11
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

## React.js의 테스트

이번에는 React.js 환경에서 테스트하는 방법을 소개하겠습니다.

### React.js와 테스트

React.js는 컴포넌트에 대응하여 테스트를 작성해야 하므로 DOM을 의존하여 힘들 것으로 예상하지만 React.addons.TestUtils라는 Addon이 테스트에 편리한 함수를 제공하고 있으므로 이를 이용하면 더 쉽게 테스트를 작성할 수 있습니다.

### DOM이 필요할까?

React.js 컴포넌트는 서버-사이드에서도 사용할 수 있으므로 node.js 환경에서 테스트를 작성하고 싶을 수 있지만 onClick이나 onKeyUp 같은 이벤트에 실제로 반응하는지 테스트하기 위해서 DOM이 필요합니다. 단순히 Prop 값을 전달하고 renderToStaticMarkup을 사용하여 결괏값인 HTML을 테스트하는 경우엔 node.js 환경에서 작성할 수 있습니다.

### 이벤트 시뮬레이트

「버튼을 클릭하면」이라는 테스트를 작성하고자 할 때 DOM을 셀렉트하고 값을 설정하여 이벤트를 발생시키는 일련의 과정이 필요하지만, React.addons.TestUtils.Simulate를 사용하면 DOM을 지정하고, 전달하고 싶은 이벤트 객체의 형식을 지정할 수 있으므로 격식없이 사용자 액션 테스트를 작성할 수 있습니다.

{% prism js %}
Simulate.{eventName}(DOMElement element, object eventData)
{% endprism %}

{% prism js %}
var node = this.refs.input.getDOMNode();

React.addons.TestUtils.Simulate.click(node);

// 전달하고자 하는 이벤트 객체를 지정한다.
React.addons.TestUtils.Simulate.change(node, {target: {value: 'Hello, world'}});
React.addons.TestUtils.Simulate.keyDown(node, {key: 'Enter'});
{% endprism %}

### 컴포넌트 작성 지원

#### renderIntoDocument

renderIntoDocument를 사용하면 DOM에 컴포넌트를 실제로 추가하지 않아도 테스트할 수 있습니다. 아래 예제를 보면 일단 renderintoDocument가 컴포넌트를 DOM에 추가해 나갈 것으로 보입니다.

{% prism jsx %}
var Hello = require('./components/hello');
var component = React.addons.TestUtils.renderIntoDocument(<Hello name=\"foo\" />);
{% endprism %}

하지만 이것은 실제 DOM 트리에 추가되는 것이 아니라 document.createElement로 생성한 div에 render 할 뿐입니다. 그래서 요소의 실제 높이나 너비 등은 알 수 없습니다. (이름이 다소 혼란스럽기 때문에 변경될 수 있을 것 같습니다)

#### mockComponent

Jest를 사용하고 있을 때 mock 컴포넌트에서 더미로 `<div/>`(엘리먼트 요소)를 반환하도록 하는 mockComponent도 있습니다. 이 함수를 사용하기 위해서는` component.prototype.render.mockImplementation`이 작성되어야 하는데 Jest를 고려한 함수([mockFn.mockImplementation(fn)](http://facebook.github.io/jest/docs/api.html#mockfn-mockimplementation-fn)) 인듯합니다. 자주 쓰일지 모르겠습니다만, 보통 Mock으로 작성한 컴포넌트에서 render를 동작시키고 싶을 때 사용하는 듯합니다.

{% prism js %}
mockComponent: function(module, mockTagName) {
  mockTagName = mockTagName || module.mockTagName || 'div';

  module.prototype.render.mockImplementation(function() {
    return React.createElement(
      mockTagName,
      null,
      this.props.children
    );
  });

  return this;
},
{% endprism %}

### 컴포넌트 셀렉트

#### findAllInRenderedTree(ReactComponent tree, function test)

특정 컴포넌트의 하위 컴포넌트 중에서 지정한 함수의 조건을 충족한 컴포넌트만 배열로 반환합니다. 아래에서 소개할 함수를 사용할 수 없는 경우에 사용할 수 있는 가장 기본적인 구현입니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.findAllInRenderedTree(
    React.render(<div><span>foo</span><span>bar</span><p>baz</p></div>, document.body),
    function(component) { return component.tagName === 'SPAN' }
  ).map(function(component){ return component.getDOMNode().textContent })
);
 
// ['foo', 'bar']
{% endprism %}

#### scryRenderedDOMComponentsWithClass(ReactComponent tree, string className)

특정 컴포넌트의 하위 컴포넌트 중, 지정한 className에 해당하는 컴포넌트를 배열로 반환합니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.scryRenderedDOMComponentsWithClass(
    React.render(
      <div>
        <span className=\"foo\">foo1</span>
        <span className=\"foo\">foo2</span>
        <span className=\"bar\">barbar</span>
      </div>,
      document.body
    ),
    'foo'
  ).map(function(component){ return component.getDOMNode().textContent })
);
 
// ['foo1', 'foo2']
{% endprism %}

#### findRenderedDOMComponentWithClass(ReactComponent tree, string className)

특정 컴포넌트의 하위 컴포넌트 중, 지정한 className에 해당하는 컴포넌트를 1개만 반환합니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.findRenderedDOMComponentWithClass(
    React.render(
      <div>
        <span className=\"foo\">foo1</span>
        <span className=\"foo2\">foo2</span>
        <span className=\"bar\">barbar</span>
      </div>,
      document.body
    ),
    'foo'
  ).getDOMNode().textContent
);
 
// ['foo1']
{% endprism %}

해당하는 컴포넌트가 없거나 여러개가 매치되면 오류를 발생시킵니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.findRenderedDOMComponentWithClass(
    React.render(
      <div>
        <span className=\"foo\">foo1</span>
        <span className=\"foo\">foo2</span>
        <span className=\"bar\">barbar</span>
      </div>,
      document.body
    ),
    'foo'
  ).getDOMNode().textContent
);
 
//  Uncaught Error: Did not find exactly one match for class:foo
{% endprism %}

#### scryRenderedDOMComponentsWithTag(ReactComponent tree, string tagName)

특정 컴포넌트의 하위 컴포넌트 중, 지정한 태그 네임에 해당하는 컴포넌트를 배열로 반환합니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.scryRenderedDOMComponentsWithTag(
    React.render(
      <div>
        <span>foo1</span>
        <span>foo2</span>
        <p>barbar</p>
      </div>,
      document.body
    ),
    'span'
  ).map(function(component){ return component.getDOMNode().textContent })
);
 
// ['foo1', 'foo2']
{% endprism %}

#### findRenderedDOMComponentWithTag(ReactComponent tree, string tagName)

특정 컴포넌트의 하위 컴포넌트 중, 지정한 className에 해당하는 컴포넌트를 1개만 반환합니다. 해당하는 컴포넌트가 없거나 여러개가 매치되면 오류를 발생시킵니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.findRenderedDOMComponentWithTag(
    React.render(
      <div>
        <span>foo1</span>
        <span>foo2</span>
        <p>barbar</p>
      </div>,
      document.body
    ),
    'p'
  ).getDOMNode().textContent
);
 
// barbar
{% endprism %}

#### scryRenderedComponentsWithType(ReactComponent tree, function componentClass)

특정 컴포넌트의 하위 컴포넌트 중, 지정한 컴포넌트의 인스턴스에 해당하는 컴포넌트를 배열로 반환합니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.scryRenderedComponentsWithType(
    React.render(
      <div>
        <Hello name=\"foo\" key=\"foo\" />
        <Hello name=\"bar\" key=\"bar\" />
        <span>xxx</span>
        <p>zzz</p>
      </div>,
      document.body
    ),
    Hello
  ).map(function(component){ return component.getDOMNode().textContent })
);
 
// ['foo', 'bar']
{% endprism %}

#### findRenderedComponentWithType(ReactComponent tree, function componentClass)

특정 컴포넌트의 하위 컴포넌트 중, 지정한 컴포넌트의 인스턴스에 해당하는 컴포넌트를 1개만 반환합니다. 해당하는 컴포넌트가 없거나 여러개가 매치되면 오류를 발생시킵니다.

{% prism jsx %}
console.log(
  React.addons.TestUtils.findRenderedComponentWithType(
    React.render(
      <div>
        <Hello name="foo" key="foo" />
        <span>xxx</span>
      </div>,
      document.body
    ),
    Hello
  ).getDOMNode().textContent
);
 
// foo
{% endprism %}

### Assert

React 컴포넌트의 상태를 확인하기 위한 함수들의 모음입니다.

#### isElementOfType(ReactElement element, function componentClass)

특정 컴포넌트가 지정한 컴포넌트의 인스턴스에 해당하는지를 판단합니다.

{% prism jsx %}
React.addons.TestUtils.isElementOfType(<Hello />, Hello);
{% endprism %}

#### isDOMComponent(ReactComponent instance)

특정 컴포넌트가 div나 span과 같은 DOM 컴포넌트인지 판단합니다.

{% prism jsx %}
React.addons.TestUtils.isDOMComponent(
  React.render(<div />, document.body)
);
{% endprism %}

#### isCompositeComponent(ReactComponent instance)

특정 컴포넌트가 React.createClass에 의해 정의된 컴포넌트를 포함해 작성된 것인지 판단합니다. div나 span 등은 포함하지 않습니다.

{% prism jsx %}
React.addons.TestUtils.isCompositeComponent(
  React.render(<Hello />, document.body)
);
{% endprism %}

#### isCompositeComponentWithType(ReactComponent instance, function componentClass)

특정 컴포넌트가 지정한 Component 타입을 포함해 작성된 것인지 판단합니다.

{% prism jsx %}
React.addons.TestUtils.isCompositeComponentWithType(
  React.render(<Hello />, document.body), Hello
);
{% endprism %}

#### isTextComponent(ReactComponent instance)

특정 컴포넌트가 텍스트 컴포넌트를 반환하는지 판단합니다.

{% prism js %}
var textComponents = React.addons.TestUtils.findAllInRenderedTree(
  React.render(
    <div>{'hello'}{'react'}</div>,
    document.body
  ),
  function(component) {
    return React.addons.TestUtils.isTextComponent(component)
  } 
);
console.log(textComponents[0].props + ' ' + textComponents[1].props);
// hello react
{% endprism %}

여기까지 TestUtils의 종류와 사용 방법을 설명했습니다. 다음 절에서는 페이스북이 만들고 배포한 테스트 프레임워크인 Jest와 조합하는 방법을 소개하고자 합니다.

## React.js와 Jest

이전에는 TestUtils를 사용하는 방법을 중심으로 설명했습니다. 이번에는 facebook이 개발하고 있는 Jest라고 하는 프레임워크와 함께 구성해 보고자 합니다.

### Painless JavaScript Unit Testing

Jest는 공식 홈페이지에서 「Painless JavaScript Unit Testing」 문구를 대표적으로 소개하고 있으며 도입하기 쉽다는 특징을 가지고 있습니다. 그 특징으로는 「Mock By Default」가 있는데 기본적으로 Jest에서는 CommonJS Style의 require 구문이 Mock을 반환하도록 설정합니다. 조금 과격한 느낌입니다만 테스트 대상이 되는 동작에만 민감한 테스트를 간단하게 작성할 수 있습니다. 반대로 테스트 대상 이 외는 모두 Mock으로 대체 되므로 인터페이스 밖에 테스트 할 수 없지만, 그것은 Unit Test의 범위 밖으로 볼 수 있어서 큰 문제가 되지 않습니다.

### Jasmine

Jest는 Jasmine을 기반으로 만들어졌습니다. 따라서 Assert 등과 같은 기본적인 문법은 Jasmine과 같습니다. 단, Jasmine 2.0에서 비동기 테스트를 작성하기 보다 쉬워졌지만 1.3을 기반으로 하고 있어 이를 이용할 수 없습니다([issues/74](https://github.com/facebook/jest/issues/74)).

### DOM

Jest는 jsdom으로 생성한 DOM 위에서 실행되므로 Node.js 환경처럼 CLI로 테스트를 실행할 수 있습니다. 즉, Jest를 사용하면 Karma 같은 Test Runner를 사용할 필요가 없으므로 간단하게 도입할 수 있습니다.

### Install

jest-cli만 설치하면 됩니다.

{% prism bash %}
$ npm install --save-dev jest-cli
{% endprism %}

### tests

기본적으로 __tests__ 디렉터리를 찾습니다. 그리고 그 디렉터리 내의 파일을 테스트로써 실행합니다. 따라서 Getting Started에서도 알 수 있듯이 __tests__ 디렉터리를 내에 테스트 파일를 두고 jest를 실행하면 테스트가 진행됩니다. 만약 jest-cli를 전역이 아닌 devDependencies에 설치한다면 package.json의 scripts 프로퍼티에 npm test로 실행할 수 있도록 아래처럼 작성하면 편리하게 사용할 수 있습니다.

{% prism js %}
"scripts": {
  "test": "jest"
}
{% endprism %}

### React.js를 테스트한다.

Jest의 [Tutorial – React](https://facebook.github.io/jest/docs/tutorial-react.html) 문서에 React.js를 사용한 애플리케이션을 테스트하는 경우도 작성돼 있습니다. 테스트하기 위해서는 두 가지 설정을 할 필요가 있습니다.

#### JSX의 변환

JSX를 사용해 애플리케이션을 작성한 경우에는 테스트를 위해 JSX를 변환할 필요가 있습니다. package.json의 Jest 프로퍼티에 scriptPreprocessor로 사전에 동작해야할 script를 지정합니다.

{% prism js %}
// package.json
"jest": {
  "scriptPreprocessor": "preprocessor.js"
},

// preprocessor.js
var ReactTools = require(\'react-tools\');
module.exports = {
  process: function(src) {
    return ReactTools.transform(src, {harmony: true});
  }
};
{% endprism %}

### Mock의 해제

위에서 언급한 것처럼 Jest에서는 모든 require 구문이 Mock을 반환합니다. 단, React도 Mock으로 대체되면 테스트할 수 없으므로 react를 Mock으로 대체하지 않도록 경로를 설정할 필요가 있습니다. 이러한 설정도 package.json에 속성을 추가하는 것으로 간단하게 할 수 있습니다. 테스트 파일에서도 Mock하지 않을 파일을 지정할 수 있지만, 만약 모든 테스트에서 Mock 하고 싶지 않은 파일이 있다면 아래와 같이 작성합니다.

{% prism jsx %}
"jest": {
  "scriptPreprocessor": "preprocessor.js",
  "unmockedModulePathPatterns": ["node_modules/react"]
},
{% endprism %}

### 테스트 작성해보기

아래와 비슷한 느낌으로 React 컴포넌트의 테스트를 작성할 수 있습니다.([참고](https://github.com/koba04/react-boilerplate/blob/master/app/components/__tests__/InputArtistTest.js))

{% prism jsx %}
jest.dontMock('../InputArtist');
 
var React = require('react/addons'),
    InputArtist = require('../InputArtist'),
    AppTracksActionCreators = require('../../actions/AppTracksActionCreators')
;
 
describe('inputArtist', function() {
  var inputArtist;
  beforeEach(function() {
    inputArtist = React.addons.TestUtils.renderIntoDocument(<InputArtist />);
  });
 
  describe('state',  function() {
    it('set inputArtist radiohead', function() {
      expect(inputArtist.state.inputArtist).toBe('radiohead');
    });
  });
 
  describe('handleSubmit', function() {
    var preventDefault;
    beforeEach(function() {
      preventDefault = jest.genMockFunction();
      inputArtist.setState({ inputArtist: 'travis' });
      React.addons.TestUtils.Simulate.submit(inputArtist.getDOMNode(), {
        preventDefault: preventDefault
      });
    });
    it ('calls AppTracksActionCreators.fetchByArtist with state.inputArtist', function() {
      expect(AppTracksActionCreators.fetchByArtist).toBeCalled();
      expect(AppTracksActionCreators.fetchByArtist).toBeCalledWith('travis');
    });
    it ('calls e.preventDefault', function() {
      expect(preventDefault).toBeCalled();
    });
  });
});
{% endprism %}

{% figure react_test.01.gif 'Jest 동작 테스트' '그림 1 Jest 동작 테스트' %}

그럼 코드를 자세히 살펴보겠습니다.

{% prism js %}
jest.dontMock('../InputArtist');
{% endprism %}

Mock으로 대체할 필요가 없는 module은 dontMock에 명시적으로 지정합니다.

{% prism js %}
var React = require('react/addons'),
    InputArtist = require('../InputArtist'),
    AppTracksActionCreators = require('../../actions/AppTracksActionCreators')
;
{% endprism %}

React는 package.json의 unmockedModulePathPatterns의 지정했으므로 Mock으로 대체되지 않습니다. 그 외 다른 모듈은 Mock으로 대체됩니다.

{% prism jsx %}
describe('inputArtist', function() {
  var inputArtist;
  beforeEach(function() {
    inputArtist = React.addons.TestUtils.renderIntoDocument(<InputArtist />);
  });
 
  describe('state',  function() {
    it('set inputArtist radiohead', function() {
      expect(inputArtist.state.inputArtist).toBe('radiohead');
    });
  });
{% endprism %}

이 코드는 보통의 Jasmine 테스트 코드와 같습니다. React.addons.TestUtils.renderIntoDocument를 사용하여 Component를 DOM에 붙여서 테스트하고 있습니다.

{% prism jsx %}
describe('handleSubmit', function() {
  var preventDefault;
  beforeEach(function() {
    preventDefault = jest.genMockFunction();
    inputArtist.setState({ inputArtist: 'travis' });
    React.addons.TestUtils.Simulate.submit(inputArtist.getDOMNode(), {
      preventDefault: preventDefault
    });
  });
  it ('calls AppTracksActionCreators.fetchByArtist with state.inputArtist', function() {
    expect(AppTracksActionCreators.fetchByArtist).toBeCalled();
    expect(AppTracksActionCreators.fetchByArtist).toBeCalledWith('travis');
  });
  it ('calls e.preventDefault', function() {
    expect(preventDefault).toBeCalled();
  });
{% endprism %}

위는 submit 버튼이 클릭 됐을 때 fetchByArtist와 e.preventDefault가 호출되는지 테스트하는 코드입니다. React.addons.TestUtils.Simulate.submit를 사용해 submit 이벤트를 발생시켜 이벤트 객체의  jest.genMockFunction 생성한 preventDefault Mock 함수을 통해서 호출됐지 확인합니다. fetchByArtist는 실제로 Ajax 요청을 하지만 Jest가 Mock으로  대체했으므로 특별히 의식하지 않고 간단하게 테스트를 작성할 수 있습니다.

### Mock

Mock은 jest.genMockFunction과 같은 API로 직접 만드는 것도 가능하며 mock property에 calls나 instances 등의 호출 정보가 기록되므로 이 기록을 사용해 테스트를 작성할 수 있습니다. 또, Mock Function의 mockReturnValue를 사용해 지정한 값을 반환하도록 할 수 있고 mockimplementation에 callback을 전달하는 것으로 직접 Mock을 구현할 수도 있습니다.

#### Mock Assert

Mock을 확인하기 위한 assert도 준비돼 있습니다. expect(mockFunc).toBeCalled와 같이 테스트를 작성할 수 있습니다.

#### module 교체

__mocks__ 디렉터리를 생성하여 그 안에 module 구현을 작성하는 하면 테스트 시 모듈 자체를 항상 대체할 수 있습니다. superagent를 Mock으로 대체하면 에러가 발생하는 이슈가 있는데, 이를 방지하기 위해 [__mocks__/superagent.js](https://github.com/koba04/react-boilerplate/blob/master/app/actions/__mocks__/superagent.js)에서 workaround로 Mock을 두고 있습니다.

### Timer

setTimeout이나 setInterval을 사용하는 구현을 테스트하는 경우 jset.runAllTimers나 jset.runOnlyPendingTimers를 사용하여 동기적으로 테스트를 작성할 수 있습니다. runAllTimers는 setTimeout이나 setInterval 큐에 존재하는 모든 태스크를 실행하고 runOnlyPendingTimers는 호출한 시점에서 대기중인 태스크만 실행합니다. setTimeout으로 반복하고 있는 구현의 경우 runAllTimers를 사용하면 무한 루프에 빠지므로 runOnlyPendingTimers를 사용해 한 번에 하나씩 테스트를 진행하도록 작성합니다.

### API

API는 공식 홈페이지의 [API Reference](https://facebook.github.io/jest/docs/api.html#content)에 정리돼 있습니다. 여기에서 전부 소개하진 않지만 여러 상황에 대응한 API를 제공하고 있음을 알 수 있습니다.

### 불편한 점

이것저것 설정하여 해결할 수 있을지 모르지만, Karma와 비교할 때 상대적으로 테스트 실행이 느립니다. 이슈([issues/116](https://github.com/facebook/jest/issues/116))로도 등록돼 있으므로 빨리 개선되길 바랍니다.

여기까지 Jest를 소개하겠습니다. 다음 절에서는 Flux를 소개하겠습니다.

## React.js와 Flux

이번에는 React.js와 관계가 깊은 [Flux](http://facebook.github.io/flux/)를 소개하겠습니다.

### Flux is Architecture

{% figure react_flux.01.png 'Flux 아키텍처' '그림 2 Flux 아키텍처' %}

위는 깃-허브 저장소에 명시된 그림입니다. Flux는 위와 같은 아키텍처의 명칭이기도 합니다. 조금 더 살펴보면 알겠지만, Dispatcher 부분만 구현하고 있습니다.

### Unidirectional data flow

위 아키텍처를 보면 알 수 있듯이 Flux는 애플리케이션의 복잡함을 없애기 위해서 데이터의 흐름을 단방향 운영합니다. 이런 방식은 전체적인 처리 흐름을 알기 쉽지만 Angular.js 등과 비교했을 때 상대적으로 표현이나 문법이 장황한 느낌이 있습니다. 그렇지만 데이터의 흐름을 단순하게 만드는 것으로 애플리케이션의 규모가 커져 복잡화돼도 데이터나 이벤트의 흐름이 엉키지 않고 파악하기 쉬운 구조를 유지할 수 있다고 합니다. (실제로 Flux를 사용해 대규모 애플리케이션을 구현해보지 않아서 단언할 순 없습니다)

자, 그럼 [react-boilerplate](https://github.com/koba04/react-boilerplate)를 예제를 사용해 본격적으로 Flux를 소개하겠습니다.

### Flux의 구성 요소

#### Constants

Flux에서는 각 요소 간 주고 받을 타입을 상수처럼 정의합니다.

{% prism js %}
var keyMirror = require('react/lib/keyMirror');
 
module.exports = {
  ActionTypes: keyMirror({
    RECEIVE_TRACKS_BY_ARTIST: null,
    RECEIVE_TRACKS_BY_COUNTRY: null
  }),
  PayloadSources: keyMirror({
    VIEW_ACTION: null
  })
};
{% endprism %}

참고로 keyMirror는 key를 사용해 value로 설정해주는 Util 입니다.

#### Dispatcher

Dispatcher는 Action을 받아 등록된 callback을 실행합니다. 여기에서는 facebook/flux가 유일하게 제공하고 있는 Dispatcher를 확장하는 느낌으로 오브젝트를 생성해 싱들톤으로 반환합니다. 여기에서는 ActionCreators부터 Dispatcher에 Acton을 던지기 위한 handleViewAction을 정의하고 있습니다.

{% prism js %}
var Dispatcher    = require('flux').Dispatcher,
    assign        = require('object-assign'),
    AppConstants  = require('../constants/AppConstants')
;
 
var PayloadSources = AppConstants.PayloadSources;
 
module.exports = assign(new Dispatcher(), {
  handleViewAction: function(action) {
    this.dispatch({
      source: PayloadSources.VIEW_ACTION,
      action: action
    });
  }
});
{% endprism %}

#### Store

Store는 애플리케이션의 데이터와 비즈니스 로직을 담당합니다. Store에서 담당하는 데이터는 메시지 목록과 같은 집합도 다룹니다.

{% prism js %}
var AppDispatcher = require('../dispatcher/AppDispatcher'),
    AppConstants  = require('../constants/AppConstants'),
    EventEmitter  = require('events').EventEmitter,
    assign        = require('object-assign')
;
 
var ActionTypes = AppConstants.ActionTypes;
var CHANGE_EVENT = 'change';
var tracks = [];
 
var TrackStore = assign({}, EventEmitter.prototype, {
 
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  getAll: function() {
    return tracks;
  },
});
 
TrackStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;
 
  switch (action.type) {
    case ActionTypes.RECEIVE_TRACKS_BY_ARTIST:
      tracks = action.tracks;
      TrackStore.emitChange();
      break;
    case ActionTypes.RECEIVE_TRACKS_BY_COUNTRY:
      tracks = action.tracks;
      TrackStore.emitChange();
      break;
  }
});
 
module.exports = TrackStore;
{% endprism %}

여기에서 눈여겨 봐야 할 포인트는 다음과 같습니다.

* getter 메서드만 정의하여 외부에서 데이터에 접근할 수 없는 형태로 유지합니다.
* 데이터의 갱신은 ActionCreator에서 Despatcher에 전달하여 등록한 callback 함수를 호출하여 실시합니다.
* Dispatcher에 callback을 등록하여 처리 할 수 있도록 합니다.
* Store는 EventEmiiter의 기능을 가지고 있어 데이터가 갱신되면 이벤트를 발행합니다.
* View는 Store의 이벤트를 구독합니다.

#### ActionCreators (Action)

Action을 생성해 Dispatcher에 전달합니다. 이 문서의 예제에서는 Ajax 요청도 ActionCreators 내에서 담당하고 있지만 facebook/flux의 예제에서는 Utils 이라고 하는 네임스페이스를 만들어 그 안에서 담당하도록 디자인돼 있습니다. Ajax이 끝난 시점뿐만 아니라 시작한 시점에도 Action을 발생시켜 로딩하는 View를 출력할 수도 있을 것 같습니다.

{% prism js %}
var request = require('superagent'),
    AppDispatcher = require('../dispatcher/AppDispatcher'),
    AppConstants  = require('../constants/AppConstants')
;
 
var ActionTypes = AppConstants.ActionTypes;
var urlRoot = 'http://ws.audioscrobbler.com/2.0/?api_key=xxxx&format=json&';
 
// TODO Loading
module.exports = {
  fetchByArtist: function(artist) {
    request.get(
      urlRoot + 'method=artist.gettoptracks&artist=' + encodeURIComponent(artist),
      function(res) {
        AppDispatcher.handleViewAction({
          type: ActionTypes.RECEIVE_TRACKS_BY_ARTIST,
          tracks: res.body.toptracks.track
        });
      }.bind(this)
    );
  },
  fetchByCountry: function(country) {
    request.get(
      urlRoot + 'method=geo.gettoptracks&country=' + encodeURIComponent(country),
      function(res) {
        AppDispatcher.handleViewAction({
          type: ActionTypes.RECEIVE_TRACKS_BY_ARTIST,
          tracks: res.body.toptracks.track
        });
      }.bind(this)
    );
  }
};
{% endprism %}

Action은 아래와 같은 형태의 리터럴 객체입니다.

{% prism js %}
{
  type: ActionTypes.RECEIVE_TRACKS_BY_ARTIST,
  tracks: res.body.toptracks.track
}
{% endprism %}

#### View (ReactComponent)

데이터를 출력하는 View와 Action을 발생하는 View를 나누어서 소개하겠습니다.

##### Store의 데이터를 출력하는 컴포넌트

View에서는 componentDidMount로 Store의 change 이벤트를 구독하고 componentWillUnmount에서 구독을 해제하고 있습니다. change 이벤트가 발행되면 Store에서 다시 데이터를 가져와 setState에 설정합니다. 여기에서 Store 데이터는 동기적으로 취득할 수 있다고 전제하고 있습니다.

{% prism jsx %}
module.exports = React.createClass({
  getInitialState() {
    return {
      tracks: TrackStore.getAll(),
    };
  },
  componentDidMount: function() {
    TrackStore.addChangeListener(this.<onChange);
  },
  componentWillUnmount: function() {
    TrackStore.removeChangeListener(this.<onChange);
  },
  <onChange: function() {
    this.setState({ tracks: TrackStore.getAll() });
  },
  render() {
    var tracks = this.state.tracks.map( (track, index) => {
      return (
        <li className="list-group-item" key={index}>
          <span className="label label-info">{index+1}</span>
          <a href={track.url} target="<blank"><span className="track">{track.name}</span></a>
          <span className="artist">{track.artist.name}</span>
          <small className="listeners glyphicon glyphicon-headphones">{track.listeners}</small>
        </li>
      );
    });
    return (
      <div className="tracks">
        <ul className="list-group">
          {tracks}
        </ul>
      </div>
    );
  }
});
{% endprism %}

##### Action을 발생시키는 컴포넌트

이번에는 이벤트를 받아서 ActionCreator에 전달하는 컴포넌트입니다.

{% prism jsx %}
      AppTracksActionCreators.fetchByArtist(artist);
    }
  },
  render() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleSubmit} >
        <div className="form-group">
          <label htmlFor="js-input-location" className="col-sm-1 control-label">Artist</label>
          <div className="col-sm-11">
            <input type="text" className="form-control" placeholder="Input Atrist Name" valueLink={this.linkState(\'inputArtist\')} required />
          </div>
        </div>
        <div className="form-group">
          <div className="col-sm-offset-1 col-sm-11">
            <button type="submit" className="btn btn-primary"><span className="glyphicon glyphicon-search">search</span></button>
          </div>
        </div>
      </form>
    );
  }
});
{% endprism %}

{% alert info 역자노트 %}
Flux를 조금 더 알고 싶다면 「[페이스북의 결정: MVC는 확장에 용이하지 않다. 그렇다면 Flux다.](/2015/06/19/mvc-does-not-scale-use-flux-instead/)」와 「[다같이! FluxUtils 한바퀴](http://www.slideshare.net/UyeongJu/fluxutils)」를 참고해주세요.
{% endalert %}

이 모두를 종합해보면 Dispatcher -> Store -> View -> ActionCreator -> Dispatcher 순으로 데이터가 단방향으로 흘러간다는 사실을 알 수 있습니다.

### 그 외 Flux 구현

Flux의 아키텍처는 비교적 단순합니다. 실제로 애플리케이션을 개발하고 있는 개발자는 각각 확장하여 여러 가지 형태의 Flux를 구현하고 있습니다. 몇 가지 소개해드리겠습니다. Flux를 구현할 때 참고하세요.

* [Yahoo의 Flux 구현](https://github.com/yahoo/flux-examples)
* [RefluxJS](https://github.com/spoike/refluxjs)
* [McFly](http://kenwheeler.github.io/mcfly/)
* [Delorean](http://deloreanjs.com/)
* [Fluxxor](http://fluxxor.com/)

### Flux + server-side rendering

Flux의 경우, Store의 데이터가 싱글톤이 되지만 Server-Side Rendering의 경우는 싱글-톤으로 생성하면 안 되기 때문에 리퀘스트마다 Store를 생성할 필요가 있으므로 주의가 필요합니다. 이 문제를 어떻게 해결햇는지는 Yahoo의 개발자가 작성한 [isomorphic-flux](https://speakerdeck.com/mridgway/isomorphic-flux) 슬라이드를 참고하시길 바랍니다.

### 데이터 검증

개인적으로 데이터 검증을 담당하는 곳은 Store라고 생각합니다. View가 Action을 발생시키고 Store가 받았을 때 부정확한 데이터의 경우 오류를 발생시켜 View에 전달하고 View는 필요하다면 에러를 출력하는 흐름이 좋은 것 같습니다.

{% prism txt %}
------        ------------        ---------------------        ------
|View|--------|Dispatcher|--------|Store에서 Validation|--------|View|--- 에러 표시
------ action ------------ action --------------------- error  ------
{% endprism %}

에러를 전달하는 방법은 여러가지가 있습니다만 Node.js에서 첫 번째 인자로 err를 전달하는 패턴을 사용하면 좋을 것 같습니다.

{% prism jsx %}
// Store
var TrackStore = assign({}, EventEmitter.prototype, {
 
  emitChange: function(err) {
    this.emit(CHANGE_EVENT, err);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  getAll: function() {
    return tracks;
  },
});
 
TrackStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;
 
  switch (action.type) {
    case ActionTypes.RECEIVE_TRACKS_BY_ARTIST:
      var err = null;
      if (action.tracks.length === 0) {
        err = 'no tracks';
      } else {
        tracks = action.tracks;
      }
      TrackStore.emitChange(err);
      break;
    case ActionTypes.RECEIVE_TRACKS_BY_COUNTRY:
      tracks = action.tracks;
      TrackStore.emitChange();
      break;
  }
});
 
// View
module.exports = React.createClass({
  getInitialState() {
    return {
      tracks: TrackStore.getAll(),
      err: null
    };
  },
  componentDidMount: function() {
    TrackStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    TrackStore.removeChangeListener(this._onChange);
  },
  _onChange: function(err) {
    if (err) {
      this.setState({err: err});
    } else {
      this.setState({ tracks: TrackStore.getAll() });
    }
  },
{% endprism %}

또는 err가 아니라 객체를 전달하여 type으로써 error을 지정하거나 에러는 별도의 이벤트로써 발행하는 방법(CHANGE_EVENT가 아닌 ERROR_EVENT 등)도 있을 것 같습니다. Flux는 개념을 제공한 부분이 많으므로 이 개념을 잘 이용해 자신에게 맞는 최적의 환경을 구성하는 게 좋을 것 같습니다. 하지만 전혀 다른 형태의 Flux가 난립하여 혼란스러울 수도 있으니 조심히 접근합시다.

## 정리

이번 편에서는 React.js에서 테스트를 작성하는 방법과 테스트 프레임워크인 Jest 그리고 Flux 아키텍처를 간단히 소개했습니다. 다음 편에서는 React.js와 CSS의 관계를 CSS in JS 개념과 함께 소개하면서 최종적으로 정리하며 이 시리즈를 마무리하도록 하겠습니다.
