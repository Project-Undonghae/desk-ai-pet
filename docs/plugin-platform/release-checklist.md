# Plugin Platform Release Checklist

플러그인 관련 변경을 병합하기 전에 이 목록을 확인합니다.

## 변경 분류

- [ ] 이 변경은 플러그인 개발자가 알아야 하는 변경이다.
- [ ] 변경 유형을 정했다: `major`, `minor`, `patch`, `docs-only`, `plugin-only`.
- [ ] breaking change 여부를 확인했다.
- [ ] 개별 플러그인 버전 변경인지, Plugin Platform 버전 변경인지 분리했다.

## 문서

- [ ] `developers.html`의 Quickstart, manifest, API reference, distribution, troubleshooting 중 관련 섹션을 갱신했다.
- [ ] `developers.html`의 한국어와 `?lang=en` 영어 문서가 같은 섹션·API·예제를 제공하는지 확인했다.
- [ ] `plugins.html`의 등록 안내, catalog field 설명, fallback data 갱신 필요 여부를 확인했다.
- [ ] `docs/plugin-platform/changelog.md`에 변경 내용을 추가했다.
- [ ] breaking change가 있으면 migration note를 추가했다.
- [ ] 예시 코드가 현재 manifest/API 형태와 맞는지 확인했다.
- [ ] `docs/plugin-platform/ai-context.md`의 명령 등록과 cleanup 예시가 현행 lifecycle API와 맞는지 확인했다.
- [ ] 새 `ctx.*`, Host service, permission이 한국어/영어에 동일한 순서와 가용성 조건으로 설명됐다.

## 버전

- [ ] `docs/plugin-platform/version.json`의 `plugin_platform_version`을 규칙에 맞게 조정했다.
- [ ] `manifest_version` 변경이 필요한지 확인했다.
- [ ] 최소 지원 DAP 앱 버전이 바뀌면 `minimum_dap_version`을 갱신했다.
- [ ] 앱 설치 파일 배포가 필요한 변경이면 `downloads/index.json`과 GitHub Release 버전 관리가 별도로 필요함을 확인했다.

## 호환성

- [ ] 기존 manifest v2 플러그인이 계속 로드되는지 확인했다.
- [ ] 새 permission이 추가된 경우 opt-in과 문서 설명이 일치한다.
- [ ] capability-gated API(예: 회의 캡처)를 항상 사용 가능한 기능처럼 문서화하지 않았다.
- [ ] `context_contributors`와 `ctx.aiContext.contribute()` id가 서로 일치한다.
- [ ] 트레이 하위 메뉴는 등록 핸들의 `update()`로만 갱신하며 최대 행/라벨 제한을 확인했다.
- [ ] catalog schema가 바뀐 경우 이전 catalog entry 처리 방식을 정했다.
- [ ] 사용자에게 영향이 있는 변경은 changelog에 사용자 관점의 설명을 남겼다.
