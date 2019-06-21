---
title: "history 객체의 scrollRestoration 속성"
description: "onload 타임에 특정 위치에 자동 스크롤링 되는 기능을 프로토타이핑 하면서 마주한 문제와 history 객체의 scrollRestoration 속성으로 해결한 과정을 소개합니다."
permalink: scroll-restoration-property-of-history
date : 2016-11-28
category:
    - JavaScript
    - Etc
tags:
    - JavaScript
    - history
    - scrollRestoration
---

특정 목록 페이지에 접근할 때 사용자가 마지막으로 클릭했던 아이템이 보이도록 자동 스크롤링 해달라는 요청이 들어왔다. 개인적으로 `onload` 타임에 특정 목록으로 자동 스크롤링하는 기능은 지양해 왔기 때문에 웹이 가진 한계점을 설명하면서 간단히 프로토타이핑해본 후 판단하자고 의견을 냈다.

그런데 프로토타이핑하던 도중 예전엔 경험하지 못했던 이상한 현상이 발견됐다. 아래는 사용자가 마지막으로 클릭한 아이템이 "product30" 이라고 보고 해당하는 엘리먼트의 위치로 스크롤링하는 간단한 코드다.

{% prism js %}
window.addEventListener('load', () => {
    console.log('onloaded');

    const product30 = document.getElementsByClassName('product-item')[29];
    const top = product30.getBoundingClientRect().top;

    console.log(`scroll to ${top}(product30)`);

    window.scrollTo(0, top);
});
{% endprism %}

생각한 대로라면 지정한 위치로 스크롤링 되어야 하지만 동작하지 않았다. 아래 "그림 1"을 보면 분명히 `9970.875` 즉, "product30"의 위치로 스크롤링을 지시했음에도 문서는 여전히 최상단에 있음을 알 수 있다.

{% figure scroll.01.png '동작하지 않는 scrollTo()' '그림 1. 동작하지 않는 scrollTo()' %}

간단한 코드로 재현하긴 힘들지만, 실제 서비스 페이지에서는 `setTimeout(() => ..., 0)`으로 지정해도 금세 원래의 위치로 크롬이 재보정한다.

 이렇게 동작하는 이유는 크롬이 사용자가 보고 있던 스크롤 위치를 저장하고 있다가 해당 페이지에 다시 접근하면 브라우저 레벨에서 자동으로 스크롤링하기 때문인데 어떻게 해야 이를 회피할 수 있을지 고민됐다. 이때 [찬욱](http://sculove.github.io/blog/)님에게 여쭤보니 아래와 같은 코드로 이를 무력화할 수 있다는 답변을 받았다.

{% prism js %}
if ('scrollRestoration' in history) {
    // Back off, browser, I got this...
    history.scrollRestoration = 'manual';
}
{% endprism %}

위 코드를 삽입하고 다시 페이지에 접근하니 정확히 의도한 대로 동작했다.

{% figure scroll.02.png '제대로 동작하는 scrollTo()' '그림 2. 제대로 동작하는 scrollTo()' %}

프로토타이핑은 무사히 완료했고 의사 결정하는데 큰 역할을 했다. 하지만 이렇게 이야기를 마무리하기엔 찜찜하다. `scrollRestoration` 속성을 좀 이해하고 넘어가야 할 것 같다.

필자는 이번에 `scrollRestoration`이라는 속성을 처음 봤다. 그도 그럴 것이 `scrollRestoration`은 실험적(Experimental) API 에다가 아직 MDN에 페이지도 없고([참고](https://developer.mozilla.org/ko/docs/Web/API/History/scrollRestoration)), 2015년 10월에 배포된 크롬 46에서야 추가된 API다.

`scrollRestoration`은 히스토리 네비게이션의 스크롤 복원 기능을 명시적으로 지정할 수 있는 속성이다. 속성값은 'auto'와 'manual'이 전부. SPA 환경과 관련이 있어 보인다. 이 글을 읽는 사람 중 대다수는 목록 페이지에서 특정 아이템을 클릭해 엔드 페이지로 갔다가 다시 되돌아오면 스크롤을 처음부터 다시 해야 하는 경험을 한 적 있을 것 같다. 그래서 스크롤 포지션 값을 `LocalStorage`에 저장했다가 다시 목록 페이지에 접근하면 억지로 스크롤 위치를 잡아주는 기능을 구현한다.

대표적으로 네이버 주식 모바일 웹이 그런 방식으로 구현돼 있는데 토론 목록 페이지에서 토론 페이지로 접근하면 `scrollY` 값을 기억해 뒀다가,  뒤로 가기 하여 토론 목록 페이지로 되돌아오면 이 값을 이용해 스크롤 위치를 조절한다.

{% figure scroll.03.png '보던 목록으로 스크롤링하기 위해 scrollY 값을 기억한다' '그림 3. 사용자가 보던 곳으로 보정하기 위해 scrollY 값 저장' %}

위와 같은 구현 방식은 사용자가 정확히 어느 경로를 통해 목록 페이지로 접근하는지 알기 어려워 자칫 잘못된 경험을 제공(검색을 통해 접근했는데 스크롤 위치를 조절하는 등)하기도 하는데 `scrollRestoration`은 history navigation을 기반으로 동작하기 때문에 이러한 부분을 해소할 수 있을 것으로 보인다. 하지만 처음에 이야기한 것처럼 자동 스크롤링 기능이 오히려 특정 기능 구현에 방해가 될 수도 있는데 세심하게 개발자에게 조절할 수 있도록 속성을 열어줘서 고마울 따름.

테스트 코드는 [UYEONG/scroll-restoration-test](https://github.com/UYEONG/scroll-restoration-test)에 올려놓았으니 참고하길 바란다.

## 참고

 * [History - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/History)
 * [History API: Scroll Restoration](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration)
 * [Custom Scroll Restoration - History-based API](https://majido.github.io/scroll-restoration-proposal/history-based-api.html)
