---
title: setup-takumi-guard-npm 살펴보기
description: setup-takumi-guard-npm은 GitHub Actions에서 npm 설치를 Takumi Guard 프록시로 우회시켜 악성 패키지를 설치 전에 차단하게 만드는 액션이다. 이 프로젝트가 무엇을 풀고, 왜 이런 형태로 설계됐는지 핵심만 정리해본다.
date: 2026-03-11
category:
    - Security
    - Node.js
tags:
    - npm
    - GitHub Actions
    - OIDC
    - Security
    - Supply Chain Security
cover: cover.png
---

`npm install`은 단순한 다운로드 명령처럼 보이지만, 실제로는 외부 코드를 우리 개발 환경과 CI 안으로 들여오는 실행 경계다. 특히 CI에서는 테스트나 빌드가 시작되기 전에 의존성 설치가 먼저 일어나기 때문에, 악성 npm 패키지가 끼어들면 가장 앞단에서 사고가 터질 수 있다.

[setup-takumi-guard-npm](https://github.com/flatt-security/setup-takumi-guard-npm)은 바로 그 앞단에 경비원을 세우는 프로젝트다. 이름은 GitHub Action이지만, 본질은 **GitHub Actions의 npm 설치를 Takumi Guard라는 보안 프록시에 연결해 주는 얇은 접착층**이다. 이 글에서는 이 프로젝트가 정확히 무엇인지, 무엇을 목표로 하는지, 그리고 어떤 문제를 풀기 위해 이런 모양으로 나왔는지를 살펴보겠다.

{% figure branding.png 'Takumi Guard 공식 브랜딩 이미지' '그림 1. npm 설치 앞단의 경비원을 비유한 Takumi Guard' '720px' %}

## 이 프로젝트는 무엇인가

저장소 설명을 가장 짧게 줄이면 이렇다.

- GitHub Actions에서 동작하는 액션이다.
- `npm`, `pnpm`, `yarn` 설치를 `https://npm.flatt.tech`로 우회시킨다.
- 그 앞단에서 Takumi Guard가 악성 패키지 여부를 검사하고, 문제가 있으면 설치 자체를 막는다.

즉, 이 프로젝트는 새로운 보안 엔진이 아니다. **Takumi Guard라는 제품을 GitHub Actions에 최소한의 YAML 변경으로 연결해 주는 진입점**이다. 저장소의 README가 강조하듯이 이 액션의 핵심 가치는 "two lines of YAML"에 있다. 복잡한 에이전트 설치나 비밀값 배포 없이 워크플로에 한 줄 추가해 공급망 방어를 CI에 꽂아 넣는 것이다.

예시는 정말 단순하다.

{% codeblock lang:yaml %}
steps:
  - uses: actions/checkout@v4
  - uses: flatt-security/setup-takumi-guard-npm@v1
  - run: npm install
  - run: npm test
{% endcodeblock %}

이 정도면 왜 저장소 이름이 `setup-*`인지도 이해된다. 이 프로젝트의 역할은 탐지 자체보다 **연결과 초기화(setup)** 에 가깝다.

## 무엇을 달성하려고 하는가

이 프로젝트가 달성하려는 목표는 크게 세 가지로 보인다.

### 1. 악성 npm 패키지를 CI에 들여오기 전에 막기

Takumi Guard의 공식 설명은 아주 직설적이다. 이 서비스는 npm registry proxy로 동작하면서, 차단 목록에 올라간 패키지 요청에 대해 `403 Forbidden`을 반환한다. 중요한 점은 **패키지 tarball이 내려오기 전에 막는다**는 것이다. 설치 실패는 조금 불편할 수 있지만, 코드가 실행된 뒤에 탐지하는 것보다는 훨씬 낫다.

이건 일반적인 "설치 후 스캔"과 결이 다르다. 프로젝트가 노리는 지점은 사후 탐지가 아니라 **사전 차단(prevention)** 이다.

### 2. 보안을 켜기 위해 운영 복잡도를 올리지 않기

보안 도구는 종종 맞는 말만 하고 도입은 어렵다. 설정 파일이 늘어나고, 토큰을 배포해야 하고, 기존 워크플로를 많이 건드리게 된다. setup-takumi-guard-npm은 이 지점을 꽤 공격적으로 줄였다.

- 익명 모드에서는 계정 없이도 차단 기능을 켤 수 있다.
- `bot-id`를 붙이면 감사 로그와 조직 단위 가시성을 얻는다.
- 인증은 GitHub의 OIDC를 사용하므로 장기 비밀값을 저장하지 않아도 된다.

즉, "보안을 위해 더 많은 비밀값을 관리해야 한다"는 역설을 피하려는 설계다.

### 3. 차단뿐 아니라 사후 추적까지 이어 붙이기

Takumi Guard는 단순 블록리스트 서비스에서 끝나지 않는다. 인증된 사용 흐름에서는 설치 이력을 추적하고, 나중에 이미 내려받은 패키지에 보안 권고가 발행되면 알림을 보내는 **breach notification** 기능까지 제공한다.

이 부분이 중요하다. 공급망 보안에서는 "지금 막았다"만큼이나 "예전에 넣은 것이 나중에 악성으로 판명됐을 때 누가 영향을 받았는가"도 중요하기 때문이다. setup-takumi-guard-npm은 이 제품 기능을 GitHub Actions와 자연스럽게 연결하는 역할을 맡는다.

## 어떤 문제를 풀고 있는가

이 프로젝트가 겨냥한 문제는 npm 생태계의 익숙한 불편이 아니라, **의존성 설치 자체가 공격면이라는 사실**이다.

### 설치 단계는 너무 이르다

CI에서 보안 스캔은 보통 테스트 뒤나 빌드 뒤에 붙는다. 하지만 악성 패키지는 그 전에 들어온다. `preinstall`, `install`, `postinstall` 스크립트만으로도 충분히 문제를 일으킬 수 있다. 결국 더 앞단에서 막아야 한다.

setup-takumi-guard-npm은 이 문제를 "npm registry를 바꿔버리는 방식"으로 푼다. 애플리케이션 코드나 패키지 매니저를 뜯어고치지 않고, **설치가 시작되는 경로를 통제점으로 바꾸는 것**이다.

### 공개 Advisory만 기다리면 늦다

Takumi Guard의 공식 문서를 보면, 이 서비스는 npm의 Replicate API change feed를 계속 감시하면서 새 패키지와 업데이트를 수집하고, 자동 분석 파이프라인으로 악성 여부를 판단한다고 설명한다. 설치 스크립트, 난독화 코드, 알려진 악성 패턴, 샌드박스 실행 결과 등을 종합해 판정하고, 그래서 공개 advisory보다 앞서 **zero-day 악성 패키지**를 잡는 것을 목표로 한다.

이 대목이 꽤 중요하다. setup-takumi-guard-npm의 존재 이유는 단순히 "보안 프록시를 쓰게 하자"가 아니라, **실시간으로 갱신되는 위협 인텔리전스를 CI 설치 경로에 직접 연결하자**에 가깝다.

### CI 비밀값 관리가 또 다른 부담이다

보안 도구를 CI에 붙일 때 자주 생기는 문제가 비밀값 배포다. 특히 조직 단위 인증이 필요하면 PAT나 장기 토큰을 저장소나 조직 시크릿으로 뿌려야 하는데, 이건 운영 부담도 크고 유출 면적도 넓다.

이 프로젝트는 GitHub OIDC를 이용해 이 문제를 줄인다. 워크플로 실행 시점에 GitHub가 발행한 ID 토큰을 받고, Shisho Cloud의 STS가 그 토큰의 서명과 발급 대상을 검증한 뒤, 짧은 수명의 액세스 토큰으로 교환한다. 문서상 기본 만료 시간은 30분이고 최대 24시간까지 설정할 수 있다.

여기서 `bot-id`는 비밀값도 아니다. 허용 목록을 조회하기 위한 공개 식별자일 뿐이고, 실제 신뢰의 근거는 OIDC 토큰 검증에 있다. 이런 구조라서 setup-takumi-guard-npm은 "설치 차단"과 "비밀값 없는 CI 인증"을 동시에 묶는다.

## 내부 동작은 의외로 단순하다

이 액션의 `action.yml`을 보면 하는 일은 생각보다 많지 않다.

1. 필요하면 프로젝트 레벨 `.npmrc`에 레지스트리를 `https://npm.flatt.tech/`로 설정한다.
2. `bot-id`가 있으면 GitHub OIDC 토큰을 받아온다.
3. 그 토큰을 STS에 보내 짧은 수명의 액세스 토큰으로 교환한다.
4. 받은 토큰을 `.npmrc`에 써서 인증된 설치 흐름을 만든다.

즉, 구현의 무게중심은 액션 안이 아니라 Takumi Guard 서비스 쪽에 있다. 액션은 일부러 얇게 유지되고, 실제 위협 판단과 차단은 프록시와 인텔리전스 파이프라인이 담당한다. 이런 분리는 꽤 합리적이다. GitHub Action 저장소는 배포와 연결에 집중하고, 보안 로직은 서버 측에서 계속 갱신하는 편이 운영상 훨씬 낫기 때문이다.

## 이 프로젝트를 어떻게 봐야 할까

이 저장소를 "npm 보안 스캐너"로 보면 조금 빗나간다. 더 정확하게는 아래처럼 보는 편이 맞다.

- **제품 측면**에서는 Takumi Guard의 CI용 온보딩 레이어다.
- **보안 측면**에서는 설치 후 탐지가 아니라 설치 전 차단을 지향한다.
- **운영 측면**에서는 계정 없이 시작할 수 있고, 필요하면 OIDC로 조직 인증까지 확장된다.

특히 마음에 드는 점은 단계적 도입이 가능하다는 것이다. 우선 익명 모드로 차단만 켜고, 필요해지면 Bot ID와 OIDC를 붙여 감사 로그와 조직 단위 추적까지 가져갈 수 있다. 보안 도입이 "올인 아니면 포기"가 아니라 **낮은 마찰로 시작해서 점진적으로 강화되는 구조**라는 뜻이다.

반대로 한계도 분명하다. 이 프로젝트 자체가 해결하는 범위는 npm 계열 설치 경로다. 애플리케이션 코드 안의 취약점, 이미 설치된 패키지의 안전성 전반, 다른 패키지 생태계까지 한 번에 다루는 도구는 아니다. 하지만 범위를 좁게 잡았기 때문에 오히려 "CI의 의존성 설치"라는 문제에 집중할 수 있었다고도 볼 수 있다.

## 마무리

setup-takumi-guard-npm은 거대한 기능을 가진 저장소라기보다, **공급망 보안을 실제 워크플로 한복판에 꽂아 넣기 위한 아주 실용적인 어댑터**에 가깝다. 이 프로젝트가 흥미로운 이유는 보안 기능의 양보다 설계의 방향성에 있다.

- npm 설치는 신뢰 결정이라는 전제
- 차단은 설치 후가 아니라 설치 전에 해야 한다는 판단
- 보안을 붙이기 위해 장기 비밀값을 늘리지 않겠다는 선택
- 공개 advisory보다 빠른 실시간 분석을 설치 경로에 연결하겠다는 목표

이 네 가지가 꽤 일관되게 맞물려 있다. 그래서 이 저장소는 단순한 GitHub Action 이상으로, "공급망 보안을 어디에 끼워 넣어야 효과적인가"에 대한 하나의 답처럼 보인다.

## 참고 링크

- [setup-takumi-guard-npm 저장소](https://github.com/flatt-security/setup-takumi-guard-npm)
- [Takumi Guard 공식 소개](https://shisho.dev/docs/t/guard/)
- [npm Quickstart](https://shisho.dev/docs/t/guard/quickstart/npm)
- [Package Blocking](https://shisho.dev/docs/t/guard/features/package-blocking)
- [Breach Notifications](https://shisho.dev/docs/t/guard/features/breach-notifications)
- [CI Integration & OIDC Authentication](https://shisho.dev/docs/t/guard/architecture/oidc)
- [Intelligence](https://shisho.dev/docs/t/guard/architecture/intelligence)
- [Takumi Guard 제공 시작 릴리스 노트](https://shisho.dev/docs/r/202603-takumi-guard)
