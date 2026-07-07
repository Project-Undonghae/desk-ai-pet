# Plugin Platform Changelog

Plugin Platform 변경사항은 앱 릴리스 노트와 별도로 기록합니다. 앱 설치 파일 배포 없이 문서나 카탈로그 정책만 바뀌는 경우도 여기에 남깁니다.

## v0.1.1 - 2026-07-08

Documentation patch.

- DAP v1.2.6 기준으로 최소 앱 버전과 AI용 문서 예시를 갱신했습니다.
- 명령 등록 예시를 현행 `ctx.commands.addCommand` API로 정정했습니다.
- AI가 플러그인 생성 시 오래된 명령 등록 API를 사용하지 않도록 안내를 수정했습니다.

## v0.1.0 - 2026-07-05

Initial baseline.

- Manifest v2 기준 개발문서 구조를 정리했습니다.
- `ctx.actions`, `ctx.commands`, `ctx.settings`, menu, shortcut, host service 문서화를 시작했습니다.
- 플러그인 플랫폼 변경 시 문서와 버전을 같이 갱신하는 관리 구조를 추가했습니다.
- 카탈로그 등록 흐름은 `Project-Undonghae/dap-plugins`의 `plugin_catalog.json`을 기준으로 정했습니다.
