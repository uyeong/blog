---
title: 백엔드 개발자와 협업하는 두 가지 방법
description: 이 문서는 백엔드 개발자와 협업하는 두 가지 방법을 정리한 문서로 API 협의 과정 또는 그러한 과정없이 애플리케이션을 개발하는 방법을 소개합니다.
permalink: two-ways-to-work-with-backend-developer
date : 2018-03-03
category:
    - Development
tags:
    - Development
    - Sinon.js
    - TypeScript
    - JavaScript
---

보통 애플리케이션 개발은 외부 자원에 접근할 수 있는 API가 필요하다. 그리고 대개, API를 개발하는 백엔드 개발자와 애플리케이션 인터페이스를 개발하는 프런트엔드 개발자로 나눠 협업한다. 이때 두 직군 간 협업 과정에서 병목이 발생하기 쉽다.

프런트엔드 개발자는 동작하는 API를 기다리고 백엔드 개발자는 프런트엔드 요구에 맞춰 API, 또는 비즈니스 로직까지 변경해야 하는 일이 생긴다. 그러다 보니 교착 상태에 빠지거나 시간이 흐를수록 커뮤니케이션이 힘들어지기도 한다.

만약 당신이 이러한 문제를 겪고 있다면 지금부터 소개하는 두 가지 방법이 도움이 될 수 있다.

## API 인터페이스 협의

가장 이상적인 방법은 API 인터페이스를 협의하는 과정을 갖는 것이다. 필요한 API는 요구사항 분석 과정에서 알 수 있다. 예를 들어 복수의 피드를 선택해 구독하는 기능을 떠올려보자. 자연스럽게 복수 피드에 대해 구독 요청을 할 수 있는 API가 필요함을 알 수 있다.

이어서 백엔드 개발자와 함께 구독 요청 API 인터페이스를 협의한다. API 인터페이스란 어떤 메서드와 URL로 요청 해야 하고 응답 형식은 무엇인가에 대한 약속이다. 이를 신뢰하고 각자 개발을 진행한다. 동작하는 API를 기다리지 않아도 된다.

[Node.js](https://nodejs.org/en/)에 익숙하다면 [Express](https://expressjs.com/)를 이용해 목서버를 만들 수 있다. 만약 테스트를 작성한다면 [Sinon.JS](http://sinonjs.org/)의 [Fake XHR](http://sinonjs.org/releases/v4.4.2/fake-xhr-and-server/)을 이용한다.

{% prism javascript %}
test('collect()', async () => {
  // Given
  server.respondWith('POST', /\\/api\\/feeds\\/collect/, xhr => {
    if (JSON.parse(xhr.requestBody).productIds !== '1,2,3') {
      return false;
    }
    xhr.respond(200, {'Content-Type': 'application/json'}, JSON.stringify({collectId: 'ab8d7ee'}));
  });
  // When
  const collectId = await feeds.collect([1, 2, 3]);
  // Then
  expect(collectId).to.equal('ab8d7ee');
});
{% endprism %}

또는, 목서버 없이 개발 환경에서만 [Fake XHR](http://sinonjs.org/releases/v4.4.2/fake-xhr-and-server/)을 애플리케이션 문맥에 불러올 수도 있다.

## 팩토리를 이용한 개발

어떠한 API가 필요하고 또, 구현 가능한지 불확실할 때는 협의 미팅이 도움 되지만, 구현할 기능이 단순하고 필요한 API에 관해 대략적인 정보를 공유하고 있다면 오히려 비용일 수 있다. 그렇지만 API 응답 형태를 모르는 상태에서 예측으로 코드를 작성하면 통합 단계에서 애플리케이션 전체의 코드 변경이 필요할 수 있다.

친구 목록을 가져와 출력해주는 기능을 상상해보자. 이 요구사항에서 모델을 디자인할 수 있다.

{% prism typescript %}
class FriendEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly tel: string;

  constructor(data: Friend) {
    this.id = data.id;
    this.name = data.name;
    this.tel = data.tel;
  }
}
{% endprism %}

이 모델을 의존해 기능을 개발한다. API의 응답은 몰라도 된다. 이후 동작하는 API를 전달받았는데 응답 형태가 앞서 작성한 모델과 다르다고 가정해보자.

{% prism typescript %}
interface FriendPayload {
  userNo: number;
  name: string;
  phoneNumber: string;
}
{% endprism %}

만약 모델을 바꾸면 애플리케이션에 영향이 생긴다. 그리고 외부 데이터가 모델의 변경을 유발한다는 것도 논리적이지 않다. 이때, 우리는 팩토리 객체를 이용할 수 있다.

{% prism typescript %}
class FriendFactory {
  public static create(data: FriendPayload) {
    return new FriendEntity({
      id: data.userNo,
      name: data.name,
      tel: data.phoneNumber
    });
  }
}

me.friends().then((data: FriendPayload[]) => {
  const friends = data.map(d => FriendFactory.create(d));
  friendListView.render(friends);
});
{% endprism %}

`friendListView`는 `FriendEntity`에 의존한다. API의 응답 형태로 인해 `friendListView`가 영향받지 않는다. 이처럼 모델에서 시작하고, 모델을 의존하면 API 없이 개발을 시작할 수 있다. API를 전달받으면 팩토리 객체를 이용해 변경을 최소화하고 통합하면 된다.

여기까지 백엔드 개발자와 협업하는 두 가지 방법을 간단히 소개했다. 어떠한 API가 필요하고 또, 구현 가능한지 불확실하다면 API 인터페이스 협의 과정을 갖길 바란다. 하지만 기능이 단순하고 필요한 API도 어느 정도 공유된 상황에서 협의 미팅은 피곤할 수 있다. 그땐 팩토리 객체를 이용하자. 애플리케이션의 변경을 최소화해 개발할 수 있다.
