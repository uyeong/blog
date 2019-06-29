---
title: 실행 취소 / 다시 실행 기능 구현하기(feat. serializr)
description: 실행 취소 / 다시 실행(Undo/Redo) 기능을 어떻게 구현할 수 있는지 자바스크립트 라이브러리 serializr와 함께 단계별로 자세히 설명합니다. 
permalink: create-the-undo-redo-feature
date : 2019-06-29
category:
    - JavaScript
    - Implementation
tags:
    - JavaScript
    - Development
    - Architecture
    - Undo/Redo
---

이 문서는 자바스크립트 라이브러리 [serializr](https://github.com/mobxjs/serializr)를 사용하여 실행 취소 / 다시 실행 구현 방법을 소개한다. 이와 같은 기능을 구현하는 데 있어 적게나마 도움이 되길 바란다.

## 예제 소개

{% codepen "Uyeong Ju|uyeong" RzZBdX default result %}

이해를 돕기 위해 원, 사각형, 삼각형 중 하나를 생성하고, 끌어다 놓거나 삭제할 수 있는 간단한 애플리케이션을 준비했다. 여기에 실행 취소 / 다시 실행 기능을 추가하고자 한다. 하지만 그 전에 애플리케이션의 구조를 모델, 표현(presentation), 이벤트 핸들러로 나눠 간단히 살펴보고 넘어가자.

### 모델

{% figure undo-redo.01.png '모델 구조와 표현 관계' '모델 구조와 표현 관계' %}

모델은 `Shape`와 이를 상속받는 `Circle`, `Square`, `Triangle`이 있고 `Shape`를 관리하는 컬렉션 객체 `Shapes`가 있다. `Shapes`는 `Shape`를 관리할 뿐만 아니라 `Shape`에 대한 상태 변경도 담당한다. 즉, 이벤트 핸들러에서 `Shape`의 상태를 변경하고 싶은 경우 `Shapes`에 위임한다. 

이렇게 작성한 이유는 변경에 대한 통지를 `Shapes`에서 총괄하기 위해서다. 표현은 `Shapes`만 구독하면 되기 때문에 단순하게 구현할 수 있다. 이 방법이 낯설지 모르겠지만 필자는 현 예제 규모에 잘 어울린다고 생각했다.

### 표현

{% prism js %}
import { bind, wire } from 'https://dev.jspm.io/hyperhtml/esm';

... 생략 ...
const graphic = document.querySelector('.graphic');
const render = bind(graphic);
const shapes = new Shapes();

function update() {
  render`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"> 
      ... 생략 ... 
    </svg>
  `;
}

update();
shapes.on(update);
{% endprism %}

이어서 `update()`를 살펴보자. 이 함수는 모델을 토대로 UI를 렌더링하는 즉, 표현을 위한 함수다. 표현에는 [hyperHTML](https://github.com/WebReflection/hyperHTML)을 사용했다. hyperHTML은 Template literal 문법으로 사용할 수 있는 작고 가벼운 가상 돔 라이브러리다. 

먼저 `update()`를 호출해 SVG를 렌더링한다. 그리고 `shapes.on()`에 `update()`를 등록한다. 이로써 모델에 어떠한 변경이 있을 때마다 `update()`가 호출돼 자동으로 UI가 갱신된다.   

### 이벤트 핸들러

{% prism js %}
addCircle.addEventListener('click', create.bind(null, Circle));
addSquare.addEventListener('click', create.bind(null, Square));
addTriangle.addEventListener('click', create.bind(null, Triangle));
remove.addEventListener('click', () => { ... });

// ... 중략 ...

if ('ontouchstart' in document.documentElement) {
  docEl.addEventListener('touchstart', handlePointerStart);
  docEl.addEventListener('touchmove', handlePointerMove);
  docEl.addEventListener('touchend', handlePointerEnd);
} else {
  docEl.addEventListener('mousedown', handlePointerStart);
  docEl.addEventListener('mousemove', handlePointerMove);
  docEl.addEventListener('mouseup', handlePointerEnd);
}
{% endprism %}

마지막으로 이벤트 핸들러를 살펴보자. 이벤트 핸들러는 도형을 추가하거나 삭제하는 버튼과 끌어다 놓을 수 있도록 `documentElement`에 등록하고 구현했다. 

여기에서는 이벤트 핸들러의 구체적인 부분까지 설명하지 않는다. 하지만 다음 절을 원활히 이해하기 위해 이벤트 핸들러를 통해 어떻게 모델을 변경하고 있는지 한번 살펴보길 바란다. 

## 구현하기

실행 취소 / 다시 실행을 구현하는 방법에는 크게 복사본(snapshot)을 저장하는 방식과 명령(command)을 저장하는 방식이 있다. 여기에서는 복사본을 저장하는 방식을 사용한다.

복사본을 저장하는 방식이란 모델의 상태를 JSON이나 플레인 자바스크립트 객체 형태로 저장해 두었다가 필요할 때 되돌리는 방법을 말한다. 이때 모델을 JSON이나 플레인 자바스크립트 객체 형태로 변환하는 과정을 직렬화(serialize)라고 하며, 복사본을 다시 본래의 모델로 되돌리는 것을 역직렬화(deserialize)라고 한다.

### serializr 소개

모델(객체)의 상태를 직렬화 또는 역직렬화 하기 위해선 추가적인 작업이 필요하다. 예를 들어 객체에 `toJSON()`을 추가하고 객체 관계를 순회하여 플레인 자바스크립트 객체를 만들 수 있다. 그리고 생성한 플레인 자바스크립트 객체를 다시 순회하면서 적절한 생성자를 찾아 본래의 모델로 되돌릴 수 있다. 

글로 설명하면 단순하지만 사실 꽤 따분한 작업이다. 또, 협업 개발자 모두가 이해할 수 있는 적절한 구조를 설계하기도 쉽지 않다. 

이 역할을 충실히 수행하는 자바스크립트 라이브러리가 바로 [serializr](https://github.com/mobxjs/serializr)다. serializr는 [Mobx](https://github.com/mobxjs/mobx)의 서드 파티 라이브러리지만 그렇다고 Mobx를 의존하진 않는다. 따라서 다른 환경에서도 무리 없이 사용할 수 있다.

### 모델 수정

그럼 모델을 serialzr를 이용해 직렬화 가능하게 수정해보자.

{% prism js %}
import serializr from 'https://dev.jspm.io/serializr';
const { createModelSchema, serialize, deserialize, primitive, list } = serializr;
{% endprism %}

먼저 serializr를 불러오고 구현에 사용할 함수를 몇 개 추린다.

{% prism js %}
class Shape {
  constructor(data = { }) {
    ... 생략 ...
    this.posX = posX;
    this.posY = posY;
    this.tempX = undefined;
    this.tempY = undefined;
    this.fill = fill;
    this.selected = selected;
  }
  ... 생략 ...
}
{% endprism %}

`Shape`는 `posX`, `posY`, `tempX`, `tempY`, `fill`, `selected` 속성을 가지고 있다. 이때 직렬화가 필요한 속성은 `posX`, `posY`, `fill`, `selected`다. `tempX`, `tempY`는 도형에 끄는 동안에 사용할 임시 값으로 실행 취소 / 다시 실행을 위해 따로 복사하지 않는다.

{% prism js %}
createModelSchema(Shape, {
  posX: primitive(),
  posY: primitive(),
  fill: primitive(),
  selected: primitive(),
});
{% endprism %}

직렬화할 속성을 정했으면 serializr의 `createModelSchema()`를 사용해서 스키마를 정의한다. 이렇게 정의한 스키마는 추후 직렬화 시 사용된다. 

{% alert info '스키마를 정의하는 법' %}
여기에서는 `createModelSchema()`를 사용하지만, decorator를 이용해 보다 깔끔하게 스키마를 정의할 수도 있다. 자세한 내용은 serializr 저장소를 참고한다.
{% endalert %}

{% prism js %}
createModelSchema(Circle, {
  cx: primitive(),
  cy: primitive(),
  r: primitive(),
});

createModelSchema(Square, {
  x: primitive(),
  y: primitive(),
  width: primitive(),
  height: primitive(),
});

createModelSchema(Triangle, {
  points: list(list(primitive())),
});
{% endprism %}

이어서 `Shape`와 같은 방법으로 `Circle`, `Square`, `Triangle`에 대한 스키마를 정의한다. 그리고 `Shapes`에 객체의 상태를 복사할 수 있는 메서드와 복사본을 다시 되돌릴 수 있는 메서드를 추가한다.

{% prism js %}
class Shapes {
  ... 생략 ...
  snapshot() {
    return serialize(this._shapes);
  }

  restore(dump) {
    this._shapes = dump.map(data => {
    	const Shape = ???; /* 생성자를 알 수 없다 */
    	deserialize(Shape, data)
    });
    this.emit();
  }
}
{% endprism %}

`Shapes`에 `snapshot()`과 `restore()`를 추가했다. 각 메서드에서 사용하는 `serialize()`와 `deserialize()`는 serializr에서 제공하는 함수다.

`snapshot()`은 간단하다. `_shapes`를 `serialize()`에 전달하기만 하면 된다. 그러면 serializr는 앞서 정의한 스키마를 이용해 플레인 자바스크립트 객체를 반환할 것이다.

하지만 `restore()`는 그렇지 않다. `deserialize()`의 첫 번째 인자로는 역직렬화 할 객체 생성자, 두 번째 인자엔 되돌릴 객체 상태를 전달해야 하는데 복사본만으로는 연관된 생성자를 알 수 없다. 이 문제를 해결하기 위해서 모델을 다음과 같이 수정한다.

{% prism js %}
const ShapeType = { 
  Circle: 0, 
  Square: 1, 
  Triangle: 2 
};
{% endprism %}

우선 enum으로 사용할 `ShapeType` 객체를 추가한다. `ShapeType`은 `Circle`, `Square`, `Triangle`을 식별할 수 있는 값을 정수로 갖는다.

{% prism js %}
class Shape {
  constructor(data = { }) {
    ...
    this.shapeType = undefined;
  }
  ...
}

Shape.shapeType = undefined;

class Circle extends Shape {
  constructor(data = { }) {
  	...
    this.shapeType = ShapeType.Circle;
  }
}

Circle.shapeType = ShapeType.Circle;

class Square extends Shape {
  constructor(data = { }) {
  	...
    this.shapeType = ShapeType.Square;
  }
}

Square.shapeType = ShapeType.Square;

class Triangle extends Shape {
  constructor(data = { }) {
    ...
    this.shapeType = ShapeType.Triangle;
  }
}

Triangle.shapeType = ShapeType.Triangle;
{% endprism %}

이어서 각 모델에 `shapeType` 속성을 추가하고 연관된 `ShapeType`을 대입한다. 이제 추가한 속성을 이용하면 연관된 생성자를 알 수 있다.

{% prism js %}
function getShapeClass(shapeType) {
  return [ Circle, Square, Triangle ].find(C => C.shapeType === shapeType);
}
{% endprism %}

`getShapeClass()`은 `shapeType` 인자를 이용해 해당하는 생성자를 반환한다. 이 함수를 사용해 `Shapes`의 `restore()`를 다음과 같이 수정한다.

{% prism js %}
class Shapes {
  ...
  snapshot() {
    return serialize(this._shapes);
  }

  restore(snapshot) {
    this._shapes = snapshot.map(d => deserialize(getShapeClass(d.shapeType), d));
    this.emit();
  }
}
{% endprism %}

필요한 모델 수정은 모두 끝났다. 다음으로 실행 취소 / 다시 실행의 상태를 보관할 `History` 객체를 작성해보자.

### History 작성

{% prism js %}
class History {
  constructor(shapes) {
    this._undoStack = [];
    this._redoStack = [];
    this._shapes = shapes;
  }

  take() {
    const snapshot = this._shapes.snapshot();
    this._undoStack.push(snapshot);
    this._redoStack = [];
  }

  undo() {
    if (this._undoStack.length > 0) {
      const dump = this._undoStack.pop();
      const snapshot = this._shapes.snapshot();
      this._redoStack.push(snapshot);
      this._shapes.restore(dump);
    }
  }

  redo() {
    if (this._redoStack.length > 0) {
      const dump = this._redoStack.pop();
      const snapshot = this._shapes.snapshot();
      this._undoStack.push(snapshot);
      this._shapes.restore(dump);
    }
  }
}
{% endprism %}

`History`는 실행 취소 / 다시 실행 시 필요한 상태를 관리하고 실행하는 역할을 한다. 

`take()`는 `shapes`를 통해 현재 상태를 가져와 실행 취소 스택에 추가하고 다시 실행 스택을 비운다. 이 메서드는 모델의 상태가 변경되기 직전에 호출돼야 한다. 

`undo()`는 실행 취소 스택에서 전 상태를 하나 꺼내오는 동시에 `shapes`에서 현재 상태를 가져온다. 그리고 다시 실행 스택에 현재 상태를 추가하고 `shapes.restore()`에 전 상태를 전달해 상태를 되돌린다.

`redo()`는 다시 실행 스택에서 앞 상태를 하나 꺼내오는 동시에 `shapes`에서 현재 상태를 가져온다. 그리고 실행 취소 스택에 현재 상태를 추가하고 `shapes.restore()`에 앞 상태를 전달해 상태를 되돌린다.

{% alert info '메멘토 패턴' %}
<figure title="메멘토 패턴">
  <a href="/images/2019/create-the-undo-redo-feature/undo-redo.02.png" target="_blank">
    <img 
      src="/images/2019/create-the-undo-redo-feature/undo-redo.02.png" 
      alt="메멘토 패턴" 
      style=""
    >
  </a>
</figure>

이미 눈치챈 사람도 있겠지만 이것은 메멘토 패턴이다. 메멘토 패턴은 `Originator`에서 `Memento`(상태)를 가져와 `Cretaker`에 저장하고 추후 다시 꺼내 `Originator`에 전달하여 상태를 되돌리는 패턴을 말한다([참고](https://ko.wikipedia.org/wiki/%EB%A9%94%EB%A9%98%ED%86%A0_%ED%8C%A8%ED%84%B4)).
{% endalert %}

이것으로 실행 취소 / 다시 실행을 위한 모든 준비를 마쳤다. 이제 각 이벤트 핸들러에서 필요에 따라 `History` 객체를 호출해주면 된다.
 
### 이벤트 핸들러 수정

{% prism js %}
const shapes = new Shapes();
const history = new History(shapes);
{% endprism %}

먼저 `shapes`를 생성한 후 이를 주입해 `history`를 생성한다.

{% prism js %}
function create(Shape) {
  history.take(); // 추가
  const shape = new Shape({ 
    posX: random(0, 80), 
    posY: random(0, 80) 
  });
  shapes.add(shape);
  shapes.selectOne(shape);
}
{% endprism %}

이어서 도형 생성 시 호출되는 `create()`를 살펴보자. 새로운 도형을 생성하기 전에 `history.take()`를 호출하여 현재 상태를 저장하도록 수정한다.

{% prism js %}
remove.addEventListener('click', () => {
  const shape = shapes.getSelected();
  if (shape) {
    history.take(); // 추가
    shapes.remove(shape);
  }
});
{% endprism %} 

삭제도 마찬가지로 도형을 삭제하기 전 `history.take()`를 호출하여 현재 상태를 저장하도록 수정한다.

{% prism js %}
function handlePointerEnd() {
  if (dragging && shape) {
    // 추가
    if (shape.tempX !== undefined) {
      history.take();      
    }
    shapes.arrive(shape);
    dragging = false;
    shape = undefined;
  }
}
{% endprism %}

`handlePointerEnd()`는 도형을 끌어다 놓는 시점(`mouseup` 또는 `touchend`)에 호출되는 이벤트 핸들러다. `shape`에 저장된 임시 위칫값이 적용되기 전에 `history.take()`를 호출하여 현재 상태를 저장하도록 수정한다. 

만약 도형을 끄는 시점(`mousemove` 또는 `touchmove`)에 `posX`, `posY`의 값을 수정하면 `history.take()`를 호출할 때 이미 값이 변경돼 전 상태를 보관할 수 없다. 이것이 `tempX`, `tempY`를 사용하는 이유다.

{% prism js %}
undo.addEventListener('click', () => history.undo());
redo.addEventListener('click', () => history.redo());
{% endprism %}

마지막으로 실행 취소 / 다시 실행 버튼을 추가하고 각 이벤트 핸들러에 `history`의 `undo()`, `redo()`가 호출되도록 작성한다. 

### 결과

처음에 소개한 예제를 기반으로 차근차근 코드를 수정했다면 다음과 같이 실행 취소 / 다시 실행 기능이 적용된 애플리케이션이 완성될 것이다.

{% codepen "Uyeong Ju|uyeong" VJMOxp default result %}


## 끝으로

여기까지 `serializr`를 활용해 손쉽게 실행 취소 / 다시 실행을 구현해봤다. 물론 이 방식을 실제 제품에 사용하기 위해선 다양한 측면에서의 테스트가 필요할 것이다. 하지만 원리 자체에 큰 차이가 없으므로 기능을 구현하는 데 있어 도움이 될 것으로 생각한다.
