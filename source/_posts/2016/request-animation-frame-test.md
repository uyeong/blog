---
title: "requestAnimationFrame을 어떻게 테스트 할 수 있을까?"
description: "requestAnimationFrame을 사용해 작성한 코드를 어떻게 유닛 테스트(Unit Test)할 수 있는지 단계별로 자세히 소개합니다."
date : 2016-12-02
category:
    - JavaScript
    - Animation
tags:
    - JavaScript
    - Animation
    - requestAnimationFrame
    - Test
    - UnitTest
---

얼마전에 기능 개발을 하다가 애니메이션을 다룰 일이 생겼다. 처음엔 CSS를 이용했지만, IE8을 지원하고자 "[raf](https://github.com/chrisdickinson/raf)"라는 폴리필 라이브러리를 이용해 `requestAnimationFrame`(이하 raf)으로 개발했다. raf의 대략적인 형태는 다음과 같다(API의 자세한 설명은 [MDN의 window.requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)을 참고).

{% prism js "
var start = null;

function step(timestamp) {
  if (!start) {
    start = timestamp;
  }

  var progress = timestamp - start;

  // Use progress to do something.

  if (progress < 1500) {
    window.requestAnimationFrame(step);
  }
}

window.requestAnimationFrame(step);
" %}

코드를 보면 알겠지만 그렇게 직관적인 편은 아니다. raf를 쓸 때마다 이런 식으로 코드를 작성하긴 싫었다. 그래서 사용하기 편하게 raf를 랩핑한 객체 하나를 만들었다(여기서 시작한 작은 프로젝트가 있다 - [StepperJS](https://github.com/UYEONG/stepperjs)).

{% prism js "
class Stepper {
  start(options) {
    const {
      duration = 0,
      easing = linear, // is easing function.
      step = () => {}
    } = options;

    let startTime = 0;

    const stepping = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const pastTime = timestamp - startTime;
      const progress = pastTime / duration;

      if (pastTime >= duration) {
        step(1);
        return;
      }

      step(easing(progress));

      window.requestAnimationFrame(stepping);
    };

    window.requestAnimationFrame(stepping);
  }
}
" %}

이렇게 작성한 Stepper 객체는 다음과 같이 사용할 수 있다.

{% prism js "
const stepper = new Stepper();

stepper.start({
  duration: 1500,
  step: (n) => {
    element.style.left = `${150 * n}px`
  }
});
" %}

{% codepen "Uyeong Ju|uyeong" yVpNLo default result %}

개인적으로 생각했을 때 raf를 곧바로 사용하는 것보다 더 직관적이고 편해 보인다(물론 다른 의견을 가진 사람이 있을 수도 있다). 이제 Stepper 객체를 어떻게 테스트할 수 있을지 살펴보자.

Stepper는 지정한 `duration`과 `easing`에 따라 현재 시점에 해당하는 n 즉, progress 값을 콜백 함수에 전달하는 단순한 역할을 담당한다. 그렇다면 다음과 같이 테스트 케이스를 작성할 수 있을 것 같다.

 > should call step callback with the current progress by duration and easing.

음, 확실히 유닛 테스트로써는 손색없지만 필자는 사용자 관점에서 서술하는 걸 좋아하니 이렇게 고쳐보자.

 > The user should be able to know the current progress through the start method of Stepper

이를 어떻게 검증할 수 있을까? 필요한 값을 설정하고 start 메서드를 호출한 후 특정 시간으로 옮긴(tick) 다음 "n"이 기대하는 값과 일치하는지 확인하면 될 것 같다. 한번 테스트 코드로 옮겨보자.

{% prism js "
test('The user should be able to know the current progress through the start method of Stepper', (assert) => {
  // Given
  const stepper = new Stepper();
  const duration = 300;
  const easing = linear;
  let progress;
  
  // When
  stepper.start({
    duration,
    easing,
    step: (n) => progress = n
  });
  
  // Then
  assert(progress === ???);
});
" %}

다른 조건들은 어려울 게 없지만, 특정 시간으로 옮기는 행위는 그렇지 않다. 함수를 호출하는 순간 시간은 흘러 버리므로 특정 시간에 해당하는 progress 값을 비교할 수 없다.

이처럼 테스트 환경에서 시간을 조작하고 싶을 때 사용할 수 있는 테스트 더블 라이브러리가 있다. 바로 "[sinon](http://sinonjs.org/docs/)"이다. [sinon의 FakeTimer](http://sinonjs.org/docs/#clock)는 `setTimeout`과 `Date` 객체 등을 덮어써서 동기적으로 시간을 조작할 수 있는 수단을 제공한다. 이것을 사용해보자.

{% prism js "
const clock = sinon.useFakeTimers();

test('The user should be able to know the current progress through the start method of Stepper', (assert) => {
    // Given
    const stepper = new Stepper();
    const duration = 300;
    const easing = linear;
    const step = sinon.spy();

    // When
    stepper.start({
        duration,
        easing,
        step
    });

    clock.tick(0);
    clock.tick(250);

    // Then
    assert(step.args[1][0].toFixed(2) === linear(250 / 300).toFixed(2));
});
" %}

{% codepen "Uyeong Ju|uyeong" PbEaMp default result %}

당연한 얘기겠지만 `TypeError`가 발생한다. raf는 시간이 아닌 `repaint` 시점을 기준으로 호출되며 독자적으로 타임스템프를 계산해 콜백에 전달하므로 sinon의 FakeTimer로 조작할 수 없다. 따라서 동기적으로 호출한 `args` 프로퍼티에 쌓인 값이 없으므로 에러가 발생하는 것이다.

그렇다면 어떻게 해야 할까. 고맙게도 누군가 raf를 Stub한 "[raf-stub](https://github.com/alexreardon/raf-stub)"을 개발해 배포해놨다. 이 Stub을 사용해 테스트를 다시 작성해보자.

{% prism js "
const stub = createStub();

sinon.stub(window, 'requestAnimationFrame', stub.add);

test('The user should be able to know the current progress through the start method of Stepper', (assert) => {
    // Given
    const stepper = new Stepper();
    const duration = 300;
    const easing = linear;
    const step = sinon.spy();

    // When
    stepper.start({
        duration,
        easing,
        step
    });

    stub.step(1, 0);
    stub.step(1, 250);

    // Then
    assert(step.args[1][0].toFixed(2) === linear(250 / 300).toFixed(2));
});
" %}

{% codepen "Uyeong Ju|uyeong" LbeJZz default result %}

테스트가 통과한다. raf를 사용해 작성한 코드를 테스트하려고 할 때 다소 막막할 수 있다. 하지만 sinon과 Stub을 적절히 사용한다면 손쉽게 테스트할 수 있다.

여기까지 raf를 테스트하는 방법을 소개했다. 비슷한 고민을 하는 사람에게 작은 팁으로나마 도움이 되길 바라며 예제 코드는 [UYEONG/request-animation-frame-test](https://github.com/UYEONG/request-animation-frame-test)에 올려놓았으니 참고하길 바란다.
