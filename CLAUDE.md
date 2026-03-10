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
npm run deploy    # gh-pages 브랜치에 배포
```
