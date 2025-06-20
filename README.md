# Electron + NextJS + Express

## 프로젝트 클론 방법

1. `electron-main` Repository - git clone
2. 내부 서브모듈 초기화 및 업데이트 - `git submodule update --init --recursive`

## 설치

node -v `22.14.0`

- `npm i`

## 실행 및 빌드

- dev 실행: `npm run dev`
- 빌드: `npm run dist`
- 윈도우 설치형 exe 생성 - `npm run pack:win`
- Mac 빌드 후 실행 방법 - `npm run dist` -> dist/mac-arm64/app 실행
