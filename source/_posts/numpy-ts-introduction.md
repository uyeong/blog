---
title: NumPy를 TypeScript로 옮긴다고? numpy-ts 살펴보기
description: Python 과학 컴퓨팅의 핵심인 NumPy를 TypeScript로 재구현한 numpy-ts를 소개한다. 93.9% API 커버리지, 트리셰이킹, 제로 디펜던시까지 갖춘 이 라이브러리를 자세히 들여다본다.
date: 2026-03-10
category:
    - JavaScript
tags:
    - TypeScript
    - JavaScript
    - NumPy
    - Development
cover: cover.jpg
---

프론트엔드 개발자라면 한 번쯤 이런 생각을 해봤을 것이다. "NumPy처럼 다차원 배열을 자유롭게 다루고 싶은데, 왜 JavaScript 생태계에는 마땅한 게 없지?"

물론 [numjs](https://github.com/nicolaspanel/numjs)나 [ndarray](https://www.npmjs.com/package/ndarray) 같은 선구자가 있었지만, NumPy의 방대한 API를 충실히 재현한 라이브러리는 사실상 없었다. [numpy-ts](https://github.com/dupontcyborg/numpy-ts)는 바로 그 간극을 메우려는 프로젝트다. NumPy API의 **93.9%**(507개 중 476개 함수)를 TypeScript로 재구현했다고 한다. 과연 어느 정도 수준인지 함께 살펴보자.

## 핵심 특징

numpy-ts의 주요 셀링 포인트를 먼저 정리하면 다음과 같다.

- **93.9% API 커버리지** — 476/507개 NumPy 함수 구현
- **제로 디펜던시** — 런타임 의존성 없음
- **트리셰이킹 지원** — `numpy-ts/core`에서 필요한 함수만 가져오면 번들 10~40KB
- **TypeScript 네이티브** — 완전한 타입 추론
- **NumPy 검증 테스트** — Python NumPy 결과와 직접 비교하는 6,000개 이상의 테스트

## 설치 및 기본 사용법

설치는 간단하다.

```bash
npm install numpy-ts
```

Node.js 20.1.0 이상이 필요하다. 사용 방식은 세 가지 진입점을 제공한다.

{% codeblock lang:typescript %}
// 1. 풀 API — 메서드 체이닝 지원 (~200-300KB)
import * as np from 'numpy-ts';

const A = np.array([[1, 2], [3, 4]], 'float32');
const result = A.add(5).multiply(2).T;

// 2. 트리셰이킹 — 필요한 함수만 (~10-40KB)
import { array, add, reshape } from 'numpy-ts/core';

// 3. Node.js 파일 I/O 포함
import * as np from 'numpy-ts/node';
const arr = await np.loadNpy('data.npy');
{% endcodeblock %}

{% alert info '왜 세 가지 진입점인가?' %}
브라우저 번들 크기가 중요한 프로젝트에서는 `numpy-ts/core`를 쓰면 트리셰이킹이 가능하다. 반면 Node.js 환경에서 파일 I/O(`.npy`, `.npz`, `.csv`)까지 필요하다면 `numpy-ts/node`를 쓰면 된다. 풀 API는 메서드 체이닝의 편의성을 제공하지만 번들이 크다.
{% endalert %}

## NumPy와의 문법 차이

Python에서 넘어온 개발자라면 몇 가지 차이를 알아두어야 한다.

{% codeblock lang:typescript %}
// Python: a = np.zeros((3, 3))
// TS: 튜플 대신 배열
const a = np.zeros([3, 3]);

// Python: a[0:2, :]
// TS: 슬라이싱은 문자열
a.slice('0:2', ':');

// Python: a + b
// TS: 연산자 오버로딩 없음
a.add(b);
// 또는
np.add(a, b);

// Python: np.sum(a, axis=0)
// TS: 키워드 인자 없음, 위치 인자만
np.sum(a, 0);

// Python: np.var(a)
// TS: var는 예약어
np.variance(a);
{% endcodeblock %}

슬라이싱을 문자열로 처리하는 부분이 좀 아쉽지만, JavaScript 언어의 한계를 고려하면 합리적인 선택이다. `Proxy` 기반의 브래킷 인덱싱(`arr[0]`, `arr[-1]`)도 지원하므로 단순 접근은 자연스럽게 할 수 있다.

## 지원하는 기능 범위

numpy-ts가 커버하는 영역은 생각보다 넓다.

| 영역 | 주요 함수 |
|-----|----------|
| 배열 생성 | `array`, `zeros`, `ones`, `arange`, `linspace`, `eye`, `meshgrid` 등 |
| 산술/수학 | `add`, `multiply`, `sqrt`, `exp`, `log`, `clip`, `interp` 등 |
| 삼각함수 | `sin`, `cos`, `tan`, `arcsin`, `arctan2` 등 전체 |
| 선형대수 | `dot`, `matmul`, `inv`, `det`, `eig`, `svd`, `solve`, `qr`, `cholesky` |
| 통계/리덕션 | `sum`, `mean`, `std`, `median`, `percentile`, `histogram` |
| FFT | `fft`, `ifft`, `fft2`, `rfft`, `fftfreq`, `fftshift` |
| 난수 | `normal`, `uniform`, `poisson`, `binomial` 등 30개 이상 분포 |
| 형상 조작 | `reshape`, `concatenate`, `stack`, `split`, `pad`, `flip`, `rot90` |
| 집합/정렬 | `unique`, `intersect1d`, `sort`, `argsort`, `searchsorted` |
| I/O | `.npy`, `.npz`, `.csv`/`.txt` 읽기/쓰기 |

구현하지 않은 31개 함수는 윈도우 함수(`hamming`, `kaiser`), 영업일 유틸리티, 그리고 이미 NumPy에서도 deprecated된 기능들이다.

## 실제 활용 예시

### 선형대수

{% codeblock lang:typescript %}
import * as np from 'numpy-ts';

// 연립방정식 풀기: Ax = b
const A = np.array([[3, 1], [1, 2]]);
const b = np.array([9, 8]);
const x = np.linalg.solve(A, b);
console.log(x.tolist()); // [2, 3]

// SVD 분해
const [U, S, Vt] = np.linalg.svd(A);
{% endcodeblock %}

### 통계 분석

{% codeblock lang:typescript %}
import * as np from 'numpy-ts';

const data = np.random.normal(0, 1, [1000]);

console.log('평균:', np.mean(data).item());
console.log('표준편차:', np.std(data).item());
console.log('중앙값:', np.median(data).item());

// 히스토그램
const [counts, edges] = np.histogram(data, 20);
{% endcodeblock %}

### 신호 처리

{% codeblock lang:typescript %}
import * as np from 'numpy-ts';

// 사인파 생성
const t = np.linspace(0, 1, [256]);
const signal = np.sin(np.multiply(t, 2 * Math.PI * 10));

// FFT 변환
const spectrum = np.fft.fft(signal);
const freqs = np.fft.fftfreq(256, 1 / 256);
{% endcodeblock %}

## 성능은 어떨까?

솔직히 말하면, 순수 JavaScript로 C/Fortran BLAS 기반의 NumPy를 이기는 것은 불가능하다. 프로젝트에서 공개한 297개 벤치마크 결과를 보면 현실이 보인다.

> 평균 12.16배 느림, 중앙값 3.67배 느림. 최선의 경우 NumPy보다 빠른 것도 있지만, 최악의 경우 300배까지 느려진다.

영역별로 보면 편차가 크다.

| 영역 | NumPy 대비 속도 |
|-----|---------------|
| 유틸리티 | **0.09x** (더 빠름) |
| I/O | 1.76x |
| 집합 연산 | 2.06x |
| 다항식 | 2.32x |
| 정렬 | 14.05x |
| FFT | 18.13x |
| 선형대수 | 44.69x |

{% alert info 'WASM 가속 계획' %}
프로젝트에는 Zig로 작성한 WASM 백엔드 계획이 문서화되어 있다. `numpy-ts/wasm`으로 임포트하면 자동으로 WASM 커널을 사용하고, 작은 배열(256개 미만)에서는 자동으로 JS로 폴백하는 구조다. 아직 구현 전이지만, 실현되면 성능 격차가 크게 줄어들 것이다.
{% endalert %}

유틸리티나 I/O처럼 이미 충분히 빠른 영역도 있고, 선형대수처럼 격차가 큰 영역도 있다. "Python 없이 브라우저에서 돌린다"는 가치와 성능 사이의 트레이드오프를 이해하고 사용해야 한다.

## 테스트 전략이 인상적이다

numpy-ts의 테스트 구조는 꽤 체계적이다.

1. **유닛 테스트** — 50개 이상의 모듈별 테스트 (Vitest)
2. **검증 테스트** — Python NumPy를 실제로 실행해서 결과를 비교하는 오라클 테스트 47개
3. **번들 테스트** — CJS, ESM, 브라우저 IIFE 번들이 정상 동작하는지 확인 (Playwright)
4. **트리셰이킹 테스트** — 단일 함수 임포트 시 번들 크기가 최소인지 esbuild/rollup/webpack으로 검증

특히 검증 테스트가 눈에 띈다. `numpy-oracle.ts`라는 브릿지가 Python 프로세스를 띄워 실제 NumPy 코드를 실행하고, 그 결과를 JSON으로 받아와 TypeScript 출력과 비교한다. "NumPy와 동일하게 동작한다"는 주장을 코드로 증명하는 셈이다.

## 아키텍처

내부 구조도 잘 설계되어 있다.

- **`common/storage.ts`** — TypedArray를 감싸는 `ArrayStorage` 클래스. shape, strides, offset, dtype을 관리한다.
- **`common/ndarray-core.ts`** — 최소한의 `NDArrayCore` 클래스. Proxy 기반 브래킷 인덱싱 지원.
- **`common/dtype.ts`** — 13가지 dtype(`float64`, `float32`, `complex128`, `int32`, `bool` 등)과 NumPy와 동일한 타입 프로모션 규칙.
- **`common/ops/`** — 산술, 선형대수, FFT, 난수 등 20개 연산 모듈.
- **`core/`** — 트리셰이킹 가능한 래퍼 함수들.
- **`full/`** — `NDArrayCore`를 확장한 `NDArray` 클래스. 100개 이상의 체이너블 메서드. 스크립트로 자동 생성된다.

풀 API의 `NDArray` 클래스가 스크립트(`scripts/generate-full.ts`)로 자동 생성된다는 점이 재미있다. core 함수 목록에서 메서드를 자동으로 만들어내므로 API 일관성이 보장된다.

## 누구에게 유용할까?

numpy-ts가 빛을 발할 수 있는 시나리오는 분명하다.

- **브라우저에서 수치 연산**이 필요한 경우 — 인터랙티브 데이터 시각화, 교육용 도구
- **Python 없이 NumPy API를 쓰고 싶은** Node.js 프로젝트
- **TypeScript 타입 안전성**이 중요한 과학 컴퓨팅
- **프로토타이핑** — Python 코드를 TS로 빠르게 포팅할 때

반면, 대규모 행렬 연산의 극한 성능이 필요하다면 여전히 Python NumPy(또는 [TensorFlow.js](https://www.tensorflow.org/js), [ONNX Runtime Web](https://onnxruntime.ai/))이 더 적합하다.

## 마무리

numpy-ts는 "TypeScript에서 NumPy를 쓸 수 있을까?"라는 질문에 대한 진지한 답변이다. 93.9%의 API 커버리지, Python 오라클 기반 검증 테스트, 트리셰이킹과 세 가지 진입점을 통한 유연한 번들 전략까지 — 단순한 토이 프로젝트가 아니라 실용을 지향하는 라이브러리라는 것을 알 수 있다.

성능 격차는 분명히 존재하지만, WASM 가속이 실현되면 상당 부분 해소될 가능성이 있다. 무엇보다 "Python 런타임 없이 브라우저에서 NumPy API를 그대로 쓸 수 있다"는 것 자체가 이 프로젝트의 가장 큰 가치다.

관심이 있다면 [공식 문서](https://numpyts.dev/)와 [GitHub 저장소](https://github.com/dupontcyborg/numpy-ts)를 방문해보자.
