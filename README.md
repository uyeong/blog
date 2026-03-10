# Coderifleman's Blog

Hexo 8.1.1 기반 개인 기술 블로그. 커스텀 테마와 태그 플러그인을 사용한다.

- **URL**: `https://uyeong.github.io/blog`
- **루트**: `/blog/`
- **퍼머링크**: `:year/:month/:day/:title/`
- **언어**: 한국어 (`ko`)

## 프로젝트 구조

```
blog/
├── _config.yml              # Hexo 메인 설정
├── source/
│   ├── _posts/              # 마크다운 포스트 (.md)
│   ├── images/              # 포스트별 이미지 디렉토리
│   │   ├── {post-slug}/     # 포스트 슬러그와 동일한 이름
│   │   └── common/          # 공용 이미지 (author.png 등)
│   └── robots.txt
├── themes/
│   ├── _config.yml          # 테마 설정 (SNS, GA, Disqus 등)
│   ├── layout/              # EJS 템플릿
│   │   ├── layout.ejs       # 마스터 레이아웃
│   │   ├── post.ejs         # 포스트 상세
│   │   ├── index.ejs        # 홈/아카이브
│   │   └── _partial/        # 헤더, 푸터, 메타, 네비게이션 등
│   ├── scripts/             # 커스텀 Hexo 태그 플러그인
│   │   ├── figure.js
│   │   ├── math.js
│   │   ├── codepen.js
│   │   └── alert.js
│   └── source/              # 정적 에셋
│       ├── style.css        # 메인 스타일 (라이트 모드)
│       ├── dark.css         # 다크 모드 오버라이드
│       └── script.js        # TOC 하이라이트
└── package.json
```

## 외부 의존성

테마에서 CDN으로 로드하는 라이브러리 (`head.ejs`, `bottom.ejs`):

| 라이브러리 | 용도 |
|-----------|-----|
| Pretendard Variable | 본문 폰트 |
| Normalize.css 8.0.1 | CSS 리셋 |
| Font Awesome 4.7 | 아이콘 (`fa-clock-o`, `fa-map-marker`) |
| PrismJS 1.29 | 코드 구문 강조 (라이트/다크 테마 자동 전환) |
| KaTeX 0.16 | 수식 렌더링 (auto-render, deferred 로딩) |

## 명령어

```bash
npm run server   # 로컬 개발 서버 (hexo server)
npm run build    # 정적 파일 생성 (hexo generate)
npm run clean    # 캐시/생성 파일 삭제 (hexo clean)
npm run deploy   # gh-pages 브랜치 배포 (hexo deploy)
```

## 포스트 작성

### Front Matter

```yaml
---
title: 포스트 제목
description: SEO용 설명 (1~2문장). 목록 페이지에도 그대로 표시됨
date: 2024-01-15
category:
  - JavaScript
  - Architecture
tags:
  - React
  - Pattern
cover: cover-image.jpg        # 선택. 커버 이미지 파일명
comments: true                # 선택. Disqus 댓글 활성화
---
```

- `cover`: 지정하면 포스트 상단에 이미지가 오버레이 형태로 표시되고, 제목과 메타 정보가 이미지 위에 겹쳐진다. 생략하면 일반 텍스트 헤더.
- `description`: 포스트 목록에서 요약으로 표시되고, `<meta name="description">`에도 사용된다.
- `comments`: `true`로 설정하고 테마에 `disqus_shortname`이 있으면 Disqus 댓글이 활성화된다.

### 이미지 파일 위치

`post_asset_folder: false` 설정이므로, 이미지는 포스트 파일과 분리되어 관리한다.

```
source/images/{post-slug}/image-name.png
```

포스트 슬러그(파일명에서 `.md`를 뺀 것)와 동일한 이름의 디렉토리를 만들고 그 안에 이미지를 넣는다.

```
source/_posts/create-the-undo-redo-feature.md
source/images/create-the-undo-redo-feature/
  ├── undo-redo.00.jpg    ← cover 이미지
  ├── undo-redo.01.png
  └── undo-redo.02.png
```

## 코드 블럭

두 가지 문법을 모두 지원한다.

**Hexo codeblock 태그** (레거시, 기존 포스트에서 주로 사용):

```markdown
{% codeblock lang:js %}
const x = 1;
{% endcodeblock %}
```

**펜스드 코드 블럭** (마크다운 표준):

````markdown
```js
const x = 1;
```
````

구문 강조는 PrismJS(`syntax_highlighter: prismjs`, preprocess 모드)로 처리된다.

## 커스텀 태그 플러그인

### figure

이미지를 `<figure>` 요소로 출력한다. 클릭하면 새 탭에서 원본을 연다.

```
{% figure 파일명 '대체텍스트' '캡션' '너비' %}
```

| 파라미터 | 필수 | 설명 |
|---------|------|-----|
| 파일명 | O | 이미지 파일명 (현재 포스트의 이미지 디렉토리 기준) |
| 대체텍스트 | | `alt` 속성 및 `title` 속성 |
| 캡션 | | `<figcaption>`에 `<캡션>` 형태로 출력 |
| 너비 | | CSS `max-width` 값 (예: `'340px'`) |

**사용 예시:**

```markdown
{% figure bezier.01.png '베지에 곡선의 조절점' '그림 1. 베지에 곡선의 조절점' '340px' %}

{% figure diagram.png '구조 다이어그램' '' %}
```

**출력 HTML:**

```html
<figure title="베지에 곡선의 조절점">
  <a href="/blog/images/post-slug/bezier.01.png" target="_blank">
    <img src="/blog/images/post-slug/bezier.01.png" alt="베지에 곡선의 조절점" style="max-width:340px">
  </a>
  <figcaption>&lt;그림 1. 베지에 곡선의 조절점&gt;</figcaption>
</figure>
```

### math

KaTeX로 수식을 렌더링한다. `$$...$$` 디스플레이 모드로 감싸져 출력된다.

```
{% math %}
수식 내용
{% endmath %}
```

**사용 예시:**

```markdown
{% math %}
P = \frac{A + B}{2}
{% endmath %}

{% math %}
\begin{aligned}
P &= (1 - t) \times A + t \times B \\
  &= 0.5A + 0.5B
\end{aligned}
{% endmath %}
```

### codepen

CodePen을 iframe으로 임베드한다.

```
{% codepen 사용자 슬러그 [탭] [높이] %}
```

| 파라미터 | 필수 | 기본값 | 설명 |
|---------|------|-------|-----|
| 사용자 | O | | CodePen 사용자명 |
| 슬러그 | O | | 펜 ID |
| 탭 | | `result` | 기본 탭 (`result`, `html`, `css`, `js`) |
| 높이 | | `300` | iframe 높이 (px) |

**사용 예시:**

```markdown
{% codepen uyeong qRBdvb result 340 %}
```

### alert

정보 박스를 출력한다. 내부 콘텐츠는 마크다운으로 렌더링된다.

```
{% alert 타입 제목 %}
마크다운 콘텐츠
{% endalert %}
```

| 파라미터 | 필수 | 설명 |
|---------|------|-----|
| 타입 | O | CSS 클래스 접미사 (현재 `info` 스타일만 정의됨) |
| 제목 | | 굵은 글씨로 표시되는 제목 |

**사용 예시:**

```markdown
{% alert info 읽기전에... %}
이 문서는 번역 문서입니다. 원문은 [여기](https://example.com)에서 확인할 수 있습니다.
{% endalert %}

{% alert info %}
제목 없이 본문만 표시할 수도 있다.
{% endalert %}
```

**alert 내부에 이미지/코드 넣기:**

Hexo 태그 중첩이 불가하므로 `{% figure %}`나 `{% codeblock %}`을 쓸 수 없다. 대신 HTML을 직접 작성한다.

이미지:

```markdown
{% alert info '메멘토 패턴' %}
<figure title="메멘토 패턴">
  <a href="/blog/images/post-slug/undo-redo.02.png" target="_blank">
    <img src="/blog/images/post-slug/undo-redo.02.png" alt="메멘토 패턴">
  </a>
  <figcaption>&lt;메멘토 패턴&gt;</figcaption>
</figure>

설명 텍스트...
{% endalert %}
```

코드 블럭 (`<pre><code>` 사용, JSX 등의 `<`는 `&lt;`로 이스케이프):

```markdown
{% alert info 역자노트 %}
설명 텍스트...
<pre><code class="language-js">
class Foo extends React.Component {
  render() {
    return (
      &lt;div>
        &lt;span>{this.props.name}&lt;/span>
      &lt;/div>
    );
  }
}
</code></pre>
{% endalert %}
```

이미지 경로는 `url_for` 헬퍼를 거치지 않으므로 `/blog/images/...` 형태의 절대 경로를 직접 써야 한다.

## 템플릿 구조

### 레이아웃 계층

```
layout.ejs
├── _partial/head.ejs      # <head> (메타, CDN, 스타일시트)
├── _partial/header.ejs    # 블로그 헤더 (프로필, 타이틀)
├── body (페이지별 템플릿)
│   ├── index.ejs          # 홈/아카이브 → posts.ejs + pagination.ejs
│   └── post.ejs           # 포스트 상세 → meta, tags, navigation
├── _partial/footer.ejs    # 푸터
└── _partial/bottom.ejs    # 스크립트 (KaTeX, GA, Disqus)
```

### 포스트 목록 썸네일 로직 (`posts.ejs`)

목록 페이지에서 썸네일 이미지를 다음 우선순위로 결정한다:

1. front matter의 `cover` 값이 있으면 → `images/{slug}/{cover}` 사용
2. 없으면 → 본문 HTML에서 첫 번째 `<figure>` 내 `<img src>`를 정규식으로 추출
3. 둘 다 없으면 → 썸네일 없이 표시

### 포스트 네비게이션 (`navigation.ejs`)

이전/다음 포스트 링크를 표시한다. Hexo의 `page.prev`/`page.next`는 시간순 기준이므로:

- `page.prev` → "Next Post" 라벨 (더 새로운 글)
- `page.next` → "Previous Post" 라벨 (더 오래된 글)

### TOC (목차)

Hexo 내장 `toc()` 헬퍼로 자동 생성된다. 포스트에 heading이 있으면 표시되고 없으면 생략된다.

- 데스크탑(1250px 초과): 오른쪽 사이드바에 sticky로 표시
- 그 이하: 본문 위에 일반 블럭으로 표시

## 스타일 구조

### 라이트 모드 (`style.css`)

`#faf8f5` 크림 배경에 테라코타(`#c4623a`) 액센트 컬러를 사용하는 따뜻한 톤.

### 다크 모드 (`dark.css`)

`prefers-color-scheme: dark` 미디어 쿼리로 자동 적용. `#0f172a` 배경에 블루(`#60a5fa`) 액센트. 토글 UI 없이 OS 설정에 따라 자동 전환된다.

### 반응형 브레이크포인트

| 브레이크포인트 | 적용 내용 |
|-------------|----------|
| `1250px` 이상 | TOC 사이드바 sticky 표시 |
| `1249px` 이하 | TOC가 본문 위로 이동 |
| `768px` 이하 | 코드 블럭/이미지/alert full-bleed 확장, 레이아웃 축소 |
| `480px` 이하 | 모바일 최적화 (폰트 축소, 간격 축소) |

### TOC 하이라이트 (`script.js`)

`IntersectionObserver`로 현재 보고 있는 섹션의 TOC 링크에 `.is-active` 클래스를 토글한다. 뷰포트 1250px 초과에서만 동작.

## 배포

```bash
npx hexo deploy
```

`hexo-deployer-git`이 `public/` 폴더를 `gh-pages` 브랜치에 푸시한다.

- 소스: `master` 브랜치
- 배포: `gh-pages` 브랜치
- URL: `https://uyeong.github.io/blog`

## 테마 설정 (`themes/_config.yml`)

```yaml
menu:
  Home: /blog/
rss: /blog/atom.xml
email: uyeong21c@gmail.com
twitter: coderifleman
facebook: coderifleman
github: uyeong
favicon: /blog/favicon.png
google_analytics: UA-55659240-1
disqus_shortname: coderifleman
```

## 주의 사항

- **테마 위치**: `_config.yml`에서 `theme: .`으로 설정되어 있어, `themes/` 디렉토리 자체가 테마 루트다 (별도 테마 폴더 없음).
- **Hexo 태그 중첩 불가**: `{% alert %}` 안에 `{% figure %}`나 `{% codeblock %}`을 넣을 수 없다. alert 내 이미지는 `<figure>` HTML을, 코드는 `<pre><code class="language-xx">` HTML을 직접 작성해야 한다.
- **이미지 경로 규칙**: `{% figure %}` 태그는 `url_for()` 헬퍼를 거쳐 자동으로 `/blog/` 루트를 붙여주지만, 마크다운 이미지 문법에서는 `/blog/images/...` 절대 경로를 직접 써야 한다.
- **`public/`, `.deploy_git/`, `db.json`**은 `.gitignore`에 포함되어 있다.
