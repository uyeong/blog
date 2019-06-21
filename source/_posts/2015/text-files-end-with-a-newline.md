---
title: 파일 끝에 개행을 추가해야 하는 이유
description: POSIX 명세를 근거로 파일 끝에 개행을 추가해야하는 이유를 알아보고 WebStorm IDE에서 자동으로 개행을 추가하는 방법을 소개합니다.
permalink: text-files-end-with-a-newline
date : 2015-04-04
category:
    - IDE
    - WebStorm
tags:
    - FileSystem
    - POSIX
    - UNIX
    - WebStorm
---

이 글은 예전에 사내 메일로 공유했던 내용입니다. 하지만 아직도 그 이유와 방법을 모르시는 분이 많은거 같아서 정리해 공유드립니다.

## 왜 파일 마지막에 개행을 해야할까?

이유는 [POSIX](http://ko.wikipedia.org/wiki/POSIX) 명세가 그러하기 때문입니다. 명세에는 프로세스 환경, 파일과 디렉터리 등 다양한 개념을 규격화하고 있습니다.
여기에 텍스트 파일([Definitions - 3.392 Text File](http://pubs.opengroup.org/onlinepubs/000095399/basedefs/xbd_chap03.html#tag_03_392))과 라인([Definitions - 3.205 Line](http://pubs.opengroup.org/onlinepubs/000095399/basedefs/xbd_chap03.html#tag_03_205))에 대한 규격도 정의돼 있습니다.

한번 살펴보겠습니다.

* **Definitions - 3.392 Text File** : A file that contains characters organized into one or more lines. The lines do not contain NUL characters and none can exceed {LINE_MAX} bytes in length, including the <newline> Although IEEE Std 1003.1-2001 does not distinguish between text files and binary files (See the ISO C Standard), many utilities only produce predictable or meaningful output when operating on text files. The standard utilities that have such restrictions always specify "text files"in their STDIN or INPUT FILES sections.
* **Definitions - 3.205 Line** : A sequence of zero or more non- <newline> s plus a terminating <newline>.

이 두가지 명세를 종합해보면 재미있는 사실을 알 수 있습니다.

* 행의 끝(terminating)은 개행(EOL, end-of-line)
* 텍스트 파일은 행의 집합이며 행은 반드시 개행으로 끝난다.

따라서 많은 시스템과 도구들이 이 표준을 따라 구현되어 있습니다.
이를 지키지 않을 시 예기치 않은 동작을 일으킬 수 있다는 것이죠.

특히, 파일 마지막에 개행이 없다면 파일간의 차이를 알기 어렵습니다.

{% figure file_newline.01.png 'a.html과 b.html을 하나의 문장으로 출력' '그림 1. a.html과 b.html을 하나의 문장으로 출력' %}

파일 마지막에 빈공간을 넣는다면 두 파일의 차이를 알 수 있습니다.

{% figure file_newline.02.png 'a.html과 b.html을 다른 문장으로 출력' '그림 2. a.html과 b.html을 다른 문장으로 출력' %}

컴파일러인 gcc 역시 파일의 마지막에 개행이 없다면 경고합니다.

{% figure file_newline.03.png '컴파일 에러' '그림 3. 컴파일 에러' %}

깃허브도 마찬가지군요.

{% figure file_newline.04.png '깃허브 경고' '그림 4. 깃허브 경고' %}

이런 연유로 VIM과 같은 유닉스 에디터들은 자동적으로 파일의 마지막에 개행을 추가합니다.

만약 개발자 A가 개행을 하지 않고 커밋했는데, 개발자 B의 시스템이 자동으로 개행을 한다면 저장소에는 아무 정보도 없는 개행에 대한 로그가 남게 됩니다. 따라서 파일의 맨 마지막에 개행을 하나 추가하는 것은 필수라는 사실을 알 수 있습니다.

## 웹스톰에서 자동으로 개행 추가하기 

웹스톰에서 자동으로 개행을 추가하는 방법은 아주 간단합니다.

Preferences(윈도우는 Setting)에서 Editor > General 메뉴를 클릭해 General 설정 패널을 엽니다. 그리고 하단에 Ensure line feed at file on Save 를 체크하고 저장하면 끝입니다.

{% figure file_newline.05.png 'WebStorm의 자동 개행 설정' '그림 5. WebStorm의 자동 개행 설정' %}

이상으로 웹스톰에서 자동으로 개행하는 방법에 대해 말씀 드렸습니다. 천천히 다른 에디터 환경에서도 설정하는 방법을 추가할 생각입니다. 감사합니다. 
