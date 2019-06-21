---
title: Tabnabbing 공격과 rel=noopener 속성
description: 이 문서는 Tabnabbing 공격과 이를 막을 수 있는 rel=noopener 속성에 대해 소개합니다.
permalink: tabnabbing_attack_and_noopener
date : 2017-05-30
category:
    - JavaScript
tags:
    - JavaScript
    - Attack
    - Security
    - Hacking
---

## Tabnabbing

Tabnabbing이란 HTML 문서 내에서 링크(target이 _blank인 Anchor 태그)를 클릭 했을 때 새롭게 열린 탭(또는 페이지)에서 기존의 문서의 location을 피싱 사이트로 변경해 정보를 탈취하는 공격 기술을 뜻한다. 이 공격은 메일이나 오픈 커뮤니티에서 쉽게 사용될 수 있다.

{% figure tab-nabbing.01.svg 'Tabnabbing 공격 흐름' '그림 1. Tabnabbing 공격 흐름(<a href="https://blog.jxck.io/entries/2016-06-12/noopener.html">출처</a>)' '420px' %}

공격 절차는 다음과 같다.

 1. 사용자가 `cgm.example.com`에 접속한다.
 2. 해당 사이트에서 `happy.example.com`으로 갈 수 있는 외부 링크를 클릭한다.
 3. 새탭으로 `happy.example.com`가 열린다.
   * `happy.example.com`에는 `window.opener` 속성이 존재한다.
   * 자바스크립트를 사용해 opener의 location을 피싱 목적의 `cgn.example.com/login` 으로 변경한다.
 4. 사용자는 다시 본래의 탭으로 돌아온다.
 5. 로그인이 풀렸다고 생각하고 아이디와 비밀번호를 입력한다.
   * `cgn.example.com`은 사용자가 입력한 계정 정보를 탈취한 후 다시 본래의 사이트로 리다이렉트한다.

## NAVER 메일과 Gmail

시나리오를 하나 그려보자. 공격자가 네이버 계정을 탈취할 목적으로 여러분에게 바겐세일 정보를 담은 메일을 보냈다. 그 메일에는 [자세히 보기]라는 외부 링크가 포함돼 있다.

물론 이 바겐세일 정보는 가짜지만 공격자에겐 중요하지 않다. 메일을 읽는 사람이 유혹에 빠져 링크를 클릭하면 그만이다.

{% figure tab-nabbing.02.gif 'NAVER 메일을 이용한 Tabnabbing 데모' '그림 2. NAVER 메일을 이용한 Tabnabbing 데모' '420px' %}

국내에서 가장 유명한 포털 회사인 NAVER가 이러한 공격에 다소 미흡한 점은 못내 아쉽다. NAVER 뿐만 아니라 DAUM도 마찬가지이며 아마 카페 서비스도 동일하게 재현할 수 있지 않을까 생각한다.

하지만 Gmail은 이 공격이 통하지 않는다. Gmail은 이러한 공격을 막기 위해 Anchor 태그에 data-saferedirecturl 속성을 부여해 안전하게 리다이렉트 한다. Twitter도 동일한 방법으로 대응하고 있다.

{% figure tab-nabbing.03.png 'Gmail의 소스 코드' '그림 3. Gmail의 소스 코드' '420px' %}

## rel=noopener 속성

이러한 공격의 취약점을 극복하고자 noopener 속성이 추가 됐다.

rel=noopener 속성이 부여된 링크를 통해 열린 페이지는 location 변경과 같은 자바스크립트 요청을 거부한다. 정확히 말해서 `Uncaught TypeError` 에러를 발생시킨다(크롬 기준).

{% figure tab-nabbing.04.png '새탭의 콘솔 결과' '그림 4. 새탭의 콘솔 결과' '420px' %}

이 속성은 [Window Opener Demo](https://labs.jxck.io/noopener/) 페이지를 통해 테스트해볼 수 있다.

크롬은 버전 49, 파이어폭스 52부터 지원한다. 파이어폭스 52가 2017년 3월에 릴리즈 된 것을 감안하면 이 속성 만으로 안심하긴 힘들 것 같다. 자세한 지원 여부는 [Link types](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types)를 참고한다.

따라서 이러한 공격이 우려스러운 서비스(메일, 커뮤니티, 댓글 시스템 등)라면 [blankshield](https://danielstjules.github.io/blankshield/)와 같은 라이브러리를 사용하자.

noopener 속성은 보안적 측면 외에도 성능 상의 이점도 취할 수 있다.

_blank 속성으로 열린 탭(페이지)는 언제든지 opener를 참조할 수 있다. 그래서 부모 탭과 같은 스레드에서 페이지가 동작한다. 이때 새탭의 페이지가 리소스를 많이 사용한다면 덩달아 부모 탭도 함께 느려진다.

noopener 속성을 사용해 열린 탭은 부모를 호출할 일이 없다. 따라서 같은 스레드 일 필요 없으며 새로운 페이지가 느리다고 부모 탭까지 느려질 일도 없다.

{% alert info %}
rel="noopener" prevents window.opener, so there\'s no cross-window access. Chromium browsers optimise for this and open the new page in its own process.
{% endalert %}

자세한 내용은 [The performance benefits of rel=noopener](https://jakearchibald.com/2016/performance-benefits-of-rel-noopener/)을 참고하자.

## 참고자료

 * [Tabnabbing: A New Type of Phishing Attack](http://www.azarask.in/blog/post/a-new-type-of-phishing-attack/)
 * [Target="_blank" - the most underestimated vulnerability ever](https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/)
 * [링크에 rel=noopener를 부여해 Tabnabbing을 대비](https://blog.jxck.io/entries/2016-06-12/noopener.html)(일본어)
 * [The performance benefits of rel=noopener](https://jakearchibald.com/2016/performance-benefits-of-rel-noopener/)
