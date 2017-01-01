---
title: 프런트엔드 엔지니어를 위한 베지에 곡선(Bézier Curves) - 1편
description: 이 문서는 프런트개발에 있어서 유용하게 사용되는 베지에 곡선(Bézier Curves)의 원리를 수학적으로 자세히 소개하는 글의 첫 번째 편입니다.
date : 2017-01-02
category:
    - Algorithm
tags:
    - Algorithm
    - BezierCurves
    - Spline
    - Animation
    - Math
---

퇴근 후 여느 때와 마찬가지로 PlayStation 4 전원에 손이 향하는 순간, 오랫동안 관리하지 못한 [react-preloader-icon](https://github.com/uyeong/react-preloader-icon) 컴포넌트가 돌연 떠올랐다. react-preloader-icon은 [SVG Loaders](http://samherbert.net/svg-loaders/)의 아이콘을 React 컴포넌트로 옮기고 있는 작은 사이즈의 프로젝트다.

SVG Loaders에 디자인된 아이콘은 12개밖에 안되지만 게으른 나머지 아직 2개밖에 옮기지 못했다. 그래서 게임은 잠시 제쳐두고 Spinning과 Puff 아이콘을 한번 React 컴포넌트로 옮겨보기로 했다.

{% figure bezier-for-frontend.01.gif 'Spinning과 Puff' '그림 1. Spinning과 Puff' '340px' %}

## SVG와 3차 베지에 곡선

Spinning 아이콘은 손쉽게 옮겼지만, Puff 아이콘은 좀 달랐다. 이전에 옮긴 아이콘 모두 애니메이션이 선형적(linear) 이기 때문에 신경 쓸 게 없었다. 하지만 Puff 아이콘의 SVG는 조금 다른 방식으로 만들어져 있다.

{% prism html '
<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
    <g fill="none" fill-rule="evenodd" stroke-width="2">
        <circle cx="22" cy="22" r="1">
            <animate attributeName="r"
                begin="0s" dur="1.8s"
                calcMode="spline"
                values="1; 20"
                keyTimes="0; 1"
                keySplines="0.165, 0.84, 0.44, 1"
                repeatCount="indefinite" />
                ... 중략 ...
        </circle>
    </g>
</svg>
' %}

위 코드에서 `animate` 엘리먼트를 살펴보자. 이 엘리먼트는 `calcMode`, `values`, `keyTimes`, `keySplines` 속성을 갖고 있다. 일단 이 속성에 관한 지식이 전혀 없기 때문에 우선 [SMIL](https://www.w3.org/TR/2001/REC-smil-animation-20010904/) 스펙 문서를 살펴봤다.

스펙 문서를 통해 `calcMode`는 **값의 타이밍을 제어할 함수**를 선택하는 속성임을 알 수 있다. 속성 값으로 "discrete", "linear", "paced", "spline" 중 하나를 지정할 수 있다.

위 코드의 `calcMode` 속성에는 "spline"이 지정돼 있는데 "spline"으로 지정하면 `values`, `keyTimes`, `keySplines` 속성과 함께 "**3차 베지에 곡선**"으로 값을 제어할 수 있다.

잠깐, "3차 베지에 곡선"이라고? 다들 CSS로 애니메이션을 처리할 때 cubic-bezier라는 애니메이션 타이밍 함수를 한 번쯤 사용해본 적이 있을 것이다. cubic-bezier... 그렇다. 3차 베지에라는 뜻이다.

## CSS와 3차 베지에 곡선

cubic-bezier 애니메이션 타이밍 함수는 x, y, x\`, y\` 즉, 4개의 값을 인자로 전달받아 에니메이션의 타이밍을 조절한다. x, y는 첫 번째 가이드 포인트(Guide Point)의 좌표, x\`, y\`은 두 번째 가이드 포인트의 좌표다. 가이드 포인트란 곡선의 형태에 영향을 주는 조절 가능한 점을 뜻한다.

{% figure bezier-for-frontend.02.png '3차 베지에 곡선의 가이드 포인트' '그림 2. 3차 베지에 곡선의 가이드 포인트' '340px' %}

3차 베지에 곡선이란 이 두 가이드 포인트의 위치에 따라 그려지는 곡선을 말한다. cubic-bezier는 이 곡선을 이용해 에니메이션의 타이밍을 조절한다(이 속성은 [cubic-bezier.com](http://cubic-bezier.com/), [CSS3 Bezier Curve Tester](http://www.css3beziercurve.net/), [desmos](https://www.desmos.com/calculator/cahqdxeshd)에서 간단히 테스트해 볼 수 있다).

{% figure bezier-for-frontend.03.png 'cubic-bezier를 이용해 선언한 Easing 함수 셋' '그림 3. cubic-bezier를 이용해 선언한 Easing 함수 셋' '340px' %}

우리가 알고 있는 easeInSine, easeInQuad 등과 같은 Easing 함수([참고](http://easings.net/ko#))는 모두 이 베지에 곡선을 이용해 미리 만든 일종의 셋이다.

## 한걸음 더...

자, 본래 이야기로 다시 돌아와서... 

SVG의 `calcMode="spline"`의 의미를 살펴봤으니 [bezier-easing](https://www.npmjs.com/package/bezier-easing)같은 npm 모듈을 사용해 Puff 아이콘을 React 컴포넌트로 옮기면 된다. 하지만 커밋을 완료하고 따듯한 이불 속에서 편안한 마음으로 잠자리에 들기엔 모르는 것이 너무나 많다. 

왜 베지에 곡선이라 부를까? 무엇을 근거로 1차, 2차, 3차라고 나눌까? 또, 곡선이 그려지는 원리와 공식은 무엇일까? 몇 가지 물음이 잠 못 이루게 했고 결국 이 주제로 글을 작성하게 됐다. 

그럼 다음 편부터 본격적으로 베지에 곡선에 관해서 연재하도록 하겠다.


## 참고

 * [SCSS에서 사용할 cubic-bezier 값을 저장해두자(일본어)](http://qiita.com/volkuwabara/items/64d1ac2c3d8e8a3110f5)
