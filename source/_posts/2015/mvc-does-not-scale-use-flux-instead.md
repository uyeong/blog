---
title: "페이스북의 결정: MVC는 확장에 용이하지 않다. 그렇다면 Flux다."
description: "이 문서는 InfoQ의 「Facebook: MVC Does Not Scale, Use Flux Instead」를 번역한 글이며, 페이스북이 Flux 아키텍처를 디자인한 이유와 그것이 무엇인지 설명하고 있습니다."
date : 2015-06-19
category:
    - JavaScript
    - Architecture
tags:
    - JavaScript
    - Architecture
    - React
    - Flux
    - MVC
---

{% alert info '읽기전에...' '
이 문서는 InfoQ의 「Facebook: MVC Does Not Scale, Use Flux Instead([일본어](<a href="http://www.infoq.com/jp/news/2014/05/facebook-mvc-flux), [영어](http://www.infoq.com/news/2014/05/facebook-mvc-flux))」를 번역한 글입니다. 주로 일본어 문서를 번역했으며 영어 문서는 참고 자료로써 사용했습니다.
' %}

이 문서는 개발자 커뮤니티와 [Jing Chen](https://www.linkedin.com/pub/jing-chen/5/425/353)(페이스북)의 반응을 바탕으로 업데이트하고 있다.(아래 Update 절 참고)

페이스북은, MVC 패턴으로는 자신들이 원하는 명세를 수용할 수 없다고 결론을 내리고 대신 또 다른 패턴인 Flux 사용을 결정했다.

지난 F8의 「[Hacker Way: Rethinking Web App Development at Facebook](https://www.youtube.com/watch?v=nYkdrAPrdcw)」 세션에서 페이스북의 기술 매니저인 [Tom Occhino](https://about.me/tomocchino)는 일정 수준 이상의(sufficiently) 코드 베이스와 대규모 개발 조직에 관해 설명하고 거듭 「MVC는 정말 눈 깜짝할 사이에 복잡해진다」 라고 말하며 MVC는 큰 시스템에 어울리지 않는다고 결론지었다. 어떤 새로운 기능을 추가하려고 할 때마다 시스템의 복잡도는 기하급수적(지수, exponential)으로 증가하며 「깨지기 쉽고 예측 불가능한 코드」가 된다, 이것은 거대한 코드 베이스에 참여한 개발자에게 「이미 존재하는 기능에 문제를 발생시킬까 두려워 코드를 수정하지 못하는 새로운 심각한 문제」를 일으킨다고 이어서 말했다. 그 결과 페이스북은 MVC와 결별하게 된 것이다.

이 문제를 해결하기 위해서는 「좀 더 예측 가능한 형태로 코드를 구조화하는 것」이 필요하며 이것은 Flux와 React를 이용해서 달성할 수 있다고 한다. Flux는 애플리케이션 내의 데이터 흐름을 단방향(single directional data flow)으로 흐를 수 있도록 도와주는 시스템 아키텍처다. React는 예측 가능하며 선언적(또는 서술적)으로 웹 애플리케이션을 구축하기 위한 자바스크립트 프레임워크이며 페이스북의 웹 애플리케이션 개발을 더욱 빠르게 할 수 있도록 한다고  Tom Occhino는 말했다.

Jing Chen씨는 이어서 MVC는 소규모 애플리케이션에는 적합하지만 아래 이미지처럼 Model이나 Model과 관련한 View가 대량으로 시스템에 추가되면 복잡도가 폭발적으로 증가한다고 말했다.

{% figure flux_architecture.01.png 'MVC의 데이터 흐름' '그림 1. MVC의 데이터 흐름' %}

이러한 애플리케이션은 Model과 View 사이의 데이터를 양방향(bidirectional data flow)으로 흐르게 할 가능성이 있고, 따라서 이해하고 디버깅하기 어렵다고 말하면서 대신 아래 Flux와 같은 설계를 제안했다.

{% figure flux_architecture.02.png 'Flux의 데이터 흐름' '그림 2. Flux의 데이터 흐름' %}

그림 2의 Store는 애플리케이션의 모든 데이터를 포함한다. Dispatcher는 MVC의 Controller를 대체하며 어떠한 Action이 발생(trigger)했을 때 어떻게 Store를 갱신할지를 결정한다. Store가 변경될 때에는 View도 동시에 갱신된다. 또, 선택적으로 Dispatcher가 처리할 Action을 발생시킬 수도 있다. 이처럼 시스템의 컴포넌트 간 데이터 흐름은 단방향으로 유지됨을 알 수 있다. 데이터는 단방향으로만 흐르고 각각의 Store와 View는 서로 직접적인 영향을 주지 않기 때문에 여러 개의 Store나 View를 갖는 시스템도, 하나의 Store나 View 갖는 시스템과 같다고 볼 수 있다.

페이스북 깃-허브의 [Flux Overview 페이지](https://facebook.github.io/flux/docs/overview.html)에 Flux나 Dispatcher 그리고 Store에 관해 자세히 작성돼 있다.

{% alert info 'Dispatcher와 Store' '
Dispatcher는 Flux 아키텍처의 모든 데이터 흐름을 관리하는 중앙 허브다. 이는 본질적으로 Store 내에서 콜백을 등록할 때 사용하는 장소다. 각 Store는 Dispatcher에 등록할 콜백을 제공한다. 이 Dispatcher가 발생시킨 Action에 응답할 때 애플리케이션 내의 모든 Store는 Dispatcher에 등록한 콜백을 통해 Action에 의해 생긴 데이터를 송신한다.<br/><br/>등록된 콜백을 정해진 순서로 실행하여 Store 간의 의존 관계를 관리할 수 있으므로 애플리케이션이 커질수록 더욱 없어선 안 될 존재가 된다. 선언에 따라 Store는 다른 Store의 갱신이 완료될 때까지 기다린 다음 자기 자신을 갱신할 수 있다.<br/><br/>Store는 애플리케이션의 상태나 논리를 포함한다. Store의 역할은 전통적인 MVC의 Model 역할과 조금 비슷하다. 하지만 다수의 객체의 상태를 관리하는 MVC와 달리 단일 객체 인스턴스(싱글-톤)로 관리한다. 또, Backbone 프레임워크의 컬렉션과도 같지 않다. ORM 형식의 객체를 집합으로 관리하기보다 조금 더 단순하게 애플리케이션 내의 한 특정 도메인에 관한 애플리케이션의 상태를 관리한다.
' %}

중요한 것은 데이터 계층에서 다른 Action이 발생하기 전에 자신과 관계를 맺고 있는 View의 갱신을 끝내는 것이라고 Jing Chen씨는 말했다. Dispatcher는 이전 Action의 처리를 완료하지 않은 상태라면 다음 Action의 처리를 거부할 수 있다. 이 설계 방식은 다른 View도 함께 갱신할 때 발생할 수 있는 부작용을 가지고 있는 Action에 대응할 때 유용하며 코드를 좀 더 명확하게 이해할 수 있고 새로운 개발자도 디버깅을 간단하게 할 수 있도록 한다고 했다. Flux는 페이스북 채팅의 버그(가짜 신규 메시지 통지를 발생시키는 버그)를 수정하는 역할로 사용됐다.

[Flux TodoMVC 튜토리얼](https://facebook.github.io/flux/docs/todo-list.html)과 [소스 코드](https://github.com/facebook/flux/tree/master/examples/flux-todomvc/)는 깃-허브에 공개돼 있다.

물론 페이스북이 그들이 옳다고 생각하는 설계 방식을 따르는 것은 그들의 자유지만, 여전히 의문은 남아있다. 과연 정말 MVC는 확장에 용이하지 않을까? 이미 주변의 많은 웹사이트는 성장하고 확장되고 있다.

**Update**. 이 기사를 공개한 뒤, MVC에 관한 페이스북의 결정에 관해 많은 개발자가 Reddit을 통해 의견을 보냈다. 여기에서 댓글 몇 개를 소개하겠다. 애초에 페이스북이 MVC를 오용했다고 생각하는 사람도 있지만, 페이스북이 올바른 결정을 했다고 생각하는 사람도 있다.

> **[giveupitscrazy](http://www.reddit.com/r/programming/comments/25nrb5/facebook_mvc_does_not_scale_use_flux_instead/chj2fzc) :**
> 
> 이건 전혀 의미가 없다. 먼저 그들의 MVC 구성에는 두드러지는 결함이 있다. 그들은 컨트롤러가 상호 작용하고 있는 Model에 따라서 혹은 논리적인 이유로 누구나 분할이 필요하다고 느껴지는 때조차 여러 Model을 조작하는데 단 한 개의 컨트롤러를 사용하고 있다. 물론 그들이 묘사하고 있는 MVC는 동작하지 않겠지만 그래도 그것은 진짜 MVC가 아니다. 만약 그들의 Flux의 다이어그램과 [실제 MVC](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/MVC-Process.svg/500px-MVC-Process.svg.png)의 다이어그램을 비교한다면 웹 애플리케이션에 있어 MVC가 본질적으로 문제 될 것이 없다는 것을 분명히 알 수 있다.
>
> **[balefrost](http://www.reddit.com/r/programming/comments/25nrb5/facebook_mvc_does_not_scale_use_flux_instead/chj9zmj) :**
> 
> 그렇다. 그들의 Flux 다이어그램은 모두가 알고 있는 MVC의 다이어그램과 매우 닮아있다. 그들은 실용적인 MVC를 재발명(re-invented)했을 것이다. 그리고 그것에 새로운 이름을 붙이기로 결정한 것이다. 아하!
>
> **[hackinthebochs](http://www.reddit.com/r/programming/comments/25nrb5/facebook_mvc_does_not_scale_use_flux_instead/chj3kmy) :**
>
> 이 아키텍처는 이벤트 주도 방식으로 기존 MVC를 조금 변경한 것이다. 「Store」는 자기 자신(그리고 아마도 호출 순서의 의존성)을 Dispatcher에 등록하고 그 Dispatcher는 Action을 처리하여 올바른 호출 순서가 달성되도록 보증한다. 이것은 올바른 호출 순서를 보증해야 하는 부담을 컨트롤러에서 Dispatcher와 Store로 분리한 것이다. 이것은 동작을 수정하는 데 필요한 지식을 줄여준다.
>
> **[runvnc](http://www.reddit.com/r/programming/comments/25nrb5/facebook_mvc_does_not_scale_use_flux_instead/chj4f09) :**
>
> 이 아키텍처를 아주 깊게 이해했다고 아직 말할 수는 없지만, 어느 정도는 이해했다고 생각하고 있고 전반적인 아이디어에 찬성한다.

Reddit 유저 [jingc09](http://www.reddit.com/user/jingc09)는 댓글 내용을 보아하니 Jing Chen으로 보인다. 아래에 몇 가지 답변하고 있다.

> **[jingc09](http://www.reddit.com/r/programming/comments/25nrb5/facebook_mvc_does_not_scale_use_flux_instead/chjbo05) :**
> 
> 확실히 저것(그림 1)은 까다로운 슬라이드였다(하나의 컨트롤러가 다수의 Model이나 View와 결합하고 있고, 데이터는 양방향으로 흐르고 있다). 이 논쟁의 원인의 일부는 MVC가 엄밀히 무엇인지에 대해 충분히 일치된 의견 없이 많은 사람이 각각의 의견을 가지고 있기 때문이다. 본래 우리가 논해야 할 주제는 양방향 데이터 흐름에 대해서다. 그것은 한쪽의 데이터 변경이 또 다른 쪽에 영향을 줄 수 있고(loop back), 한편 연쇄적인 효과도 가지고 있다.

그녀의 말을 명확하게 이해하기 위해서 「[Flux의 Dispatcher는 MVC 컨트롤러가 아니다](http://www.reddit.com/r/programming/comments/25nrb5/facebook_mvc_does_not_scale_use_flux_instead/chjbo05)」라는 글을 보는게 좋다.

> 한가지 내가 밝히고 싶은 것은 Dispatcher가 Controller와 같은 역할을 담당하는 것은 아니라는 것이다. Dispatcher는 비즈니스 로직을 가지고 있지 않고 우리는 Dispatcher 코드를 복수의 애플리케이션에서 재사용하고 있다. 그것은 단지 이벤트에 대응하는 구독자(대개 Store)를 등록하기 위한 중앙 허브에 불과하다. 그러나 단방향 데이터 흐름을 가능케 하는 장소이기 때문에 Flux 아키텍쳐에 있어서 중요한 요소다.

[Wikipedia의 MVC 컨트롤러에 관한 설명 글](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)에는 다음과 같이 작성돼 있다.

> 컨트롤러는 Model의 상태를 갱신하기 위해(예를 들어 문서 편집 등) 명령을 할 수 있다. 또 그것은 Model에 관계한 View의 출력을 변경하기 위해(여를 들어 문서의 스크롤) View에게도 명령을 할 수 있다.</p>

[Jing Chen은 말했다.](http://www.reddit.com/r/programming/comments/25nrb5/facebook_mvc_does_not_scale_use_flux_instead/chjcifl)

> Dispatcher에서는 이러한 작업을 할 수 없다. 그 명령은 다른 어딘가(View나 서버의 응답, 라이브 갱신 등)에서 출발하여 Dispatcher에 전송해야 한다. Todomvc-flux의 Dispatcher.js(아마 그 코드는 [Actions](https://github.com/facebook/flux/blob/master/examples/flux-todomvc/js/actions/TodoActions.js)로 옮겨진 것 같다)를 보면 이러한 사실을 이해할 수 있을 것이다.

Reddit의 댓글을 살펴보면 MVC가 어떤 것이며 어떤 방법으로 구현 해야 하는지 대해 잠시 혼란이 있어 보인다.

Facebook의 MVC에 관한 결정에 관해 우리는 아래와 같은 두 가지 관점을 가지고 있다.

1) 첫 번째 슬라이드의 다이어그램은 너무 많은 Model과 View가 관계를 맺는 억지스러운 예이기 때문에 독자에게 이런 경우가 실존하는 것인지 의문점을 안긴다. 페이스북이 Flux로 해결한 문제는 고작 3개의 View를 가진 채팅 애플리케이션이었다.

2) 그들의 MVC 예에서는 왜 View가 데이터 흐름을 생성해 양방향 데이터 흐름을 만들어 낼까? 또 왜 이 Flux의 다이어그램에서는 View가 Action을 발생시키는 것일까? View는 그냥 View 일뿐이므로 View는 아무것도 발생시키지 않아야 할 것이다. 페이스북은 MVC를 오용하고 있는 것은 아닐까?
