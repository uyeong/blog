---
title: 자바스크립트와 비동기 오류 처리
description: 자바스크립트 환경에서 비동기 오류를 처리할 때 어려움을 겪는 부분을 설명하고 Generator를 사용한 비동기 에러 핸들링 방법에 관해 소개합니다.
date : 2014-11-15
category:
    - JavaScript
    - Etc
tags:
    - JavaScript
    - ECMAScript 6
---

{% alert info '읽기전에...' %}
이 문서는 야후! 재팬의 "[JavaScriptと非同期のエラー処理](http://techblog.yahoo.co.jp/programming/javascript_error/)"을 번역한 것입니다.
{% endalert %}

[Yahoo! Developer Network](https://developer.yahoo.com/)의 中野-나카노-([@Hiraku](https://twitter.com/Hiraku))입니다. 2013년 2월에 [콜백 지옥에 관한 아티클](http://techblog.yahoo.co.jp/programming/js_callback/)에서 복잡하게 중첩되기 쉬운 비동기 처리를 Generator, jQuery.Deferred를 사용하여 동기적으로 표현하는 방법을 소개했습니다. 그런데 비동기 처리에는 에러 처리 시 예외를 사용할 수 없다는&nbsp;또 다른 문제가 있습니다. 이번에는 그 에러 처리에 관해 이야기해보고자 합니다.

## 예외를 사용한 오류 처리

비동기 처리를 이야기하기 전에 "예외"에 대해서 복습해 보겠습니다. 자바스크립트뿐만 아니라 많은 언어에서도 예외를 사용하여 오류를 핸들링할 수 있습니다. WebAPI의 응답 코드가 500 이거나 입력된 값이 기대하는 타입이 아닌 경우 등, 특정 오류가 발생하면 예외로써 throw하고 try-catch 블록으로 감싸 통합하여 처리합니다. 자바스크립트는 throw 할 수 있는 타입에 제한이 없으므로 문자열을 이용해서도 throw 할 수 있습니다.

{% codeblock lang:js %}
try {
  a();
} catch(e) {
  console.log(e);
  console.log('에러에서 복구됐다.');
}

function a() {
  b();
}

function b() {
  c();
}

function c() {
  throw '에러가 발생했다!';
}

/*
'에러가 발생했다!'
'에러에서 복구됐다.'
*/
{% endcodeblock %}

throw 된 예외를 try-catch로 감싸지 않으면 함수를 호출한 상위로 전파합니다. 만약 전파 과정에서 try-catch를 만나지 못한다면 컴파일러가 중단됩니다. 위 코드로 설명해 드리자면 함수 c에서 예외가 발생해 함수 b와 함수 a로 전파됩니다. 그리고 마지막으로 global로 전파되는데 try~catch로 감싸져 있으므로 예외 처리됩니다.

{% figure async_error.01.png '예외 전파 과정' '그림 1. 예외 전파 과정' %}

이 동작은 에러를 상위에서 통합해 처리하거나 라이브러리를 이용하는 클라이언트에게 에러 처리를 강제하는 등 편리하게 이용될 수 있습니다. 예외는 함수를 호출한 상위(호출 이력, 콜-스택)로 전파된다는 점을 꼭 기억해 두시길 바랍니다. 앞으로 설명할 내용을 이해하는 데 필요한 개념입니다.

## 비동기에서의 예외를 사용한 오류 처리

문제는 비동기 처리의 경우입니다. 여기에서는 비동기로 처리되는 함수의 예로 setTimeout()을 사용해보겠습니다. 이는 Ajax와 같은 비동기 함수에도 동일하게 해당합니다. 아래는 호출된 시점부터 1초 후에 예외가 발생하는 비동기 코드입니다.

{% codeblock lang:js %}
setTimeout(function() {
  throw '에러가 발생했다!';
}, 1000);
{% endcodeblock %}

이 코드를 try-catch로 감싸면 예외를 감지할 수 있을까요?

{% codeblock lang:js %}
try {
  setTimeout(function() {
    throw '에러가 발생했다!';
  }, 1000);
} catch(e) {
  console.log(e);
  console.log('에러에서 복구됐다.');
}
{% endcodeblock %}

유감스럽게도 이 코드는 동작하지 않습니다. 예외는 감지되지 않으며 컴파일러는 중단됩니다. 이전 절에서 예외는 함수를 호출한 상위(호출 이력, 콜-스택)로 거슬러 전파된다고 설명해 드렸습니다. 콜백 스타일의 비동기 처리에서는 작성한 곳에서 함수가 호출되지 않습니다. 예외를 throw 하는 함수는 이 try-catch 안에서 단순히 정의된 것뿐입니다. 실제로 함수는 타이머 이벤트에 의해서 실행됩니다. try-catch 안에서 발생한 오류가 아니므로 예외를 감지할 수 없습니다.

{% figure async_error.02.png '예외 전파 과정' '그림 2. 비동기에서의 전파 과정' %}

위와 같이 비동기 처리가 중간에 있으면 실질적으로 try-catch 구문을 사용할 수 없습니다. 물론 finally도 마찬가지입니다. 위와 같은 코드는 금방 실수를 눈치챌 수 있지만 setTimeout 부분을 함수나 객체로 추상화한다면 예외가 처리되지 않는 이유를 발견하기 힘듭니다.

{% codeblock lang:js %}
// 다음과 같이 에러를 다루고 싶다.
try {
  asyncDoSomething(); //비동기 함수
  asyncDoSomething(); //비동기 함수
} catch(e) {
  //...
}

// 하지만 asyncDoSomething()에서 throw한 예외는 절대 catch할 수 없다.
{% endcodeblock %}

그럼 이 문제를 어떻게 해결할 수 있을까요?

## 예외를 사용할 수 있도록 대응

먼저 어떻게든 예외를 사용할 수 있도록 하는 방법을 찾아보겠습니다. 사전에 try-catch를 포함하여 콜백을 정의하면 예외를 사용할 수 있습니다.

{% codeblock lang:js %}
setTimeout(function() {
  try {
    //...
    throw '에러가 발생했다!';
    //...
  } catch(e) {
    console.log(e);
    console.log('에러에서 복구됐다.');
  }
}, 1000);
{% endcodeblock %}

하지만 이 방법은 비슷한 에러를 통합해 처리할 수 없습니다. 정의할 때마다 try-catch 블록을 작성해야 합니다. 이 문제는 AOP(관점 지향 프로그래밍)와 같은 느낌의 확장 포인트를 둔다면 다소 개선할 수 있습니다. try-catch만 별도의 함수로 정의하고 그 함수를 사용해 코드를 작성하면 비슷한 에러를 통합해 처리할 수 있습니다. AOP는 JAVA에서 유연성을 위해 사용하는 테크닉이지만, 자바스크립트는 본래 유연한 언어이기 때문에 특별한 라이브러리의 도움 없이 쉽게 구현할 수 있습니다.

{% codeblock lang:js %}
/**
 * 예외 처리를 분담하는 함수
 * try-catch를 공통화할 수 있다.
 */
function errorHandle(process) {
  return function() {
    try {
      return process.apply(this, arguments);
    } catch(e) {
      console.log(e);
      console.log('에러에서 복구됐다.');
    }
  };
}

// errorHandle()에 에러가 발생할지 모를 콜백을 전달한다. 
setTimeout(errorHandle(function() {
  throw '에러가 발생했다!';
}), 1000);

setTimeout(errorHandle(function() {
  throw '에러가 발생했다!';
}), 2000);

//↑ 두 setTimeout에서 발생한 에러를 감지한다.
{% endcodeblock %}


다만, 원래의 try-catch 구문 작성법과 달라져 버리며 심미적으로도 좋지도 않습니다. 각종 플로우 제어 라이브러리를 살펴보면 오류 처리 시 예외를 사용하지 않는 것도 많이 있습니다. 그만큼 비동기 처리에서 예외를 사용하는 것은 상당히 어려운 것 같습니다.

## Generator와 예외

여기까지는 현재의 자바스크립트를 이야기했습니다만, 앞으로는 Generator([harmony:generators](http://wiki.ecmascript.org/doku.php?id=harmony:generators))가 도입됨으로써 이러한 문제를 해결할 수 있을 전망입니다. 지난번 아티클에서는 Generator가 비동기 처리와 잘 어울린다는 사실을 이야기했습니다. 다시 복습하자면 다음과 같습니다.

 * Generator를 사용하면 함수의 처리를 일시 정지하거나 재개할 수 있다.
 * 처리가 끝나면 Generator 처리를 재개하는 것과 같은 비동기 처리 함수를 만들 수 있다.
 * 비동기 함수 호출과 동시에 Generator 처리를 일시 정지하는 것으로 복수의 함수로 나눌 수밖에 없었던 부분을 한 번에 작성할 수 있다.

아래 예제는 Firefox를 기준으로 작성했습니다.

{% codeblock lang:js %}
/**
 * sleep
 * @description setTimeout()을 Generator로 사용하기 쉽게한 함수
 * @param {number} ms 밀리세컨드
 * @param {Generator} thread 처리가 끝나면 재개하는 gernerator 객체
 */
function sleep(ms, thread) {
  return setTimeout(function() {
    try{
      thread.next();
    }catch(e){
      if (! e instanceof StopIteration) thread.throw(e);
    }
  }, ms);
}

//위 sleep()을 사용하면 비동기 처리를 아래와 같이 동기적으로 작성할 수 있다.

var thread = (function() {
  console.log(0);
  yield sleep(1000, thread);
  console.log(1);
  yield sleep(1000, thread);
  console.log(2);
})();

thread.next();

/*
 '0'을 출력
 (1초 후)

 '1'을 출력
 (1초 후)

 '2'을 출력
*/
{% endcodeblock %}

비동기 처리에서는 예외를 사용할 수 없다고 했지만 사실 Generator 내에서는 try-catch를 사용할 수 있습니다. 가령, 일정 시간 후 예외를 throw 하는 sleepAndError 라고 하는 함수(실용적인 코드는 아니지만)가 있다고 합시다.

{% codeblock lang:js %}
function sleepAndError(ms, thread) {
  return setTimeout(function() {
    thread.throw('에러가 발생했다!');
  }, ms);
}
{% endcodeblock %}

throw 대신, Generator 객체에 있는 .throw() 메서드를 사용하면 비동기 함수 안이 아닌 yield의 위치에서 예외가 발생합니다. 단순히 throw 문을 사용하면 여전히 예외를 감지할 수 없으므로 주의해야 합니다.

{% codeblock lang:js %}
var thread = (function() {
  try{
    console.log(0);
    yield sleepAndError(1000, thread); //여기에서 에러가 발생했다!
    console.log(1);
    yield sleepAndError(1000, thread);
    console.log(2);
  } catch(e) {
    console.log(e);
    console.log('에러에서 복구됐다.');
  }
})();

thread.next();

/*
'0'을 출력한다.

1초 후에

'에러가 발생했다!'를 출력한다.
'에러에서 복구됐다.'를 출력한다.
*/
{% endcodeblock %}

위 플로우를 그림으로 설명하겠습니다.

{% figure async_error.03.png 'Generator의 예외 전파 과정' '그림 3. Generator의 예외 전파 과정' %}

throw 메서드는 호출된 곳에서 예외를 발생시키지 않고 한번 Generator 처리를 재개한 후 예외를 발생시킵니다. 즉, Generator 내부에서 예외가 발생하게 되므로 Generator를 호출한 상위로 예외가 전파됩니다. 다른 구문으로는 표현할 수 없는 기능입니다. Generator는 그 명칭과 함께 뭔가 특별하게 처리되는 것처럼 보이지만 실제로는 코-루틴의 일종이며, 다양한 응용이 가능하므로 여러 가지 용도로 사용할 수 있습니다.

## 정리

 * 현재는 비동기 처리에서 예외를 처리하기 어렵다. 여러 가지 테크닉으로 구현 할 수 있지만 예외로서의 장점이 없다.
 * Generator를 사용하면 비동기 처리에서도 예외를 처리하기 쉽다.

{% alert info '역자노트' %}
Generator 뿐만 아니라 Promise 역시 강력한 에러 처리 메커니즘을 가지고 있습니다. Promise를 사용하면 추상화한 모든 비동기 로직에서 발생하는 예외를 한곳에서 통합해 처리할 수 있습니다. 이 부분에 대해서는 여러분에게 자세히 소개해 드릴 기회가 있을 것 같습니다.
{% endalert %}

여기까지 비동기에서의 예외 처리 문제와 Generator에서의 예외 처리를 소개했습니다. jQuery.Deferred에 대한 이야기([爆速でわかるjQuery.Deferred超入門](http://techblog.yahoo.co.jp/programming/jquery-deferred/))는 다음 기회에 소개하겠습니다.
