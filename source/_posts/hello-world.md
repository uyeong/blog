---
title: Hello World
description: Hexo의 테마인 Mooji의 기능을 설명합니다.
date : 2016-08-13
category: Tools
keywords:
    - hexo
    - blog
    - theme
tags:
    - Tools
    - Hexo
    - Blog
---

Hexo 테마 무지(Mooji)를 만들었습니다. 이 테마는 심플함과 글을 읽는데 방해되는 요소를 최대한 배제해 디자인했습니다. 기본적으로 모든 마크다운 문법과 Hexo 플러그인을 지원하며 커스텀 플러그인으로 `figure`, `prism`, `alert` 플러그인을 추가했습니다.

## Figure

Figure는 이미지 리소스를 표현하는데 사용합니다. 아래는 Figure 플러그인의 예제 코드입니다.

{% prism js "
\{% figure something.png '대체 텍스트' '그림 1. 그림 설명' %\}
" %}

이미지는 다음과 같이 출력됩니다.

{% figure something.png '대체 텍스트' '그림 1. 그림 설명' %}

## Prism

Prism은 프로그래밍 코드를 표현하는데 사용합니다. 아래는 Prism 플러그인의 예제 코드입니다.
{% prism js "
\{% prisim js \"
const a = 10;
const b = 20;
const c = a + b;

console.log(c); // 30
\" %\}
" %}

프로그래밍 코드는 다음과 같이 출력됩니다.

{% prism js "
const a = 10;
const b = 20;
const c = a + b;

console.log(c); // 30
" %}

## Alert

Alert는 부가 정보, 성공, 경고 등의 메시지를 표현하는데 사용합니다. 아래는 Alert 플러그인의 예제 코드입니다.

{% prism js "
\{% alert info '정보' '이번에 업데이트된 버전에는...' %\}
\{% alert success '성공' '위 예제 코드는 성공한다.' %\}
\{% alert warning '경고' '다음 버전에서 이 메서드는 제거된다.' %\}
" %}

각 메시지는 다음과 같이 출력된다. 참고로 Alert 플러그인에는 마크다운 문법도 사용할 수 있다.

{% alert info '정보' '이번에 업데이트된 버전에는...' %}
{% alert success '성공' '위 예제 코드는 성공한다.' %}
{% alert warning '경고' '다음 버전에서 이 메서드는 제거된다.' %}


## Quote

이 테마는 기본 마크다운 문법을 사용한 인용구 스타일을 지원한다. 

{% prism md "
> Your Mouse is a Database.
> -- *에릭 마이어(Erik Meijer)*
" %}

인용구는 다음과 같이 출력된다.

> Your Mouse is a Database.
> -- *에릭 마이어(Erik Meijer)*

여기까지 무지 테마의 기본적인 설명을 마친다. 즐거운 블로깅이 되길 바란다.
