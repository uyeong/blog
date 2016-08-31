---
title: io.js란 무엇인가?
description: 2014년 12월 경 Node Forward가 Node.js를 fork하고 자신들의 운영 규칙을 작성하기 시작했고, io.js라는 프로젝트를 시작했습니다. 이 문서에서는 io.js가 무엇인지 그리고 왜 새로운 프로젝트를 시작할 수 밖에 없었는지 살펴봅니다.
date : 2014-12-05
category: io.js
tags:
    - Node.js
    - io.js
---

## Node Forward란?

io.js를 설명하기 위해 Node Forward 부터 소개하겠습니다. [Node Forward](http://nodeforward.org/)는 Node.js 전문 Technical Committee(기술위원회)입니다. 공식 사이트에 설명된 글을 간추리면 다음과 같습니다.

Node Forward는 개방적인 협력을 통해 Node.js와 자바스크립트 등의 생태계를 개선하기 위한 커뮤니티입니다. 컨트리뷰터는 소규모 프로젝트에 분산되어 리더쉽과 자율성을 보장받고 있었습니다. 이 컨트리뷰터가 분산된 문제와 자율성 문제를 해결한 협업을 위한 장소라고 볼 수 있습니다. 현재 아래와 같이 활동하고 있습니다.

*   **[welcome](https://github.com/node-forward/welcome)** : Node.js와 자바스크립트를 배우기 위한 좋은 시작점을 만드는 것을 목적으로 하고 있습니다.
*   **[help](https://github.com/node-forward/help)** : 자바스크립트와 Node.js에 관한 Q&amp;A를 할 수 있는 장소입니다.
*   **[build](https://github.com/node-forward/build)** : 애플리케이션이나 테스트 도구, 인프라를 만들기 위한 장소입니다.
*   **[roadmap](https://github.com/node-forward/roadmap)** : Node.js 개발 및 커뮤니티에 필요한 표준화를 알리고 Node.js와 자바스크립트의 진로 등, 더 큰 커뮤니티로부터 피드백을 얻을 방법을 찾고 있습니다.

모든 논의, 새로운 활동을 포함한 제안은 [discussions](https://github.com/node-forward/discussions/)에서 진행하고 있습니다. Node Forward의 주역은 누구일까? 바로 우리라고 합니다. 누군가와 함께 활동할 의지가 있고, 행동 규범을 따른다면 언제든지 환영한다고 하네요. 만약 저장소를 중재(moderate)하여 스탭-업하는 것에 관심이 있다면 부담 없이 기존 issue에 의견을 작성하거나&nbsp;새로운 issue를 추가하시길 바랍니다.

## Node Forward의 반란?

최근 Node Forward가 Node.js를 fork하고 자신들의 운영 규칙을 작성하기 시작했습니다. 그 프로젝트에는 다음과 같은 구성원이 [적극적인 컨트리뷰터](https://github.com/iojs/io.js/blob/master/CONTRIBUTING.md#governance)로 등록돼 있습니다.

*   [Fedor Indutny](https://twitter.com/indutny)
*   [Trevor Norris ](https://twitter.com/trevnorris)
*   [Ben Noordhuis ](https://github.com/bnoordhuis)
*   [Isaac Z. Schlueter](https://twitter.com/izs)
*   [Nathan Rajlich](https://twitter.com/tootallnate)
*   [Bert Belder](https://twitter.com/piscisaureus)

지금까지 Node.js를 만들어온 핵심 구성원들입니다. 하지만 현 리더인 [TJ Fontaine](https://twitter.com/tjfontaine)가 등록돼 있지 않습니다. Node Forward가 invitation을 보냈지만 TJ Fontaine가 받아들이지 않았다고 합니다. 하지만 승낙 여부와 관계없이 참여시킨 상태라고 합니다. 

어떤 연유에 핵심 구성원들이 [Joyent](https://www.joyent.com/) 팀과 별도로 독자적인 구조를 만드는 걸까요. 진척 없는 Node.js 0.12의 불만일까요? 아니면 폐쇄적인 정책 때문에 일까요? 조금 더 자세한 이유를 알아보고자 Mikeal Rogers에게 메일을 보내니 본인의 인터뷰 내용이 정리된 [Q&amp;A: Why io.js decided to fork Node.js](http://www.infoworld.com/article/2855057/application-development/why-iojs-decided-to-fork-nodejs.html)을 참고하라는 답변이 왔습니다.

인터뷰에서 그는 프로젝트가 조금 더 개방적이고 완벽한 오픈소스로써 운영되길 바란다고 답하고 있습니다. [Unhappy Node.js users fork the Joyent-run project, creating community-driven io.js](http://blogs.dailynews.com/click/2014/12/03/unhappy-node-js-users-fork-joyent-run-project-creating-community-driven-io-js/)를 보면 Joyent가 사실상 방향을 정하고 있어 사용자나 다른 개발자들을 제대로 끌어안지 못했다는 사실을 알 수 있습니다.

인터뷰에는 조금 더 재미있고, 여러 의미를 추론할 수 있는 내용이 있지만 전문을 소개하긴 힘들고 개인적으로 마음에 든 답변 하나만 인용하고 마무리하겠습니다. 이와 관련된 더 자세한 내용은 아웃사이더님의 글 "[io.js가 나오기까지...](http://blog.outsider.ne.kr/1102)"을 참고하시길 바랍니다.

> **I don't see any reason that people who want to get to work solving problems should just wait around(나는 문제를 해결하고 싶어하는 사람들이 마냥 기다리기만 해야한다는 걸 이해할 수 없다).**
> 
> -- Mikeal Rogers

## io.js

[io.js](http://iojs.org/)는 그들이 fork 하여 내놓을 반란의 산물(?), Node.js와 npm을 호환하는 자바스크립트 플랫폼입니다.

[Initial Release #28](https://github.com/iojs/io.js/issues/28)에 따르면 2015년 1월 13일에 출시할 예정이며 1.0 안정화 버전을 릴리즈 할 때까지 알파 버전을 지속해서 출시할 계획이라고 합니다. V8 릴리즈에 신속하게 대응한다고 하니 기대가 되는 부분이네요.

## 끝으로

Joyent는 결국 핵심 컨트리뷰트를 끌어안는 데 실패했습니다. Node.js는 이미 Express, Socket.io, Meteor, node-webkit 등 다양한 시스템과 생태계를 조성하고 있습니다. io.js는 Node.js와 npm을 호환하는 것을 목적으로 하고 있기는 하지만, [node-webkit의 io.js 이주 문제](https://github.com/rogerwang/node-webkit/issues/2742)도 거론되는 것을 보면 기존 시스템과 생태계에 어떤 영향을 줄지는 아무도 모를 일입니다. 

이와 비슷한 사례는 이미 있었습니다. 바로 MariaDB 입니다. MySQL를 인수한 [썬마이크로시스템즈](http://ko.wikipedia.org/wiki/%EC%8D%AC_%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%A6%88)가 [오라클](http://ko.wikipedia.org/wiki/%EC%98%A4%EB%9D%BC%ED%81%B4_%28%EA%B8%B0%EC%97%85%29)에 인수되고 얼마 지나지 않아&nbsp;MySQL의 핵심 개발자였던 [Michael Widenius](https://twitter.com/montywi)는 다음과 같이 이야기했습니다.

> 아마도 InnoDB [스토리지 엔진](http://ko.wikipedia.org/wiki/%EC%8A%A4%ED%86%A0%EB%A6%AC%EC%A7%80_%EC%97%94%EC%A7%84 "스토리지 엔진")을 제외한 MySQL에 있는 기능 대부분은 썬마이크로시스템즈 때 있었던 기능들입니다. 오라클 인수 후 MySQL은 발전하지 않았습니다. 오라클은 ‘MySQL을 어떻게 하면 자신들의 소유로 할 수 있을까’만 고민했고, 그래서 회사를 나왔습니다.
> 
> -- Michael Widnius, [위키 역사 절](http://ko.wikipedia.org/wiki/MariaDB#.EC.97.AD.EC.82.AC) 참고

MariaDB는 여전히 MySQL의 인터페이스와 구조가 같고 이미 출시된 MySQL 관련 도구와 호환성을 보장합니다. 거기에 성능도 더욱 좋습니다. Node Forward가 어떤 정책을 가져갈지 그리고 그것을 유지할지 모르지만 생태계에 교란을 일으키지만 않는다면 그들의 반란은 성공적인 마침표를 찍을 수 있을 것입니다.
