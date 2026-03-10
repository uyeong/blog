# 프로젝트 가이드

## 개발 환경

- Hexo 8.1.1 / EJS 템플릿 / PrismJS 구문 강조
- `theme: .` — `themes/` 디렉토리 자체가 테마 루트 (별도 테마 폴더 없음)
- 소스 브랜치: `master`, 배포 브랜치: `gh-pages`
- 사이트 루트: `/blog/`

## 주요 파일 위치

| 영역 | 파일 |
|-----|------|
| Hexo 설정 | `_config.yml` |
| 테마 설정 | `themes/_config.yml` (SNS, GA, Disqus 등) |
| 마스터 레이아웃 | `themes/layout/layout.ejs` |
| 포스트 레이아웃 | `themes/layout/post.ejs` |
| 홈/아카이브 | `themes/layout/index.ejs` |
| EJS 파셜 | `themes/layout/_partial/` (head, header, footer, bottom, meta, tags, navigation, pagination, posts, media) |
| 커스텀 태그 플러그인 | `themes/scripts/` (figure.js, math.js, codepen.js, alert.js) |
| 라이트 스타일 | `themes/source/style.css` |
| 다크 스타일 | `themes/source/dark.css` |
| TOC 스크립트 | `themes/source/script.js` |

## 스타일 수정

### CSS 구조

`style.css` 하나에 모든 라이트 모드 스타일이 있다. 섹션은 주석 배너로 구분된다:

```
Utilities → Core → Header → Home → Posts → Post → Footer → Media → Meta → Tags → Alert → Navigation → Pagination
```

`dark.css`는 `prefers-color-scheme: dark` 미디어 쿼리로 로드되며, 라이트 모드 속성을 덮어쓰는 오버라이드만 포함한다. 다크 모드 수정 시 반드시 `dark.css`도 함께 확인할 것.

### 색상 토큰 (라이트 모드)

| 용도 | 색상 |
|-----|------|
| 배경 | `#faf8f5` |
| 본문 텍스트 | `#37322e` |
| 제목 (가장 어두운) | `#2a2523` |
| 보조 텍스트 | `#5f564e` |
| 연한 텍스트 | `#847a6f` |
| 아주 연한 텍스트 | `#a89e91` |
| 액센트 (링크) | `#c4623a` |
| 액센트 hover | `#a8532e` |
| 액센트 active | `#8f4726` |
| 서피스 (코드/태그 배경) | `#f0ece5` / `#f5f1eb` |
| 보더 | `#e0d8cc` |
| 셀렉션/하이라이트 | `#f0dfd0` |

### 반응형 브레이크포인트

| 기준 | 내용 |
|-----|------|
| `> 1250px` | TOC 사이드바 sticky |
| `≤ 1249px` | TOC 본문 위로 이동 |
| `≤ 768px` | 코드/이미지/alert full-bleed 확장 (`margin: 0 -20px`), 레이아웃 축소 |
| `≤ 480px` | 모바일 최적화, full-bleed `margin: 0 -16px`, 폰트/간격 축소 |

full-bleed 확장 시 마진 값은 해당 브레이크포인트의 `.root` 패딩과 일치시켜야 한다 (768px → 20px, 480px → 16px).

## 템플릿 수정

### 레이아웃 계층

```
layout.ejs
├── _partial/head.ejs      # <head> (메타, CDN 폰트/라이브러리, 스타일시트)
├── _partial/header.ejs    # 블로그 헤더 (프로필 이미지, 타이틀, SNS)
├── body
│   ├── index.ejs          # posts partial + pagination partial
│   └── post.ejs           # 커버 이미지, TOC, 본문, 네비게이션, 댓글
├── _partial/footer.ejs    # 저작권
└── _partial/bottom.ejs    # JS (KaTeX auto-render, GA, Disqus 조건부 로드)
```

### 포스트 목록 썸네일 (`posts.ejs`)

1. front matter `cover` → `images/{slug}/{cover}`
2. 없으면 → 본문 HTML에서 첫 `<figure>` 내 `<img src>` 정규식 추출
3. 둘 다 없으면 → 썸네일 없이 표시

### 커스텀 태그 플러그인 추가/수정

`themes/scripts/`에 JS 파일을 만들면 Hexo가 자동 로드한다.

```js
// 인라인 태그
hexo.extend.tag.register('tagname', function(args) {
  return '<html>';
});

// 블록 태그
hexo.extend.tag.register('tagname', function(args, content) {
  return '<html>' + content + '</html>';
}, { ends: true });
```

`this.slug`으로 현재 포스트 슬러그에 접근 가능. `url_for()`로 경로 생성 시 `/blog/` 루트가 자동 반영된다.

### CDN 라이브러리 (`head.ejs`, `bottom.ejs`)

| 라이브러리 | 로드 위치 | 용도 |
|-----------|----------|-----|
| Pretendard Variable | head | 본문 폰트 |
| Normalize.css 8.0.1 | head | CSS 리셋 |
| Font Awesome 4.7 | head | 아이콘 (`fa-clock-o`, `fa-map-marker`) |
| PrismJS 1.29 | head | 코드 구문 강조 (라이트/다크 테마 자동 전환) |
| KaTeX 0.16 | head(CSS) + bottom(JS) | 수식 렌더링 (deferred, auto-render) |

---

# 포스트 작성/수정 가이드

## 파일 생성

- 포스트 파일: `source/_posts/{slug}.md`
- 이미지 디렉토리: `source/images/{slug}/`
- slug는 영문 케밥케이스 (예: `my-new-post`)

## Front Matter

```yaml
---
title: 포스트 제목
description: 1~2문장 요약 (목록 페이지 및 SEO meta에 사용됨)
date: YYYY-MM-DD
category:
  - 카테고리명
tags:
  - 태그1
  - 태그2
cover: filename.jpg   # 선택. 커버 이미지 파일명
comments: true        # 선택. Disqus 댓글 활성화
---
```

## 이미지

이미지 파일은 `source/images/{post-slug}/`에 넣는다.

본문에서 참조할 때:

```
{% figure filename.png '대체텍스트' '캡션' '너비' %}
```

- 파일명만 쓰면 된다 (경로는 `figure.js`가 slug 기반으로 자동 생성)
- 캡션은 `<캡션>` 형태로 출력됨
- 너비는 선택 (예: `'340px'`)
- 캡션 없이 쓸 때: `{% figure filename.png '대체텍스트' '' %}`

## 코드 블럭

펜스드 코드 블럭 또는 Hexo codeblock 태그를 사용한다.

````
```js
const x = 1;
```
````

```
{% codeblock lang:js %}
const x = 1;
{% endcodeblock %}
```

## 수식 (KaTeX)

```
{% math %}
P = \frac{A + B}{2}
{% endmath %}
```

`\begin{aligned}` 등 LaTeX 환경을 그대로 사용할 수 있다.

## CodePen 임베드

```
{% codepen 사용자명 펜ID [탭] [높이] %}
```

예: `{% codepen uyeong qRBdvb result 340 %}`

## Alert 박스

```
{% alert info 제목 %}
마크다운 콘텐츠
{% endalert %}
```

- 타입: 현재 `info`만 스타일 정의됨
- 제목 생략 가능

### alert 내부에 이미지/코드 넣기

Hexo 태그는 중첩 불가. HTML을 직접 작성한다.

이미지:

```html
{% alert info '제목' %}
<figure title="설명">
  <a href="/blog/images/{slug}/filename.png" target="_blank">
    <img src="/blog/images/{slug}/filename.png" alt="설명">
  </a>
  <figcaption>&lt;캡션&gt;</figcaption>
</figure>

텍스트...
{% endalert %}
```

코드 (JSX 등의 `<`는 `&lt;`로 이스케이프):

```html
{% alert info 제목 %}
텍스트...
<pre><code class="language-js">
function foo() {
  return &lt;div>hello&lt;/div>;
}
</code></pre>
{% endalert %}
```

## 경로 규칙

- `{% figure %}` 태그: **파일명만** 쓴다 → `url_for()`가 `/blog/images/{slug}/`를 자동 생성
- alert 내 HTML, 마크다운 이미지: **절대 경로** 직접 작성 → `/blog/images/{slug}/filename.png`
- 루트가 `/blog/`임을 잊지 말 것

## 로컬 확인 및 배포

```bash
npm run server    # localhost:4000/blog/ 에서 확인
npm run clean     # 캐시 문제 시 public/, db.json 삭제
npm run deploy    # gh-pages 브랜치에 배포 (hexo generate + git push)
```

배포 전 `npm run server`로 로컬에서 먼저 확인할 것. 스타일 수정 후에는 브라우저 캐시 주의.
