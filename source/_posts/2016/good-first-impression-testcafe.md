---
title: 첫 인상이 좋은 E2E 테스트 프레임워크, TestCafe
description: E2E 테스트 프레임워크의 한 종류인 TestCafe를 소개하고 사용 방법과 또 다른 E2E 테스트 프레임워크인 나이트왓치와의 차이점을 간략하게 살펴본다.
date : 2016-10-31
category:
    - JavaScript
    - Test
tags:
    - Test
    - E2E
    - E2E Test
    - TestCafe
---

인생을 살다 보면 괴롭지만 꼭 해야만 하는 일을 만나게 된다. 프런트엔드개발자에겐 그런 일 중 하나가 바로 UI 테스트가 아닐까 싶은데, 이 고통스러운 일을 조금이나마 덜어줄 잘 만들어진 도구나 프레임워크를 찾지만 쉽지 않다. 처음엔 좋아 보여도 실제 테스트를 작성하다 보면 금세 그 도구가 가진 한계점을 만나게 된다. 그래서 그런지 다른 일보다도 더욱 도구에 의존하게 되고 개선된 또 다른 도구를 찾게 되는 것 같다.

[TestCafe](http://devexpress.github.io/testcafe/)는 자바스크립트 소식을 매주 정리해 공유하는 사이트인 [JSer.info](https://jser.info)의 [2016년 10월 24일 자 소식](https://jser.info/2016/10/24/npm-4.0.0-node.js-v6.9.0-lts-webpack2/)을 통해 알게 됐다. 해당 문서에 링크된 [TestCafe로 브라우저 자동 테스트(일본어)](http://efcl.info/2016/10/23/testcafe/)를 읽어보았는데 생각보다 느낌이 좋아서 한번 리뷰해보자는 결론을 내렸다.

## TestCafe 소개

TestCafe는 [DevExpress](https://www.devexpress.com/)가 개발한 E2E 테스트 프레임워크다. InfoQ에 TestCafe와 관련된 인터뷰 글([TestCafe with Smart Script Injection, Traffic and Markup Analysis Tools](https://www.infoq.com/news/2013/08/testcafe))이 있으니 관심 있는 사람은 참고하길 바란다. 같은 이름의 [웹 서비스 및 클라이언트 앱](https://testcafe.devexpress.com/)도 서비스 중인데 이 서비스는 셀레니움 IDE 처럼 GUI로 조작하고 행위를 기록하여 재생할 수 있다.

TestCafe는 [webdriber.io](http://webdriver.io/)나 [나이트왓치](http://nightwatchjs.org/)와는 다르게 테스트 관련 스크립트를 주입해 동작하는 셀레니움 RC(Selenium RC)와 흡사한 방식으로 개발됐다. 사실 셀레니움 RC가 가진 한계를 극복하고자 셀레니움 웹드라이버(Selenium WebDriver)를 개발했는데 다시 셀레니움 RC와 비슷한 구조로 테스트 프레임워크를 만들었다고 해서 "그렇다면 과거에 경험했던 한계를 그대로 답습하는 게 아닌가?"하고 조금 의아했다. 

TestCafe의 개발자 [이반 니쿨린(Ivan Nikulin)](https://github.com/inikulin)은 [Why not use Selenium?](https://testcafe-discuss.devexpress.com/t/why-not-use-selenium/47)에서 그 이유를 밝혔는데 간단히 말해서 테스트 환경에 대한 복잡한 설정 없이 실행할 수 있고, 모바일 기기에서도 원격 접속해 테스트할 수 있는 도구를 만들고 싶어 했던 거 같다. 또, 웹드라이버의 호환성 문제를 회피하기 위한 목적도 있는 것 같다.

셀레니움은 분명 훌륭한 도구지만 설정이 복잡하고 웹드라이버 자체의 버그로 인해 테스트 작성에 종종 걸림돌이 되는 경우가 있다. 또 테스트 코드 자체를 디버깅하기가 까다로워 복잡한 테스트 케이스를 작성하는데 어려운 면도 가지고 있다. 과거 셀레니움 RC 방식에 한계가 있어 셀레니움을 만들었지만 새로운 문제들이 나타났다. 이러한 상황에서 TestCafe의 지향점이 좋은 해결책이 될 수 있을까?

## 좋은 인상

필자는 유료 웹툰을 서비스하고 있는 [레진(Lezhin)](http://www.lezhin.com)을 이용해 로그인 테스트를 작성해 봤다. 예제 코드는 저장소 [UYEONG/demo-testcafe](https://github.com/UYEONG/demo-testcafe)를 참고한다. 이번 절에서는 이 예제를 이용해 필자가 받은 몇 가지 좋은 인상을 소개하겠다.

{% codeblock lang:js %}
test('사용자는 GNB 메뉴에서 로그인할 수 있다.', async (t) => {
    // Given
    const popupAttendanceLogin = new PopupAttendanceLogin(t);

    if (await popupAttendanceLogin.exist()) {
        await popupAttendanceLogin.close();
    }

    await t
        .click('#main-menu-toggle')
        .typeText('#login-email', ACCOUNT.USER_NAME)
        .typeText('#login-password', ACCOUNT.PASSWORD);

    // When
    await t
        .click('form.login-form button[type=submit]')
        .wait(1000);

    // Then
    await t.click('#main-menu-toggle');

    const email = await getElement('sidenav-email');

    assert(email.visible);
    assert(email.innerText === ACCOUNT.USER_NAME);
});
{% endcodeblock %}

위는 레진에서 GNB 메뉴를 이용해 로그인이 정상적으로 이뤄지는지 테스트하는 코드다. 그리고 이 코드는 `await/async`를 이용해 비동기적 절차를 동기적으로 표현하고 있다. TestCafe는 바벨(Babel)을 내장하고 있어 별도의 설정 없이 최신 사양을 이용할 수 있다. 최신 사양으로 코드를 작성하고자 할 때 복잡한 세팅을 해줘야 하는 기존의 테스트 프레임워크와는 다른 부분이다. 

{% figure testcafe.01.gif 'TestCafe에서 디버깅하기' '그림 1. TestCafe에서 디버깅하기' %}

또, `await/async` 방식으로 테스트 코드를 작성하면 디버깅이 쉽다는 장점이 있는데 체이닝을 펼치기 쉬우므로 각 액션을 단계별로 관찰할 수 있다. 나이트왓치는 파이프라인 방식으로 디자인돼 있어 디버깅이 다소 까다롭다.

그럼 이제 실행을 해보자. 해당 저장소를 클론하고 다음 명령어를 입력하면 바로 테스트할 수 있다.

{% codeblock lang:bash %}
$ git clone git@github.com:UYEONG/demo-testcafe.git
$ npm install
$ npm run test
{% endcodeblock %}

`npm scripts`에 등록한 `test` 명령은 다음과 같다. 

{% codeblock lang:bash %}
$ testcafe chrome tests/
{% endcodeblock %}

뭔가 추가적인 설정이 없으니 오히려 불안하다. 하지만 그 안락함에 금방 익숙해진다. 이것저것 세팅해줘야 했던 셀레니움 기반 프레임워크([참고](http://blog.coderifleman.com/2016/06/17/e2e-test-and-nightwatch/#%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0))와는 사뭇 다른 경험이다.

{% figure testcafe.02.gif '로그인 테스트 실행 결과' '그림 2. 로그인 테스트 실행 결과' %}

그림 2는 로그인 테스트가 진행되는 모습이다. 이 테스트의 진행 절차는 다음과 같다.

 1. www.lezhin.com 페이지에 접근한다. 
 2. 최초에 출력된 팝업이 있다면 닫는다.
 3. 우측 상단의 메뉴 버튼을 클릭한다.
 4. 이메일 / 패스워드를 입력하고 로그인 버튼을 선택한다.
 5. 페이지가 갱신되면 다시 우측 상단의 메뉴 버튼을 클릭한다.
 6. 로그인이 정상적으로 완료 됐는지 확인한다.
 
특정 절차에서 다음 절차로 넘어가기 위해선 지연 시간(Delay time)이 필요하다. 예를 들어 최초 페이지에 접근할 때는 콘텐츠가 모두 출력되는 시점을 기다려야 하고 팝업을 닫을 때는 애니메이션(FadeOut)이 종료되는 시간을 기다려야 한다. 나이트왓치에서는 이런 지연 시간을 직접 명시해줘야 한다.

{% codeblock lang:js %}
// 페이지에 최초 접근 시 body 엘리먼트가 보일 때까지 5000ms 기다린다.
this._header
    .navigate()
    .waitForElementVisible('body', 5000);
    
// 팝업을 닫을때 애니메이션 시간을 고려해 500ms 기다린다.
this.click('@close');
this.api.pause(500);
{% endcodeblock %}

하지만 TestCafe를 이용할 땐 지연 시간을 직접 입력할 일이 상대적으로 적다. TestCafe는 지연 시간을 직접 계산하고 관리한다. 실제로 위 로그인 테스트 코드를 보면 지연 시간을 명시한 지점은 로그인 버튼을 클릭한 시점 즉, 폼을 서브밋하고 갱신되기를 기다리는 딱 한 곳뿐이다.

{% codeblock lang:js %}
await t
    .click('form.login-form button[type=submit]')
    .wait(1000);
{% endcodeblock %}

지연 시간이라고 해도 거의 대충 시간을 짐작해 입력하는 일에 불과하다. 물론 비기능적 요구사항도 테스트에 포함돼야 하지만 애니메이션 종료 시점까지 일일이 명시해야 한다는 것은 분명 귀찮은 일이다. 

그리고 이벤트 지점을 커서로 표현해주거나 실제 타이핑을 하는 느낌을 살려 텍스트를 입력하는 부분도 인상적이다. 셀레니움 기반 테스트 프레임워크는 이런 자연스러운 느낌이 상대적으로 적다.

{% figure testcafe.03.png 'TestCafe의 에러 리포팅' '그림 3. TestCafe의 에러 리포팅' %}

마지막으로 에러 리포팅도 상당히 깔끔한 편인데 어느 지점에서 어떠한 에러가 낫는지 알기 쉽게 출력해준다. 그림 3을 보면 24번째 행의 코드에 문제가 있음을 쉽게 알 수 있다.

구구절절 설명했지만 TestCafe를 리뷰하면서 좋은 인상을 받은 점을 간단히 정리하면 다음과 같다.

 * 바벨을 내장하고 있어서 특별한 설정 없이 ES6+ 사양을 사용할 수 있다.
 * 테스트 코드 디버깅이 상대적으로 쉽다.
 * 특별한 설정 없이 커멘드 라인 명령으로 바로 테스트할 수 있다.
 * 특정 조작에 대한 지연 시간을 자동으로 관리한다.
 * 테스트 실패 및 에러 리포팅이 깔끔한 편이다.

## 아쉬운 점

분명 기존의 E2E 테스트 프레임워크보다 몇 가지 좋은 인상을 가지고 있는건 분명하다. 하지만 아쉬운 점도 있다. 일단 다양한 상황을 테스트하기엔 액션 셋과 API가 부족하다. 

{% figure testcafe.04.png 'TestCafe와 그 외 프레임워크의 API 목록' '그림 4. TestCafe와 그 외 프레임워크의 API 목록' %}

왼쪽 부터 차례대로 TestCafe, 나이트왓치, webdriver.io 가 제공하고 있는 액션 및 API 목록이다. 기본적인 액션은 제공하지만, 모바일에 특화된 액션이나 스크립트 권한 밖의 액션 등은 이용하기 힘들다. 시간이 지나면서 제공될 수 있는 API도 있지만 TestCafe가 가지고 있는 구조적 한계로 인해 아예 불가능한 API도 있다.
 
또, E2E 테스트를 할 때 좋은 패턴들이 있는데 그중 하나가 `PageObject`다. 테스트에 필요한 반복적인 행위나 엘리먼트 셀렉터 등을 밖으로 노출 시키지 않고 페이지 단위(혹은 컴포넌트 단위)로 추상화해 제공할 수 있다([참고](http://nightwatchjs.org/guide#page-objects)). `PageObject`는 테스트 코드의 가독성이나 유지 보수 측면에서 훌륭한 패턴이지만 TestCafe에서는 제공하지 않는다. 

{% codeblock lang:js %}
// page-objects/popup-attendance-login.js
import {Selector} from 'testcafe';
 
const querySelector = Selector(q => document.querySelector(q));
 
class PopupAttendanceLogin {
    elements = {
        wrapper: '#popup-attendance-login',
        closeBtn: '#popup-attendance-login .attlogin__close'
    };

    constructor(testController) {
        this.t = testController;
    }

    async exist() {
        const wrapper = await querySelector(this.elements.wrapper);
        return wrapper.visible;
    }

    async close() {
        const closeBtn = await querySelector(this.elements.closeBtn);
        await this.t.click(closeBtn);
    }
}
 
export default PopupAttendanceLogin;

// tests/signin-test.js
import PopupAttendanceLogin from '../page-objects/popup-attendance-login';

test('사용자는 GNB 메뉴에서 로그인할 수 있다.', async (t) => {
    // Given
    const popupAttendanceLogin = new PopupAttendanceLogin(t);

    if (await popupAttendanceLogin.exist()) {
        await popupAttendanceLogin.close();
    }
    // ... 생략 ...
{% endcodeblock %}

그래서 필자는 위 코드처럼 직접 `PageObject`와 비슷한 객체를 직접 만들고 테스트 코드를 작성했다. 만약 프레임워크 자체에서 이 개념을 제공한다면 조금 더 편리하게 코드를 작성할 수 있을 것 같다.

## 끝으로

여기까지 TestCafe를 소개하고 필자가 느낀 좋은 인상과 아쉬운 점을 함께 이야기했다. 이 도구가 우리의 UI 테스트 환경의 답이 돼 줄 것이라 생각하지 않는다. 분명 실제로 테스트를 작성하기 시작하면 온갖 버그와 미흡한 점을 만나게 될 것이다. 하지만 아직 시작된 지 얼마 안 된 프로젝트라는 점을 미루어 볼 때 차차 개선될 것이라고 긍정적으로 생각할 수 있다. 

중요한 건 그들이 어떤 문제를 해결하고 싶어 하고 어디에 지향점을 두고 있느냐다. 그것이 내 앞에 놓인 문제 혹은 환경과 맞아떨어진다면 더할 나위 없는 좋은 도구가 될 것이다.
