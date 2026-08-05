# Plugin Platform Changelog

Plugin Platform 변경사항은 앱 릴리스 노트와 별도로 기록합니다. 앱 설치 파일 배포 없이 문서나 카탈로그 정책만 바뀌는 경우도 여기에 남깁니다.

## v0.3.0 - 2026-08-05

- DAP v1.4.1의 OAuth 연결 API인 `ctx.host.oauth`와 `oauth.connect` 권한을 추가했습니다. 플러그인은 access token을 Host에서 요청하며 refresh token이나 자격증명 저장소를 직접 다루지 않습니다.
- 연결된 AI 서비스 상태를 확인하는 `ctx.host.connectors`와 `connectors.read` 권한을 추가했습니다.
- `surface_slots: [briefing.daily]`와 `ctx.briefing.contribute()`를 추가해 Todo·Calendar 같은 플러그인이 데일리 브리핑에 짧은 요약을 기여할 수 있습니다.
- 새 API는 기존 manifest v2를 깨지 않는 선택 기능이므로 `manifest_version: 2`를 유지합니다. 전체 0.3 API 기준 최소 앱 버전은 DAP `v1.4.1`입니다.

## v0.2.0 - 2026-07-29

- manifest v2 호환을 유지하면서 `surface_slots: [tray_panel]`과 `ctx.trayPanel.register()` 계약을 문서화했습니다.
- `ctx.trayMenu`의 명시적 `showInContextMenu`, 동적 submenu `update()`, 래디얼 아이콘·사용자 재정의 규칙을 반영했습니다.
- `ctx.aiContext`, 선언형 설정 `range`와 `ctx.host.settings.set()`을 추가했습니다.
- `presentation.overlay`, `meeting.capture`, `ai.accounts`, `image.generate`, `dragdrop.export` 권한과 Host API를 추가했습니다.
- 팔레트·트레이 페이지의 `dap-plugin://` 경로 제한, 외부 네트워크 차단, JSON 메시지 한도를 명확히 했습니다.
- 공식 카탈로그 설치가 공개 GitHub 저장소의 개별 파일 다운로드이며, 설치 즉시 활성화·업데이트 상태/저장소 보존·권한 증가 시 재동의라는 현행 동작을 반영했습니다.
- AI 컨텍스트의 잘못된 `ctx.commands.registerCommand`와 `{ dispose() {} }` 예시를 현행 `addCommand` backend 계약과 cleanup 함수로 수정했습니다.
- 전체 0.2 API의 최소 앱 버전은 DAP `v1.3.13`; `manifest_version`은 계속 `2`입니다.

## v0.1.0 - 2026-07-05

Initial baseline.

- Manifest v2 기준 개발문서 구조를 정리했습니다.
- `ctx.actions`, `ctx.commands`, `ctx.settings`, menu, shortcut, host service 문서화를 시작했습니다.
- 플러그인 플랫폼 변경 시 문서와 버전을 같이 갱신하는 관리 구조를 추가했습니다.
- 카탈로그 등록 흐름은 `Project-Undonghae/dap-plugins`의 `plugin_catalog.json`을 기준으로 정했습니다.
