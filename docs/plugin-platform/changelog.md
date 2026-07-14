# Plugin Platform Changelog

Plugin Platform 변경사항은 앱 릴리스 노트와 별도로 기록합니다. 앱 설치 파일 배포 없이 문서나 카탈로그 정책만 바뀌는 경우도 여기에 남깁니다.

## v0.2.0 - 2026-07-14

Backward-compatible API and documentation update.

- DAP v1.3.2 기준으로 앱 릴리스 메타데이터를 갱신했습니다.
- `presentation.overlay` 권한과 `ctx.host.presentation` 오버레이 API를 문서화했습니다. 이 API는 DAP v1.2.2부터 지원합니다.
- 플러그인 설정의 `range` 필드와 `min`, `max`, `step`, `unit` 규칙을 문서화했습니다. 이 필드는 DAP v1.2.10부터 지원합니다.
- `activate(ctx)` 정리 예시를 실제 호스트 계약인 cleanup 함수 반환 형태로 정정했습니다.
- 트레이에는 활성화된 모든 플러그인이 표시되며, 등록된 트레이 액션이 없으면 설정을 여는 현행 동작을 명시했습니다.
- `manifest_version: 2`는 새 플러그인 권장값이며, 호환성을 위해 파서가 필드 없는 기존 manifest도 허용한다는 점을 명확히 했습니다.

## v0.1.1 - 2026-07-08

Documentation patch.

- DAP v1.2.6 기준으로 당시 최소 앱 버전과 AI용 문서 예시를 갱신했습니다.
- 명령 등록 예시를 현행 `ctx.commands.addCommand` API로 정정했습니다.
- AI가 플러그인 생성 시 오래된 명령 등록 API를 사용하지 않도록 안내를 수정했습니다.

## v0.1.0 - 2026-07-05

Initial baseline.

- Manifest v2 기준 개발문서 구조를 정리했습니다.
- `ctx.actions`, `ctx.commands`, `ctx.settings`, menu, shortcut, host service 문서화를 시작했습니다.
- 플러그인 플랫폼 변경 시 문서와 버전을 같이 갱신하는 관리 구조를 추가했습니다.
- 카탈로그 등록 흐름은 `Project-Undonghae/dap-plugins`의 `plugin_catalog.json`을 기준으로 정했습니다.
