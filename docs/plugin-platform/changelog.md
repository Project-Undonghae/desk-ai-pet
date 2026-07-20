# Plugin Platform Changelog

Plugin Platform 변경사항은 앱 릴리스 노트와 별도로 기록합니다. 앱 설치 파일 배포 없이 문서나 카탈로그 정책만 바뀌는 경우도 여기에 남깁니다.

## v0.2.0 - 2026-07-20

DAP v1.3.9 호환 기준의 하위 호환 기능 추가입니다. 기존 manifest v2 플러그인은 계속 로드됩니다.

- `ctx.aiContext.contribute()`와 manifest `context_contributors` 선언을 공개 문서에 추가했습니다.
- `ctx.trayMenu.addItem()` 등록 핸들의 `update()`로 선언형 하위 메뉴를 갱신하는 방법을 추가했습니다.
- `presentation.overlay`, `meeting.capture`, `ai.accounts`와 각 Host API를 문서화했습니다. 회의 캡처는 반드시 `capabilities()`로 사용 가능 여부를 확인해야 합니다.
- 현행 manifest의 전체 허용 필드와 현행 Host service/권한 대응을 갱신했습니다.
- 명령 등록 API를 `ctx.commands.addCommand()`로, 비활성화 정리 규약을 cleanup 함수 반환으로 바로잡았습니다.
- Plugin Platform은 `0.2.0`으로 올렸지만 manifest 해석 규약은 호환되므로 `manifest_version: 2`를 유지합니다.

## v0.1.0 - 2026-07-05

Initial baseline.

- Manifest v2 기준 개발문서 구조를 정리했습니다.
- `ctx.actions`, `ctx.commands`, `ctx.settings`, menu, shortcut, host service 문서화를 시작했습니다.
- 플러그인 플랫폼 변경 시 문서와 버전을 같이 갱신하는 관리 구조를 추가했습니다.
- 카탈로그 등록 흐름은 `Project-Undonghae/dap-plugins`의 `plugin_catalog.json`을 기준으로 정했습니다.
