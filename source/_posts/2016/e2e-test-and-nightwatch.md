---
title: E2E 테스트와 나이트왓치
description: E2E의 정의와 E2E 테스트 프레임워크의 역사 그리고 나이트왓치를 소개하며 설치하는 방법과 사용하는 방법까지 폭 넓게 설명합니다.
date : 2016-06-17
category:
    - Test
tags:
    - Test
    - E2E
    - E2E Test
    - Nightwatch
---

나이트왓치를 소개하기 전에 E2E 테스트의 정의부터 셀레니움 웹드라이버 등 기본 개념부터 간단히 소개하겠다.

## E2E 테스트

### 정의

소프트웨어 테스트는 [테스트의 규모(레벨)](https://en.wikipedia.org/wiki/Software_testing##Testing_levels)에 따라 유닛 테스트, 통합 테스트, 시스템 테스트, 인수 테스트 이렇게 4가지로 분류한다. 여기에서 E2E 테스트는 시스템 테스트에 속한다. 

E2E(End-to-End) 테스트는 전체 시스템이 제대로 작동하는지 확인 하기 위한 테스트로 시나리오 테스트, 기능 테스트, 통합 테스트, GUI 테스트를 하는데 사용한다. API와의 연동도 테스트 항목에 포함되기 때문에 일반적으로 목(Mock)이나 스텁(Stub)과 같은 테스트 더블을 사용하지 않으며 최대한 실제 시스템을 사용하는 사용자 관점에서 시뮬레이션 한다. 그래서 테스트 속도가 서비스 규모에 따라 상당히 느릴 수 있기 때문에 유닛 테스트나 기능 테스트를 위한 일반적인 테스트 자동화와 시스템 테스트를 위한 E2E 테스트 자동화를 함께 구성한다.

### E2E 테스트 프레임워크

E2E 테스트 프레임워크는 다양한 종류가 있는데, 크게 헤드리스 브라우저를 의존하는 것과 셀레니움 웹드라이버를 의존하는 것으로 나눌 수 있다. 셀레니움 웹드라이버는 다음 절에서 자세히 설명한다.

헤드리스 브라우저는 커맨드 라인 명령어로 조작할 수 있는 화면이 없는 브라우저로 Jsdom 기반의 좀비(Zombie.js), 웹킷 엔진 기반의 팬텀(Pantom.js), 겟코 엔진 기반의 슬리머(Slimer.js) 등이 있다. 잘 알려진 캐스퍼(Casper.js)는 팬텀과 슬리머를 조금 더 사용하기 쉽게 만들어 놓은 유틸리티 도구다. 헤드리스 브라우저는 기본적으로 크로스 브라우징 테스트가 불가능하며 어썰트(Assert)도 내장하고 있지 않기 때문에 필요하다면 추가를 해야한다.

셀레니움 웹드라이버를 의존하는 프레임워크로는 [webdriver.io](http://webdriver.io/), [큐컴버(Cucumber.js)](https://github.com/cucumber/cucumber-js), [프로트랙터](https://github.com/angular/protractor), [나이트왓치](nightwatchjs.org) 등이 있다. 이들은 크로스 브라우징 테스트가 가능하고 어썰트도 내장하고 있다. 단, 각 프레임워크 마다 내장하고 있는 어썰트 라이브러리는 다르다.

### 셀레니움 웹드라이버

나이트왓치는 셀레니움 웹드라이버(Selenium WebDriver) API를 사용해 개발된 E2E 테스트 프레임워크이기 때문에 본격적으로 사용해보기 전에 셀레니움과 웹드라이버를 먼저 이해할 필요가 있다.

셀레니움 웹드라이버의 원래 이름은 셀레니움(또는 셀레니움 1.0)이었다. 셀레니움은 웹 브라우저를 사용하여 웹 애플리케이션을 테스트하는 오픈 소스 도구다. 이때 사람의 손으로 직접 웹 브라우저를 조작하는 것이 아니라 작성된 스크립트에 따라 자동으로 조작한다. 이러한 방법을 브라우저 자동화(Browser Automation)라고 표현한다.

셀레니움은 시카고에 위치한 [소트워크스(ThoughtWorks)](https://www.thoughtworks.com) 사에서 개발을 시작했다. 소트워크스는 마틴 파울러(Martin Fowler)가 속한 그룹으로 유명하다.

웹드라이버는 셀레니움의 단점을 보완하고자 구글의 엔지니어들이 개발하고 사용한 브라우저 자동 테스트 도구이다. 2006년 경 구글에서 근무 중이던 [시몬 스튜어트(Simon Stewart)](https://www.linkedin.com/in/sistewart)가 주도해 프로젝트를 시작하고 2009년에 처음으로 공식 발표했다.

{% figure e2e_and_nightwatch.01.png 'Selenium Projects' '그림 1. 셀레니움 프로젝트의 흐름' %}

과거 셀레니움은 자체 엔진인 셀레니움 RC(Remote Control)를 이용해 브라우저와 통신했다.

셀레니움 RC는 자바나 파이썬 등의 언어로 스크립트를 작성하면 그 스크립트를 기반으로 브라우저를 조작하는 자바스크립트를 생성하고 해당 페이지에 삽입 후 브라우저를 조작하는 간단한 구조였다. 이러한 구조는 브라우저의 보안 제약이나 자바스크립트의 한계로 인해 실효성이 떨어지는 단점이 있었다. 이 단점이 시몬 스튜어트가 웹드라이버를 만들게 된 이유이기도 하다.

그에 반해 웹드라이버는 브라우저의 확장 기능과 OS의 기본 기능 등을 이용하여 브라우저를 조작하는 구조였다. 이는 셀레니움 RC의 단점을 충족해줄 수 있는 방식이었다.

{% figure e2e_and_nightwatch.02.png 'Selenium webdriver high level block diagram' '그림 1. 셀레니움 웹드라이버 다이어그램' %}

이 방식이 성공하여 셀레니움 RC와 웹드라이버 통합이 이루어졌고 2011년 7월에 셀레니움 웹드라이버(또는 셀레니움 2.0)를 릴리즈하게 된다. 즉, 현재 우리가 알고있는 셀레니움은 웹드라이버와 통합한 버전이다.

그림 2를 보면 알 수 있듯이 웹드라이버는 다양한 브라우저와 환경을 대응해야하는데, 브라우저마다 이를 위한 API가 다를 경우 또 다른 문제가 발생할 수 있기 때문에 현재 표준화를 제정([W3C WebDriver](https://www.w3.org/TR/webdriver/)) 중이다.

현재 셀레니움 웹드라이버는 파이썬, 루비, 자바, C## 그리고 Node.js를 이용해 웹브라우저는 조작할 수 있도록 다양한 API를 제공하고 있다. 하지만 셀레니움 서버와 자바스크립트의 궁합이 좋지 않고, 돔을 조작 하거나 셀렉팅하는데 한계가 있어 셀레니움 웹드라이버와 노드를 바인딩하여 다양한 기능을 제공하는 여러가지 형태의 프로젝트가 생겨났다. 그 중 유명한 프로젝트가 바로 webdriver.io와 나이트왓치 그리고 앵귤러 프로젝트를 위한 프로트랙터다.

이들 도구는 웹드라이버 API를 사용할 때 생기는 다양한 패턴을 추상화한 API와 신택스 슈가 등을 제공해 셀레니움 2.0 보더 더 편리하고 다양한 경험을 제공한다.

## 나이트왓치

나이트왓치는 노드 기반의 E2E 테스트 프레임워크다. 셀레니움 웹드라이버를 중개하여 각종 브라우저를 조작하고 동작이 기대한 것과 일치하는지 테스트하는데 사용한다. CSS 셀렉터로 엘리먼트를 셀렉팅하여 테스트를 작성할 수 있도록 하는 기능과 신텍스 슈가 그리고 단순하고 간결한 문법을 제공한다. 또한 테스트 러너를 포함하고 있으므로 독자적으로 그룹화한 테스트를 한번에 실행할 수 있으며 지속적인 통합의 파이프 라인과 합칠 수 있다는 특징을 가지고 있다.

나이트왓치를 알게 된건 나보다 먼저 E2E 테스트를 리서치하고 관련 도구를 찾고있던 훈민이형(개발왕 김코딩, [블로그](http://huns.me/)) 덕분이었다. 미리 삽질을 하고 계셨기 때문에 다른 도구를 선택하기 보다 같이 삽질하는 편이 고민할 시간도 적어서 큰 고민 없이 사용했다.

### 설치하기

나이트왓치 설치는 개발자 가이드 [Getting Started](http://nightwatchjs.org/guide##installation) 절에 잘 설명돼 있다. 이 문서에는 간단하게 요약해 설치 과정을 설명한다. 우선 NPM을 이용해 설치한다.

{% prism base "
$ npm install --save-dev nightwatch
" %}

웹드라이버로 브라우저와 통신하기 위해서는 셀레니움 서버를 실행시켜야한다. [셀레니움 서버 다운로드 사이트](http://selenium-release.storage.googleapis.com/index.html)에서 파일을 다운 받고 아래와 같이 서버를 실행한다. 이 글을 작성하는 현재 기준 가장 최신 버전은 2.53.0 이다.

프로젝트 디렉터리에서 nightwatch.json을 생성하고 다음과 같이 작성한다. 옵션의 자세한 설명은 개발자 가이드 [Configuration](http://nightwatchjs.org/guide##settings-file) 절을 참고한다.

{% prism js '
{
  "src_folders" : ["tests"], // 테스트할 디렉터리, 배열로 지정
  "output_folder" : "tests/reports", // JUnit XML 리포트 파일이 저장될 위치
  "custom_commands_path" : "", // 불러올 커스텀 커맨드가 있는 위치
  "custom_assertions_path" : "", // 불러올 커스텀 어썰트가 있는 위치
  "page_objects_path" : "", // 불러올 페이지 객체가 있는 위치
  "globals_path" : "", // 불러올 외부 글로벌 모듈이 있는 위치
  "selenium" : {   // 셀레니움 서버 환경 설정
    "start_process" : true, // 테스트 시작시 셀레니움 프로세스를 자동으로 실행할 것 인지 여부
    "server_path" : "./selenium-server-standalone-2.53.0.jar", // 셀레니움 서버 jar 파일의 경로, start_process가 false면 지정하지 않아도 된다.
    "log_path" : "tests/logs", // 셀레니움의 output.log 파일이 저장될 경로
    "host" : "127.0.0.1", // 셀레니움 서버의 listen ip
    "port" : 4444, // 셀레니움 서버의 listen port
    "cli_args" : { // 셀레니움 프로세스로 넘겨질 cli 인자 목록
      "webdriver.chrome.driver" : "",
      "webdriver.ie.driver" : ""
    }
  },
  "test_settings" : { // 테스트 브라우저 별 환경 설정
    "default" : { // 모든 브라우저에 적용 될 공통 설정
      "launch_url" : "http://localhost",
      "selenium_port"  : 4444,
      "selenium_host"  : "localhost",
      "silent": true, // 셀레니움의 로그를 숨길지 여부
      "screenshots": { // 테스트가 실패 했을 때 촬영 될 스크린샷 설정
        "enabled" : true,
        "on_failure" : true,
        "on_error" : false,
        "path" : "tests/screenshots"
      },
      "desiredCapabilities": { // 셀레니움 웹드라이버로 전달할 브라우저 이름과 기능 지정
        "browserName": "firefox",
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    }
  }
}
' %}

tests 디렉터리 하위에 demo.js를 생성하고 간단한 테스트 코드를 한다.

{% prism js "
module.exports = {
    '사용자는 검색어를 입력 후 검색어가 포함된 자동 완성 리스트를 볼 수 있다.' : function (browser) {
        browser
            .url('http://www.google.com')
            .waitForElementVisible('body', 1000)
            .setValue('input[type=text]', 'nightwatch')
            .pause(1000)
            .assert.containsText('##sbtc', 'nightwatch')
            .end();
    }
};
" %}

이어서 아래 명령어로 간단한 E2E 테스트를 실행할 수 있다.

{% prism bash "
$ ./node_modules/nightwatch/bin/nightwatch
" %}

하지만 현재 파이어폭스 버전 47에 문제가 있어 테스트가 실행되지 않을것이다. 파이어폭스에서 테스트 하고 싶다면 예전 버전([Install an older version of Firefox](https://support.mozilla.org/en-US/kb/install-older-version-of-firefox))으로 다운그레이드 하거나 GeckoDriver를 사용해야한다([Setting up the Marionette executable](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Marionette/WebDriver##Setting_up_the_Marionette_executable)). 여기에서는 GeckoDriver를 이용하는 방법을 소개(OSX 기준)하겠다.

먼저 [mozilla/geckodriver](https://github.com/mozilla/geckodriver/releases)에서  GeckoDriver를 다운로드한다.

{% prism bash "
$ cd ~/Downloads
$ wget https://github.com/mozilla/geckodriver/releases/download/v0.8.0/geckodriver-0.8.0-OSX.gz
" %}

다운로드한 파일을 압축 해제하고 적당한 위치로 옮긴 후 실행가능한 파일로 변경한다.

{% prism bash "
$ gunzip geckodriver-0.8.0-OSX.gz
$ mkdir executable && mv geckodriver-0.8.0-OSX executable/wires
$ chmod 755 executable/wires
" %}

이제 .bash_profile(또는 .zshrc)에서 PATH를 지정한다.

{% prism bash "
$ vim ~/.zshrc

	GECKO_DRIVER=$HOME/Downloads/executable
	export PATH=$HOME/bin:/usr/local/bin:/usr/local/sbin:$GECKO_DRIVER:$PATH

## rc파일을 다시 불러온다.
$ source ~/.zshrc
" %}

마지막으로 nightwatch.json파일에서 desiredCapabilities 속성을 다음과 같이 변경한다.

{% prism js '
"desiredCapabilities": {
  "browserName": "firefox",
  "marionette": true, // 추가
  "javascriptEnabled": true,
  "acceptSslCerts": true
}
' %}

이제 다시 실행해보면 파이어폭스 브라우저에서 정상적으로 테스트가 진행될 것이다.

{% figure e2e_and_nightwatch.03.png '데모 테스트 실행 결과' '그림 3. 데모 테스트 실행 결과' %}

### 여러 브라우저에서 동시에 테스트하기 

현재 작성한 설정 파일로 나이트왓치를 실행하면 파이어폭스에서만 테스트가 진행된다. 이번엔 크롬 브라우저에서도 테스트가 진행되도록 설정을 변경하겠다. 크롬 브라우저는 셀레니움과 통신할 웹드라이버를 별도로 설치해야하는데 웹드라이버 매니저를 사용하면 쉽게 설치할 수 있다. 아래 명령어로 웹드라이버 매니저를 설치한다.

{% prism bash '
$ npm install --save-dev webdriver-manager
 
# 크롬 웹드라이버와 앞 절에서 다운로드 받았던 셀레니움 서버가 함께 설치된다.
$ ./node_modules/.bin/webdriver-manager update
 
# 또는 아래 명령어 처럼 인자를 전달해 별도로 설치할 수도 있다.
# ./node_modules/.bin/webdriver-manager update --chrome
' %}

이제 nightwatch.json에 셀레니움 서버 경로와 크롬 웹드라이버 서버 경로를 수정한다.

{% prism js '
"selenium": {
  "start_process": true,
  "server_path": "./selenium-server-standalone-2.53.0.jar",
  "log_path": "tests/logs",
  "host": "127.0.0.1",
  "port": 4444,
  "cli_args": {
    "webdriver.chrome.driver" : "node_modules/webdriver-manager/selenium/chromedriver_2.21", // 추가
    "webdriver.ie.driver": ""
  }
},
' %}

다음으로 default 속성에 작성했던 파이어폭스 브라우저 설정을 test_settings 속성 하위로 옮기고 크롬 브라우저 설정도 함께 추가 작성한다.

{% prism js '
{
  // ... 생략 ...
  "test_settings": {
    "default": {
      "launch_url": "http://localhost",
      "selenium_port": 4444,
      "selenium_host": "localhost",
      "silent": true,
      "screenshots": {
        "enabled" : true,
        "on_failure" : true,
        "on_error" : false,
        "path" : "tests/screenshots"
      }
    },
    "firefox": {
      "desiredCapabilities": {
        "browserName": "firefox",
        "marionette": true,
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    },
    "chrome": {
      "desiredCapabilities": {
        "browserName": "chrome",
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    }
  }
}
' %}

이제 아래 명령어로 실행하면 두 브라우저에서 동시에 테스트가 실행된다.

{% prism base '
$ ./node_modules/nightwatch/bin/nightwatch --env firefox,chrome
' %}

사파리 브라우저에서 테스트하고자 한다면 사파리 웹드라이버를 확장 기능으로 설치해야한다. 자세한 내용은 나이트왓치 위치의 [Running tests in Safari](https://github.com/nightwatchjs/nightwatch/wiki/Running-tests-in-Safari) 문서를 참고한다.

{% figure e2e_and_nightwatch.04.png '사파리의 웹드라이버 확장프로그램' '그림 4. 사파리의 웹드라이버 확장프로그램' %}

### 모카 사용하기

이번엔 테스트 코드를 모카 기반으로 작성할 수 있는 환경을 만들어보겠다. 나이트왓치는 어썰트로 챠이(chai)를 내장하고 있지만 모카는 별도로 설정해 사용해야한다. 모카를 설정하는 자세한 내용은 개발자 가이드 [Using Mocha](http://nightwatchjs.org/guide##using-mocha) 절을 참고한다. 모카를 굳이 사용하려는 이유는 JUnit XML로 리포팅 하는 기본 러너와는 달리 다양하고 보기 쉬운 리포팅을 지원하기 때문이다.

먼저 nightwatch.json 파일에 다음과 같이 test_runner 속성을 추가한다. 옵션에 관한 자세한 설명은 모카 위키의 [Set options](https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically##set-options) 절을 참고한다.

{% prism js '
{
  "test_runner" : {
    "type" : "mocha",
    "options" : {
      "ui": "bdd",
      "reporter": "spec"
    }
  },
  // ... 생략 ...
}
' %}

테스트 코드를 모카 기반으로 재작성한다.

{% prism js "
describe('구글 메인 페이지', function() {
 
    before(function(client, done) {
        done();
    });
 
    after(function(client, done) {
        done();
    });
 
    describe('##사용자는 검색할 수 있다.', function() {
        it('사용자는 검색어를 입력 후 자동 완성된 리스트를 볼 수 있다.', function(client, done) {
            client
                .url('http://www.google.com')
                .waitForElementVisible('body', 1000)
                .setValue('input[type=text]', 'nightwatch')
                .pause(1000)
                .assert.containsText('##sbtc', 'nightwatch')
                .end(done);
        });
    });
});
" %}

다시 실행해 보면 모카 기반으로 테스트 코드가 동작하는 것을 볼 수 있다.

{% figure e2e_and_nightwatch.05.png '모카 테스트 실행 결과' '그림 5. 모카 테스트 실행 결과' %}

### 브라우저 스택 

크로스 브라우징 테스트를 할 수 있도록 해주는 웹 서비스인 브라우저 스택은 다양한 플랫폼과 웹 브라우저를 지원한다. 또한, 셀레니움 서버도 제공하고 있는데 이를 이용하면 나이트왓치와 연동해 테스트를 자동화할 수 있다.

먼저 browserstack.json 파일을 작성한다.

{% prism js '
{
  // ... 생략 ...
  "selenium": {
    "start_process": false
  },
  "test_settings": {
    "default" : {
      "launch_url" : "http://hub.browserstack.com",
      "selenium_host" : "hub.browserstack.com",
      "selenium_port" : 80,
      "silent" : true,
      "screenshots" : {
        "enabled" : true,
        "on_failure" : true,
        "on_error" : false,
        "path" : "tests/screenshots"
      },
      "desiredCapabilities": {
        "platform": "xp",
        "browserName": "firefox",
        "javascriptEnabled": true,
        "acceptSslCerts": true,
        "browserstack.user" : "user_id", // 브라우저 스택 아이디
        "browserstack.key" : "user_key" // 브라우저 스택 키
      }
    }
  }
}
' %}

platform 속성엔 XP를 browserName 속성엔 파이어폭스를 지정했고 로컬 환경에서 셀레니움 서버를 실행시킬 필요가 없기 때문에 start_process은 false로 지정했다. 이제 브라우저 스택은 윈도우즈 XP 환경의 파이어폭스 브라우저에서 테스트를 진행할 것이다. 브라우저 스택에서 지원하는 플랫폼과 브라우저는 공식 홈페이지의 [Capabilities](https://www.browserstack.com/automate/capabilities) 페이지를 참고하면 알 수 있다.

아래 명령어를 참고해 실행해본다.

{% prism js '
$ ./node_modules/nightwatch/bin/nightwatch --config browserstack.json
' %}

다양한 플랫폼과 브라우저에서 E2E 테스트를 할 수 있다는 점은 큰 장점이지만 통신이나 테스트를 구동하는 속도가 아주 느리다. 따라서 테스트 배치 혹은 정기 배포 전에만 사용하기 적합해 보인다.

### 웹스톰 디버깅

웹스톰에서 노드 디버깅 도구를 사용해 나이트왓치를 디버깅할 수 있다. 자세한 내용은 Debugging [Nightwatch tests in WebStorm](https://github.com/nightwatchjs/nightwatch/wiki/Debugging-Nightwatch-tests-in-WebStorm)을 참고한다. 다만, 파이프라인 방식이다 보니 브레이크 포인트를 활용한 디버깅이 다소 무의미한 느낌은 있다.

## 끝으로

여기까지 다양한 사전 지식을 설명하고 나이트왓치에 관해서 이해해봤다. E2E 테스트 특성 상 프로젝트 저장소에 테스트를 작성하고 유지하기 보단 별도의 E2E 테스트 저장소를 만들어 테스트를 작성하고 유지하는게 더 효율적이지 않을까 생각한다. 또, 나이트왓치에는 [페이지 오브젝트](http://nightwatchjs.org/guide##page-objects), [커스텀 커맨드](http://nightwatchjs.org/guide##extending) 등 테스트를 작성할 때 유용한 개념을 제공한다. 이 두 개념을 적절히 잘 사용하면 생각보다 더 관리하기 쉬운 테스트 코드를 작성할 수 있다. 

위에서 진행한 설치 및 설정 과정은 [UYEONG/hello-nightwatch](https://github.com/UYEONG/hello-nightwatch)에 올려놓았으니 참고하길 바란다.

## 참고

 * http://docs.seleniumhq.org/about/history.jsp
 * http://google-opensource.blogspot.kr/2009/05/introducing-webdriver.html
 * http://www.infoq.com/news/2011/07/Selenium-2
 * https://seleniumhq.wordpress.com/2011/07/08/selenium-2-0/
 * http://www.slideshare.net/sethmcl/join-the-darkside-nightwatchjs
 * https://github.com/SeleniumHQ/selenium/issues/2110
 * http://blog.trident-qa.com/2013/05/so-many-seleniums(일본어)
 * https://app.codegrid.net/entry/selenium-1(일본어)
 * http://pydiary.bitbucket.org/blog/html/2015/08/28/test.html(일본어)
 * http://blog.mmmcorp.co.jp/blog/2015/09/24/use-nightwatch/(일본어)
 * http://www.infoq.com/jp/news/2014/03/nightwatch(일본어)
 * http://qiita.com/yssg/items/a054d67bc7c7fc39b276(일본어)
