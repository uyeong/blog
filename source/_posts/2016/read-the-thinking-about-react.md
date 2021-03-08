---
title: React에 대한 여러가지 생각을 읽고
description: Youngrok Pak님의 「React에 대한 여러 가지 생각」을 읽고 해당 글에 대한 개인적인 의견과 React에 관해 평소에 이야기하고 싶었던 내용을 함께 이야기합니다.
date : 2016-04-26
category:
    - JavaScript
    - React
tags:
    - JavaScript
    - React
---

「[React에 대한 여러 가지 생각](http://youngrok.com/React%EC%97%90%20%EB%8C%80%ED%95%9C%20%EC%97%AC%EB%9F%AC%20%EA%B0%80%EC%A7%80%20%EC%83%9D%EA%B0%81#_=_)」이라는 글에 직접 코멘트를 달까 생각했지만, 쓰다 보니 글이 길어져서 포스팅한다. 해당 글과는 다른 개인적인 의견에 평소 이야기하고 싶었던 내용을 약간 첨부해 글을 작성했다.

개인적으로 느꼈던 리액트의 가장 큰 장점은 사고의 단순함을 끌어내는데 있다고 생각한다(물론 애플리케이션의 성격이나 상황에 따라 다르다). 성능는 부차적인 것으로 앵귤러1 보다 빠른 메커니즘을 제공하지만, 당연 순수 자바스크립트보단 느리다.

보통 자바스크립트 개발 시에는 일일이 변경을 검사해 해당하는 DOM을 가져와서 값을 대입해줘야 하는 번거로움(혹은 고통스러운)이 있다. 그래서 몇십 밀리세컨드는 신경쓰지 않고 처음부터 다시 그리는 방법을 택한 적도 있었지만 그것만으로 만족하긴 찜찜하다.

HTTP의 Stateless 성을 기반으로 개발된 웹 MVC 프레임워크를 사용할 때는 요청이 들어오면 요청에 맞는 HTML을 생성해 응답해주면 끝나는 단순한 구조이기 때문인데 이런 고통스러운 부분이 적었다. 이때의 단순함을 리액트로 개발할 때 느꼈다.

Stateless 하니 왠지 functional이라는 키워드도 떠오르는데 실제로 리액트에서 뷰는 어떤 값에 의해 생성되는 단순한 결과값(스냅샷)에 불과하다. 리액트의 가장 큰 장점은 여기에 있다고 생각한다. 이 부분이 불변, 단방향 데이터 플로우와 좋은 궁합을 보여주는 점이다. 실제로 React의 개발자인 Jordan Walke는 XHP와 함수형에서 영감을 받아 리액트를 개발했다([참고](https://www.quora.com/How-was-the-idea-to-develop-React-conceived-and-how-many-people-worked-on-developing-it-and-implementing-it-at-Facebook)). 위와 같이 단순한 구조는 함수형에서, JSX는 XHP에서 영감을 받은 듯하다.

JSX는 서술적으로 컴포넌트를 표현하는 데 좋은 표기법이라고 생각한다. UI의 구조를 표현하거나 각 컴포넌트를 조합하는 데는 명령형(Imperative)보다 선언형(Declarative)이 더 적합한 경우가 많다.

아래는 jQuery로 뷰 로직을 작성할 때 자주 보이는 형태다.

<iframe width="100%" height="300" src="//jsfiddle.net/uyeong21c/b5L5f3t9/5/embedded/js,css,html,result" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

아래는 JSX로 표현했을 때의 모습이다.

<iframe width="100%" height="300" src="//jsfiddle.net/uyeong21c/h9y8o7ez/5/embedded/js,css,html,result" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

개인적으로 느꼈던 JSX의 단점은 애니메이션 표현에 있다. UI의 구조를 표현하기엔 적합하지만, 애니메이션처럼 뭔가 동적인 효과를 표현하기엔 오히려 장황하고 정확히 어떤 요소에 애니메이션을 적용하는지 한 번에 파악하기 힘들었다.

{% codeblock lang:jsx %}
&lt;Animation fadeOut={true}>
	&lt;Something>
		&lt;Item/>
		&lt;Item/>
	&lt;/Something>
&lt;/Animation>

// or

$('.somthing').fadeOut();
{% endcodeblock %}

JSX의 또 다른 문제는 낯섦이다. 기존 템플릿 방식이 아닌 XML 스러운 표기법을 그대로 자바스크립트 내에 작성한다. 이러한 방식은 처음에 상당히 혼란스럽게 느껴질 수 있다. 여기에서 거부감을 느끼고, 싫어야해야만 하는 또 다른 이유를 찾아 나서는 경우도 있다. 낯섦이라는 거부감을 잠시 잊어야하는데 말 처럼 쉬운 일은 아니다. 이런 거부감은 나 역시 있었고, 눈에 익는데 시간이 걸렸다(원래 새로운 패러다임은 이해하고 받아들이기 힘든 법이다).

해당 글에선 &lt;hr>이나 &lt;input>과 같은 한 줄 요소(Single-line element)도 닫아줘야 하는 이유를 HTML 규칙을 구현하는 데 한계가 있기 때문이라 말했지만, JSX는 XML-Like 한 언어이기 때문에 HTML이라기보단 XHTML에 가깝다. 그렇게 보면 당연한 부분이라고 생각한다.

{% figure about_react.01.png '공식 홈페이지의 JSX 소개 글' '그림 1. 공식 홈페이지의 JSX 소개 글' %}

또한, 여러 문맥에 걸쳐 가상 돔의 속도를 언급한다. 가상 돔의 속도를 [inferno](https://github.com/trueadm/inferno)와 같이 개선하는 방법도 있었는데 흥미로웠다. 랜더링 시 해당 DOM이 정적 요소인지 동적 요소인지 판단해 정적 요소라면 Diff 단계에서 아예 빼버린다. 이처럼 앞으로도 가상 돔의 속도를 개선할 수 있는 여지가 충분히 남아있다고 판단할 수 있다.

네이버의 효과툰 뷰 같이 인터렉션이나 애니메이션이 복잡해 성능을 많이 신경 써야 하는 부분이라면 React의 대체재를 찾기보단 해당 부분만 순수 자바스크립트로 구현하고 [react-hightchart](https://github.com/kirjs/react-highcharts) 처럼 리액트가 읽을 수 있도록 어댑터만 제공하는 게 낫다.

{% figure about_react.02.png 'React Adapter' '그림 2. React Adapter 다이어그램' %}

하나의 라이브러리만으로 서비스 개발 전체를 보완하긴 힘들다. 리액트가 서비스 개발 전체에 정답이 돼 줄 것으로 생각해선 안된다. 그렇다고 특정 부분에 한계가 있다고 다시 전체를 보완할 만한 프레임워크를 찾는 것도 무리다.

React의 본질은 성능이 아니다. 장점은 개인마다 느끼는 바가 다르겠지만, 개인적으로는 성능이라는 것에 너무 집중할 필요는 없다고 생각한다. React의 철학이 무엇이고 어떤 고통을 해결해주며 또, 어떤 고통은 해결해주지 못하는지 잘 이해하여 프로젝트 성격과 팀의 역량 등을 고려해 시기적절하게 사용하면 된다.
