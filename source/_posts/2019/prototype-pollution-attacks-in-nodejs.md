---
title: Node.js에서의 프로토타입 오염 공격이란 무엇인가
description: __proto__을 이용한 프로토타입 오염(prototype pollution) 공격의 원리를 설명하면서 노드 환경에서 실제 공격이 가능한 사례를 함께 소개합니다.
permalink: prototype-pollution-attacks-in-nodejs
date : 2019-07-19
category:
    - JavaScript
    - Security
tags:
    - JavaScript
    - Development
    - Node
    - Security
    - ECMAScript
    
---

{% alert info '읽기전에...' %}
이 문서는 「[Node.jsにおけるプロトタイプ汚染攻撃とは何か](https://jovi0608.hatenablog.com/entry/2018/10/19/083725)」를 번역한 글입니다. 원작자에게 번역 및 배포 허락을 받았습니다. 프로토타입 오염 취약성이 많은 분에게 알려지길 바랍니다.
{% endalert %}

## 시작하면서

최근 까닭이 있어 노드의 보안 사항을 조사하고 있는데요. 올해 5월에 개최된 [North Sec 2018](https://nsec.io/), 보안 연구자 [Olivier Arteau](https://github.com/HoLyVieR)의 "[Prototype pollution attacks in NodeJS applications](https://www.youtube.com/watch?v=LUsiFV3dsK8)"라는 재미있는 발표를 발견했습니다.

이 발표의 논문, 발표 자료, 데모 영상을 깃허브에 공개했으며 때마침 발표 영상도 유튜브를 통해 공개됐습니다.

 * [HoLyVieR/prototype-pollution-nsec18](https://github.com/HoLyVieR/prototype-pollution-nsec18)
 * [Prototype pollution attacks in NodeJS applications](https://www.youtube.com/watch?v=LUsiFV3dsK8)

이 발표에서는 공격자가 자바스크립트 언어 고유의 프로토타입 체인 동작 원리를 이용해 웹 서버를 공격하는 방법을 이야기합니다.

발표자는 npm에서 받을 수 있는 모듈을 조사해 lodash를 시작으로 많은 모듈에 프로토타입 오염 취약점이 있는 것을 발견하고 보고했습니다. 그리고 실제 취약점이 있는 Ghost CMS를 이용, 비밀번호 재설정 요청에 필요한 데이터를 변조해 서버상에서 계산기 애플리케이션을 실행시키는 데모까지 성공합니다.

자바스크립트 실행 환경에 있어 프로토타입 오염 발생 위험성은 오래전부터 이야기 돼 왔지만 이것이 Node.js 환경의 웹 서버를 공격하는데 활용될 것이라고는 생각지 못했을 것 같습니다.

이 문서에서는 개인적으로도 기억해둘 겸 해당 공격의 원리에 관해서 설명하고자 합니다.

## \_\_proto__

객체의 프로토타입을 참조하는 `__proto__`는 예로부터 보편적으로 사용해온 기능입니다. 정식 사양은 아니었지만, 실정과 구현 현황을 소급 인정하고 브라우저 간 호환을 위해 ECMAScript2015 사양에 추가됐습니다.

 * [Object.prototype.\_\_proto__ - MDN web docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto)

이 외에도 `__proto__`에 대한 게터 / 셋터와 같은 기능인 `Object.setPrototypeOf` / `getPrototypeOf`도 규정돼 있습니다. 현재 Node.js 환경에서도 모두 사용할 수 있습니다. 하지만 MDN에서는 프로토타입을 변경하는 것을 비권장합니다. 

## 프로토타입 오염

프로토타입 오염은 무엇일까. 방법에는 여러 가지 있겠지만 가장 기본은 객체 리터럴의 `__proto__`는 `Object.prototype`과 같다는 것을 이용해 다른 객체 속성에 영향을 주는 방식입니다.

{% prism js %}
const obj1 = {};
console.log(obj1.__proto__ === Object.prototype); // true
obj1.__proto__.polluted = 1;
const obj2 = {};
console.log(obj2.polluted); // 1
{% endprism %}

위 예제에서 obj1의 프로토타입 객체를 조작했습니다. 이제 아무 관계 없는 `obj2` 속성의 값(obj2.polluted)이 `undefined`가 아니라 `1`로 출력됩니다.

발표에서는 아래와 같은 객체 프로토타입 오염이 일어날 수 있는 세 가지 패턴을 소개합니다. 모두 `__proto__`을 포함한 문자열을 key로 이용해 정확하지 않은 데이터를 객체에 등록 시켜 `Object.prototype` 오염을 노리는 방식입니다.

### 속성 설정

{% prism js %}
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
 
function setValue(obj, key, value) {
  const keylist = key.split('.');
  const e = keylist.shift();
  if (keylist.length > 0) {
    if (!isObject(obj[e])) obj[e] = {};
    setValue(obj[e], keylist.join('.'), value);
  } else {
    obj[key] = value;
    return obj;
  }
}
 
const obj1 = {};
setValue(obj1, "__proto__.polluted", 1);
const obj2 = {};
console.log(obj2.polluted); // 1
{% endprism %}

### 객체 병합

{% prism js %}
function merge(a, b) {
  for (let key in b) {
    if (isObject(a[key]) && isObject(b[key])) {
      merge(a[key], b[key]);
    } else {
      a[key] = b[key];
    }
  }
  return a;
}
 
const obj1 = {a: 1, b:2};
const obj2 = JSON.parse('{"__proto__":{"polluted":1}}');
merge(obj1, obj2);
const obj3 = {};
console.log(obj3.polluted); // 1
{% endprism %}

### 객체 복사

{% prism js %}
function clone(obj) {
  return merge({}, obj);
}
 
const obj1 = JSON.parse('{"__proto__":{"polluted":1}}');
const obj2 = clone(obj1);
const obj3 = {};
console.log(obj3.polluted); // 1
{% endprism %}

위와 비슷한 기능을 제공하는 유저 모듈에서 프로토타입 오염 취약점이 발견, 수정되고 있습니다. 수정된 부분을 살펴보았는데 key에 `__proto__`가 있을 경우 건너뛰도록 돼 있습니다.

공격자는 외부에서 `Object.prototype`을 조작할 수 있기 때문에 for-in 문의 오작동을 노려 악의적으로 속성을 수정하거나 `toString`, `valueOf` 등의 메서드를 재정의할 수도 있습니다. DoS는 간단하게 일으킬 수 있겠네요.

## 실제 공격

발표에서는 실제 CMS 서버에 비밀번호 재설정에 필요한 JSON을 조작해 공격하는 방법을 소개합니다.

아이러니하게 객체 프로토타입 오염 공격이 성공한 경우에 서버 크래시 없이 동작하도록 하는 것은 꽤 어려운 기술입니다. 데모에서는 여러가지 방안을 고안해 CMS 템플릿을 조작하고, 테스트용으로 남겨져 있는 템플릿을 조작하여 임의의 자바스크립트를 서버상에서 실행(계산기 앱을 시작) 시키는 과정을 보여줍니다.

이 글에서는 JSON을 받아 어떠한 처리를 하는 간단한 웹 API 서버를 이용해 프로토타입 오염 공격에 의해 응답이 조작되는 샘플을 소개합니다.

다음은 서버 코드입니다. 외부에서 전달받은 JSON을 그대로 복사하고 있습니다.

{% prism js %}
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
 
function merge(a, b) {
  for (let key in b) {
    // 이 부분에서 key가 __proto__ 일 때에 건너뛰어야 한다.
    if (isObject(a[key]) && isObject(b[key])) {
      merge(a[key], b[key]);
    } else {
      a[key] = b[key];
    }
  }
  return a;
}
 
function clone(obj) {
  return merge({}, obj);
}
 
const express = require('express');
const app = express();
app.use(express.json());
app.post('/', (req, res) => {
  // 여기에서 악의적인 JSON을 그대로 복사함으로써 객체의 프로토타입 오염이 일어난다
  const obj = clone(req.body);
  const r = {};
  // 프로토타입 오염에 의해 r.status가 변조된다.
  const status = r.status ? r.status: 'NG';
  res.send(status)
});
app.listen(1234);
{% endprism %}

클라이언트는 `__proto__` 속성을 갖는 JSON을 서버에 전달해 공격합니다.

{% prism js %}
const http = require('http');
const client = http.request({
  host: 'localhost',
  port: 1234,
  method: 'POST'
}, (res) => {
  res.on('data', (chunk) => {
    console.log(chunk.toString());
  });
});
const data = '{"__proto__":{"status":"polluted"}}';
client.setHeader('content-type', 'application/json');
client.end(data);
{% endprism %}

공격 결과. 전달한 JSON에 의해 서버의 객체 프로토타입이 오염돼 응답의 값이 `NG`가 아니라 `polluted`로 변경돼 내려옵니다.

{% prism js %}
$ node client.js
polluted
{% endprism %}

## 대책

이 공격을 방지하는 대책으로 다음 세 가지 방법이 있습니다.

 * **Object.freeze** : `Object.prototype`이나 `Object`를 `freeze`하여 변경을 불가능하게 하는 방법입니다. 부작용으로 정상적인 모듈임에도 이 조치로 동작하지 않을 수도 있습니다. 
 * **JSON schema** : [avj](https://ajv.js.org/) 모듈 등을 사용해 JSON을 검증합니다.
 * **Map** : key / value를 저장하는데 객체를 사용하지 않고 `Map`을 사용합니다. 단, ES5 이전 환경에서는 사용할 수 없습니다.

의식하지 않으면 언제든지 이 취약점이 노출될 수 있습니다.

## 정리

이 글을 정리하면서도 다른 객체를 단순히 깊은 복사 하는 것만으로 취약점이 노출된다는 사실에 놀랐습니다. 역시 외부에서 전달받은 데이터를 처리할 때엔 신중해야 합니다. 

취약점이 알려진 사용자 모듈 대부분은 이미 고쳐진 상태입니다. 그럼에도 신경 쓰인다면 한번 `npm audit`으로 확인해보시기 바랍니다.

{% prism text %}
$ npm audit
 
                       === npm audit security report ===
 
# Run  npm install lodash@4.17.11  to resolve 1 vulnerability
 
  Low             Prototype Pollution
 
  Package         lodash
 
  Dependency of   lodash
 
  Path            lodash
 
  More info       https://nodesecurity.io/advisories/577
 
 
 
found 1 low severity vulnerability in 1 scanned package
  run `npm audit fix` to fix 1 of them.
{% endprism %}
