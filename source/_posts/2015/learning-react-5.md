---
title: React.js를 이해하다(5)
description: 일본의 개발자 koba04님이 작성한 React.js Advent Calendar를 번역한 글로, React.js를 보다 쉽게 접근하고 이해하기 쉽게 설명합니다. 이 글은 시리즈로 작성됐으며 이 문서는 그 중 다섯번째 편입니다.
permalink: learning-react-5
date : 2015-07-09
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

## Server-side rendering

이번에는 Server-Side Rendering을 소개하겠습니다. 이 기능 때문에 React.js를 사용하는 사람이 있을 정도로 React.js의 큰 특징 중 하나입니다. Server-Side Rendering은 말 그대로 서버 측에서 HTML을 생성하여 응답하는 방법을 말합니다. SPA(SinglePageApplication) 같은 자바스크립트에서 DOM을 조작하는 애플리케이션의 경우, 서버에서 만들어주는 HTML에는 빈 태그들만 있고 자바스크립트로 템플릿을 이용해 렌더링하는데 이러한 방법에는 두 가지의 큰 문제점이 있습니다.

 * **초기 로드 시간** : HTML이 반환된 후 자바스크립트를 컴파일하고 템플릿을 이용해 렌더링하므로 서버 측에서 HTML을 만들어 응답하는 것에 비해 처리 시간이 조금 더 걸립니다. 그래서 로딩-바를 보여주는 등의 UI/UX 연구도 함께 필요합니다.
 * **SEO** : 최근에 구글의 크롤러가 자바스크립트를 컴파일할 수 있으므로 괜찮을지 모르겠지만 다른 크롤러에 대응하기 위해서는 PhantomJS를 사용해 서버 측에서 렌더링한 HTML을 응답하는 등의 별도의 기법이 필요합니다.

### React.js와 Server-Side Rendering

React.js는 실제 DOM을 의존하지 않고 컴포넌트의 VirtualDOM을 HTML로 반환하는 메서드를 갖고 있습니다. 이 메서드를 이용해 Node.js 서버에서 React.js의 컴포넌트를 HTML로 만들어 응답할 수 있습니다. 요즘은 Browserify 를 이용해 브라우저 측에서도 CommonJS 스타일을 많이 사용하고 있으므로 도입하는 데 큰 문제가 없을 것으로 보입니다.

한번 간단한 샘플([저장소](https://github.com/koba04/react-server-side-rendering-sample/tree/minimum))을 이용해 한번 시험해 봤습니다.

#### 원칙(renderToString()를 사용할 경우)

Server-Side Rendering 시, 서버 측에서 React.rednerToString()을 사용해 생성한 HTML의 DOM 구조와 브라우저 측에서 React.redner()하여 생성된 컴포넌트의 DOM 구조가 같아야하는데, HTML에 부여되는 data-react-checksum이라는 값을 사용해 두 상태가 같은지 비교합니다. checksum이 다를 경우엔 아래와 같은 경고 메시지가 출력됩니다.

{% prism txt %}
React attempted to use reuse markup in a container but the checksum was invalid. This generally means that you are using server rendering and the markup generated on the server was not what the client was expecting. React injected new markup to compensate which works but you have lost many of the benefits of server rendering. Instead, figure out why the markup being generated is different on the client or server.
{% endprism %}

경고가 출력되면 서버에서 응답한 HTML에 의해 만들어진 DOM은 폐기되고 자바스크립트에 의해 다시 생성됩니다. 참고로 checksum은 HTML을 기준으로 [Adler-32](https://en.wikipedia.org/wiki/Adler-32) 알고리즘을 이용해 생성됩니다.

#### 컴포넌트

컴포넌트 자체는 크게 의식할 필요가 없습니다만 componenetWillMount()는 서버 측에서도 호출되고, componentDidMount()는 브라우저에서만 호출되는 Lifecycle 메서드의 특징은 알아둘 필요가 있습니다.

{% prism jsx %}
var React = require('react');
 
var App = React.createClass({
  getInitialState() {
    return {
      message: 'loading...'
    };
  },
 
  componentDidMount() {
    this.setState({message: 'welcome!'});
  },
 
  render() {
    var list = this.props.data.map(obj => <li key={obj.id}>{obj.id}:{obj.name}</li>);
    return (
      <div>
        <p>server-side rendering sample</p>
        <p>{this.state.message}</p>
        <ul>{list}</ul>
      </div>
    );
  }
});

module.exports = App;
{% endprism %} 

위에서 "loading..." 이라는 메시지를 로드가 끝날 때 "welcome!" 으로 바꾸고 있는데 이 작업은 브라우저에서만 동작합니다.

#### 서버

서버 측에서 주목해야 할 부분은 node-jsx와 renderToString() 입니다. 아래 예제에서는 /bundle.js를 요청할 때 동적으로 browserify 하고 있지만, 실제 서비스 시엔 사전에 browserify한 bundle.js를 준비해 두는 편이 좋습니다.

{% prism js %}
var express     = require('express'),
    app         = express(),
    fs          = require('fs'),
    browserify  = require('browserify'),
    reactify    = require('reactify'),
    Handlebars  = require('handlebars'),
    React       = require('react')
;
 
require('node-jsx').install({harmony: true});
 
var App = require('./components/app');
var data = [
  { id: 1, name: 'backbone' },
  { id: 2, name: 'react' },
  { id: 3, name: 'angular' },
];
 
var template = Handlebars.compile(fs.readFileSync('./index.hbs').toString());
 
app.get('/', function(req, res) {
  res.send(template({
    initialData: JSON.stringify(data),
    markup: React.renderToString(React.createElement(App, {data: data}))
  }));
});
 
app.get('/bundle.js', function(req, res) {
  res.setHeader('content-type', 'application/javascript');
  browserify('./browser')
    .transform({ harmony: true }, reactify)
    .bundle()
    .pipe(res)
  ;
});
 
var port = process.env.PORT || 5000;
 
console.log('listening...' + port);
app.listen(port);
{% endprism %}

##### node-jsx

먼저 JSX로 작성한 컴포넌트 파일도 require 할 수 있도록 `require('node-jsx').install({harmony: true})`를 선언하고 있습니다(harmony option도 유효).

##### renderToString()

React.renderToString()에는 React.createElement()를 이용해 작성한 컴포넌트를 전달합니다. 초기 설정 시 사용하는 데이터가 있다면 이것도 컴포넌트에 Prop으로 전달합니다. 또 전달한 데이터는 클라이언트 측에도 공유해야 하므로 템플릿으로 전달하기 위해 별도의 JSON.stringify 하여 initialData 로써 설정합니다.

##### 템플릿

여기에서 포인트는 `{% raw %}{{{}}}{% endraw %}`(이스케이프 하지 않는다) 에 renderToString()으로 HTML 문자열을 바인드하고, script 태그의 속성값으로 initialData를 바인드한 것입니다. 초기 데이터는 `<script id="initial-data">{% raw %}{{{data}}}{% endraw %}</script>`로도 바인드해 사용할 수 있지만, data를 사용자가 조작 가능할 경우 XSS이 가능하므로 주의가 필요합니다 ([참고](http://qiita.com/koba04/items/e9de79b517662f3d9922)(일본어))

{% prism html %}
<html>
<head>
  <title>React.js server-side rendering sample</title>
</head>
<body>
  <div id="app">&#123;&#123;{markup}}}</div>
  <script id="initial-data" type="text/plain" data-json="{{initialData}}"></script>
  <script src="/bundle.js"></script>
</body>
{% endprism %}

#### 브라우저

브라우저 측의 엔트리 포인트에서는 initialData의 값을 취득하고 그 값을 사용해 컴포넌트를 작성합니다.

{% prism jsx %}
var React = require('react'),
    App   = require('./components/app')
;

var data = JSON.parse(document.getElementById('initial-data').getAttribute('data-json'));
React.render(<App data={data} />, document.getElementById('app'));
{% endprism %}

##### 생성되는 소스

생성된 소스는 아래와 같은 느낌으로 root의 요소엔 data-react-checksum이, 각각 요소엔 data-reactid가 지정됩니다.

{% prism html %}
<body>
  <div id="app"><div data-reactid=".25wfuv5brb4" data-react-checksum="-1037109598"><p data-reactid=".25wfuv5brb4.0">server-side rendering sample</p><p data-reactid=".25wfuv5brb4.1">loading...</p><ul data-reactid=".25wfuv5brb4.2"><li data-reactid=".25wfuv5brb4.2.$1"><span data-reactid=".25wfuv5brb4.2.$1.0">1</span><span data-reactid=".25wfuv5brb4.2.$1.1">:</span><span data-reactid=".25wfuv5brb4.2.$1.2">backbone</span></li><li data-reactid=".25wfuv5brb4.2.$2"><span data-reactid=".25wfuv5brb4.2.$2.0">2</span><span data-reactid=".25wfuv5brb4.2.$2.1">:</span><span data-reactid=".25wfuv5brb4.2.$2.2">react</span></li><li data-reactid=".25wfuv5brb4.2.$3"><span data-reactid=".25wfuv5brb4.2.$3.0">3</span><span data-reactid=".25wfuv5brb4.2.$3.1">:</span><span data-reactid=".25wfuv5brb4.2.$3.2">angular</span></li></ul></div></div>
  <script id="initial-data" type="text/plain" data-json="[{\'id\':1,\'name\':\'backbone\'},{\'id\':2,\'name\':\'react\'},{\'id\':3,\'name\':\'angular\'}]"></script>
  <script src="/bundle.js"></script>
</body>
{% endprism %}

이 상태에서 브라우저 측에서 React.render()를 사용해 컴포넌트를 붙이면 checksum을 확인하여 문제가 없으면 DOM은 그대로 두고 이벤트 리스너만 등록합니다. 이러한 원리로 Server-Side Rendering 할 때는 HTML이 서버에서 반환되고 자바스크립트가 컴파일되어 이벤트 리스너가 등록되기 전까지 이벤트에 반응하지 않으므로 주의가 필요합니다.

##### renderToString()과 renderToStaticMarkup()

이 두 메서드는 필요에 따라 구별해 사용합니다. renderToStaticMarkup()은 data-reactid를 부여하지 않고 순수 HTML을 반환합니다. 즉, 정적 페이지로 출력해도 문제 없으면 사용합니다. 이때 renderToString()과 마찬가지로 renderToStaticMarkup()으로 HTML을 반환하고 브라우저 측에서도 컴포넌트를 실행할 수 있지만, 그 경우 renderToStaticMakrup()이 만든 HTML은 재사용되지 않고 브라우저 측에서 다시 HTML을 만들게 됩니다.

renderToStaticMarkup()에서 출력되는 HTML은 다음과 같습니다.

{% prism html %}
<body>
  <div id="app"><div><p>server-side rendering sample</p><p>loading...</p><ul><li>1:backbone</li><li>2:react</li><li>3:angular</li></ul></div></div>
  <script id="initial-data" type="text/plain" data-json="[{\'id\':1,\'name\':\'backbone\'},{\'id\':2,\'name\':\'react\'},{\'id\':3,\'name\':\'angular\'}]"></script>
  <script src="/bundle.js"></script>
</body>
{% endprism %}

#### Flux를 사용할 때 주의할 점

Flux을 사용할 때, 컴포넌트가 싱글-톤의 Store를 가지고 있는 애플리케이션을 그대로 서버 측에서 사용하면 사용자마다 같은 Store가 공유돼 버리므로 주의가 필요합니다. 이 문제를 해결하기 위해 요청마다 Store를 만들 필요가 있습니다.

##### 라우팅

라우팅하고 싶은 경우엔 어떻게 할지 고민될 것 같습니다. 이는 다음에 라우팅을 소개할 때 함께 이야기하겠습니다.

##### express-react-views

이 [라이브러리](https://github.com/reactjs/express-react-views)는 본 문서에서도 소개하고 있는 renderToStaticMarkup()을 사용하고 있으므로 주의가 필요합니다.

##### Node.js 이외의 서버에서 사용

* [react-rails](https://github.com/reactjs/react-rails) : rails와 조합하고 싶을 때 사용할 수 있습니다. ExecJS를 컴포넌트로 처리하고 있는 것 같습니다.
* [React.NET](https://github.com/reactjs/React.NET)
* [react-python](https://github.com/reactjs/react-python)
* [react-php-v8js](https://github.com/reactjs/react-php-v8js)

여기까지 React.js의 Server-Side Rendering의 구조를 간단하게 소개했습니다. 다음 절에서는 React.js의 라우팅을 소개하겠습니다.

### Server-Side Rendering에 대응한 Routing

Server-Side Rendering을 이어서 이번에는 Routing을 이야기하겠습니다. React.js는 컴포넌트를 만드는 라이브러리이므로 Router는 당연히 구현돼 있지 않습니다. 그래서 Backbone.Router나 Driector 등 좋아하는 Router 라이브러리를 조합해 사용합니다. 하지만 Page 단위로 컴포넌트를 만들어 갱신하는 경우엔 작성하기 거추장스럽고 장황하게 될 가능성이 있습니다. 그래서 여기에서는 [react-router](https://github.com/rackt/react-router)라는 것을 소개할까 합니다.

#### React Router

React Router는 이전까지 Server-Side Rendering을 지원하지 않았기 때문에 [react-router-component](https://github.com/STRML/react-router-component)를 사용했지만, 현재는 지원하므로 Server-Side Rendering이 필요한 경우에도 사용할 수 있습니다. React Router Component가 조금 더 단순하게 디자인돼 있으므로 조금 더 접근하기 편한 라이브러리를 찾는다면 분은 이 라이브러리를 참고해주세요. React Router는 기존 Component와 마찬가지로 Routing을 컴포넌트로 정의하는 형태가 됩니다. React Router는 중첩한 라우팅, 링크에 active class, Scroll Top 등 다양한 라우팅 기능을 지원합니다. README에 작성된 내용을 기준으로 사용 방법을 간단히 소개합니다.

##### 정의

라우트를 정의할떄는 Route 컴포넌트를 사용하여 선언하고 라우팅 정의를 작성한 후 Router.run으로 시작합니다.

{% prism jsx %}
var routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={Home} />
    <Route name="about" handler={About} />
    <Route name="users" handler={Users}>
      <Route name="recent-users" path="recent" handler={RecentUsers} />
      <Route name="user" path="/user/:userId" handler={User} />
      <NotFoundRoute handler={UserRouteNotFound}/>
    </Route>
    <NotFoundRoute handler={NotFound}/>
    <Redirect from="company" to="about" />
  </Route>
);
 
Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
{% endprism %}

##### Link

앵커(Anchor)는 Link 컴포넌트를 이용합니다.

{% prism jsx %}
<Link to="users">Users</Link>
{% endprism %}

##### Handler

위 예의 경우 App의 Handler의 안에 각각의 Route가 정의 되어 있으므로 App 컴포넌트 안에 RouteHandler 컴포넌트를 정의해야합니다. <RouteHandler/> 이 부분이 Routing을 응답하는 Handler로 대체됩니다.

{% prism jsx %}
var App = React.createClass({
  render() {
    return (
      <div>
        <h1>title</h1>
        <RouteHandler/>
      </div>
    );
  };
});
{% endprism %}

##### History API

HTML5의 History API를 사용하고 싶다면 아래와 같이 두번째 인수에 Router.HistoryLocation을 지정하고 Router.run을 실행합니다.

{% prism jsx %}
Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.body);
});
{% endprism %}

##### Server-Side Rendering

Server-Side rendering 시에는 서버 측에서 아래와 같이 두번째 인수에 path를 전달하고 Router.run 합니다.

{% prism jsx %}
//express
app.use(function (req, res) {
     // pass in `req.path` and the router will immediately match
     Router.run(routes, req.path, function (Handler) {
         var markup = React.renderToString(<Handler/>);
         res.render('index', {markup: markup});
     });
});
{% endprism %}

#### 예제 코드

그럼, 예제 코드를 한번 살펴보겠습니다. 이 예제 코드는 다음 글에서도 사용합니다. Vimeo와 YouTube의 비디오 리스트를 라우팅으로 전환할 수 있도록 작성했습니다. 초기의 데이터를 서버와 브라우저에서 공유하도록 설계했습니다. 예제에서는 React Router뿐만 아니라 [react-bootstrap](http://react-bootstrap.github.io/)과 [react-video](https://github.com/pedronauck/react-video)를 사용하고 있습니다.

* https://github.com/koba04/react-server-side-rendering-sample
* http://react-ssr-sample.herokuapp.com

`curl http://react-ssr-sample.herokuapp.com/youtube` 나 `curl http://react-ssr-sample.herokuapp.com/vimeo` 으로 요청하면 이에 대응하는 video 정보를 data-react-id와 함께 반환하는 사실을 알 수 있습니다.

##### 서버

코드 일부만 설명하겠습니다. Handler의 Prop에 params으로 초기 데이터를 전달합니다.

{% prism jsx %}
app.use(function(req, res) {
     Router.run(routes, req.path, function(Handler) {
         res.send(template({
             initialData: JSON.stringify(data),
             markup: React.renderToString(React.createElement(Handler, {params: {videos: data}}))
         }));
    });
});
{% endprism %}

이 예에서는 항상 같은 데이터를 반환하게 돼 있지만, req.path에 대응한 데이터를 반환하는 것도 가능합니다.

##### Browser entry point

Server-Side Rendering 때에도 동일하게 작성했습니다. JSON을 받아 Handler의 Props에 params로 전달합니다.

{% prism jsx %}
var initialData = JSON.parse(document.getElementById('initial-data').getAttribute('data-json'));
 
Router.run(routes, Router.HistoryLocation, (Handler) => {
  React.render(<Handler params=&#123;&#123;videos: initialData}} />, document.getElementById('app'));
});
{% endprism %}

##### Routing

아래 코드는 이제 특별한 설명 없이도 이해할 수 있을것입니다.

{% prism jsx %}
module.exports = function() {
  return (
    <Route name="app" path="/" handler={App}>
      <Route name="youtube" handler={YouTube} />
      <Route name="vimeo" handler={Vimeo} />
      <DefaultRoute handler={Top} />
    </Route>
  );
};
{% endprism %}

##### App

아래와 같은 느낌으로 RouteHandler에 spread attributes({...this.props})을 이용해 초기 데이터를 Prop으로 전달합니다.

{% prism jsx %}
var App = React.createClass({
  render() {
    return (
      <div>
        <h1><Link to="app">React server-side rendering sample</Link></h1>
        <ListGroup>
          <Link to="youtube" key="youtube"><ListGroupItem>youtube</ListGroupItem></Link>
          <Link to="vimeo" key="vimeo"><ListGroupItem>vimeo</ListGroupItem></Link>
        </ListGroup>
        <RouteHandler {...this.props} />
      </div>
    );
  }
});
{% endprism %}

##### Handler

그러면 Handler에서 전달한 초기 데이터를 Prop으로 받을 수 있으므로 이를 이용해 화면을 랜더링합니다.

{% prism jsx %}
var YouTube = React.createClass({
  mixins: [VideoMixin],
  render() {
    return (
      <Grid>
        <h2>youtube</h2>
        <Row className=\"show-grid\">{this.renderVideos('youtube')}</Row>
      </Grid>
    );
  }
});
 
// VideoMixin
module.exports = {
  getDefaultProps() {
    return {
      params: {
        videos: {
          youtube: [],
          vimeo: []
        }
      }
    };
  },
  renderVideos(type) {
    return this.props.params.videos[type].map( video => {
      return (
        <Col xs={6} md={4} key={video.id}>
          <Jumbotron>
            <Video from={type} id={video.id} />
            <p>{video.title}</p>
          </Jumbotron>
        </Col>
      );
    });
  }
};
{% endprism %}

##### 초기 데이터를 전부 전달하지 않는 경우

위 예를 조금 바꿔서 `/api/youtube`와 `/api/vimeo`로 각각의 데이터를 반환하는 API를 만들고 `/youtube`에 접근 시 `/api/youtube`가 반환하는 데이터를 초기 데이터로 사용할 때, 각각의 컴포넌트의 componentDidMount()에서 초기 데이터가 있는지 없는지 확인하여 없을 때만 Ajax 요청을 하도록 작성하면 됩니다.(componentDidMount()는 Server-Side에서 실행되지 않습니다) 이것으로 React Router를 사용한 Routing 작성법에 대해 알아봤습니다.


## 공개된 React 컴포넌트를 사용해보자

이번에는 조금 화제를 전환해 웹에 공개된 React 컴포넌트를 사용하는 것에 관해 이야기하겠습니다. 컴포넌트는 기본적으로는 Prop이 I/F가 됩니다. 따라서 문서를 통해서 컴포넌트의 특성을 알 수 없는 경우엔 Prop을 보면 어떤 I/F로 형성돼 있는지 알 수 있습니다. 직접 컴포넌트를 공개하는 경우엔 PropTypes나 getDefaultProps()를 사용해 I/F를 명확하게 작성해야 합니다.

### 부트스트랩

먼저 많이 사용하는 라이브러리인 부트스트랩입니다. React 컴포넌트로 구현한 라이브러리는 react-bootstrap입니다. 이 라이브러리를 사용하고자 할 땐 별도로 부트스트랩 CSS를 로드할 필요가 있습니다.

{% prism html %}
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
{% endprism %}

부트스트랩의 각 컴포넌트가 React의 컴포넌트로 구현돼 있으며 다른 React의 컴포넌트와 마찬가지로 사용할 수 있습니다. ([참고](http://react-bootstrap.github.io/))

{% prism jsx %}
var {Jumbotron, Col} = require('react-bootstrap');
 
module.exports = React.createClass({
  render() {
    <Col xs={6} md={4} key={video.id}>
      <Jumbotron>
        <Video from={type} id={video.id} />
       <p>{video.title}</p>
      </Jumbotron>
    </Col>
  }
});
{% endprism %}

react-bootstrap의 [component 페이지](http://react-bootstrap.github.io/components.html)에서 데모와 Prop의 사양 등을 확인할 수 있습니다

### 컴포넌트 찾기

#### React Components

[React Components](http://react-components.com/)는 npm의 키워드로 react-component를 등록한 React의 컴포넌트를 모아놓은 사이트입니다. 여기에서 원하는 컴포넌트를 찾아볼 수 있습니다.

#### React Rocks

[React Rocks](http://react.rocks/)는 여러 가지의 React의 컴포넌트를 사용한 샘플을 소개하고 있는 사이트입니다. 실제로 동작하는 데모(참고)를 볼 수 있습니다.

#### 깃-허브의 위키

리액트의 깃허브 저장소에 작성된 [공식 위키](https://github.com/facebook/react/wiki/Complementary-Tools#ui-components)에도 여러가지 UI 컴포넌트를 소개하고 있으니 참고할 수 있습니다.

### 실전, 컴포넌트를 찾아서 사용해보자.

이번 절에서는 [react-video](https://github.com/pedronauck/react-video)라고 하는 유투브와 비메오(vimeo) 플레이어를 출력하는 컴포넌트를 실제로 사용해보고자 합니다. 이를 사용해 구현한 샘플을 공개해놨습니다.

#### 사용 방법

type(from)과 id를 속성을 지정하는 방식으로 간단하게 사용할 수 있습니다.

{% prism jsx %}
var Video = require('react-video');
 
type = 'youtube' // or 'vimeo'
<Video from={type} id={video.id} />
{% endprism %}

#### CSS

컴포넌트를 사용하기 위해서는 아래 CSS를 로드해야 합니다. require하는 것만으로 CSS도 함께 작업해줬으면 하지만 아쉬운 점입니다.

* https://github.com/pedronauck/react-video/blob/master/dist/react-video.css

#### I/F 확인

react-video의 [README.md](https://github.com/echonest/pyechonest/blob/master/README.md)를 보면 알 수 있지만, I/F를 어떻게 디자인했는지 알아보겠습니다. propTypes과 getDefaultProps을 살펴보면 다음과 같은 사항을 알 수 있습니다.

* from에는 youtube나 vimeo를 지정하며 필수 인자다.
* id는 문자열이며 필수 인자다.
* className도 지정할 수 있으며 기본값은 video다.

propTypes를 잘 명시하면 이해하는데 용이합니다.([참고](https://github.com/pedronauck/react-video/blob/master/lib/react-video.jsx#L9-L17))

{% prism js %}
propTypes:{
  from: React.PropTypes.oneOf(['youtube', 'vimeo']).isRequired,
  id: React.PropTypes.string.isRequired
},
getDefaultProps() {
  return {
    className: 'video'
  };
},
{% endprism %}

이번 편에서는 React.js의 Server-Side rendering과 Routing 그리고 공개된 React.js의 컴포넌트를 사용하는 방법을 소개했습니다. Server-Side rendering은 최근 Ember([참고](http://emberjs.com/blog/2015/06/12/ember-1-13-0-released.html#toc_component-lifecycle-hooks))와 Angular2([참고](https://www.youtube.com/watch?v=0wvZ7gakqV4))에서도 지원할 정도로 인기있는 기능입니다. 다음 편에서는 React.js를 테스트하는 방법과 Flux 아키텍처를 소개하겠습니다.
