# DAP Plugin Platform Change Management

이 문서는 DAP(mydeskpet) 안의 플러그인 관련 기능, manifest, host API, 설치/카탈로그 흐름이 바뀔 때 개발문서와 버전을 같이 관리하기 위한 기준입니다.

## 관리 단위

플러그인 변경은 네 가지 버전을 분리해서 봅니다.

| 단위 | 위치 | 언제 바꾸나 |
| --- | --- | --- |
| DAP 앱 버전 | `downloads/index.json`, GitHub Release | 앱 설치 파일이 새로 배포될 때 |
| Plugin Platform 버전 | `docs/plugin-platform/version.json` | 플러그인 개발자가 의존하는 API, 권한, 설치/배포 흐름이 바뀔 때 |
| Manifest 버전 | `plugin.yaml`의 `manifest_version`, 개발문서 | manifest 해석 방식이 호환되지 않게 바뀔 때 |
| 개별 플러그인 버전 | 각 플러그인 `plugin.yaml`, `dap-plugins/plugin_catalog.json`의 `ref` | 해당 플러그인 자체 기능이 바뀔 때 |

## 변경 분류

| 변경 유형 | 문서 갱신 | 버전 처리 |
| --- | --- | --- |
| 새 host API, 새 permission, 새 manifest 선택 필드 | `developers.html`, `docs/plugin-platform/changelog.md` | Plugin Platform minor |
| 기존 API 동작 보강, 오류 메시지 개선, 문서 예시 수정 | 관련 문서와 changelog | Plugin Platform patch |
| 기존 API 제거, 인자 변경, 권한 필수화, manifest 필수 필드 변경 | 개발문서 전체, migration note, changelog | Plugin Platform major 또는 `manifest_version` 증가 |
| plugin catalog 필드 추가/변경 | `plugins.html` 등록 안내, fallback 데이터, catalog 예시 | Plugin Platform minor 또는 major |
| 개별 플러그인 등록/업데이트만 변경 | `plugins.html` fallback 필요 여부, catalog PR | 개별 플러그인 버전만 변경 |

## 필수 갱신 파일

플러그인 플랫폼 변경 PR은 아래 파일을 함께 확인합니다.

- `developers.html`: 한국어와 `?lang=en` 영어를 제공하는 공개 개발자 문서. Quickstart, manifest, API reference, distribution, troubleshooting을 두 언어에서 함께 최신 상태로 유지합니다.
- `docs/plugin-platform/version.json`: 현재 Plugin Platform 버전과 호환성 메타데이터를 기록합니다.
- `docs/plugin-platform/changelog.md`: 개발자에게 의미 있는 변경사항을 날짜와 버전으로 기록합니다.
- `docs/plugin-platform/release-checklist.md`: PR 작성자가 변경 유형별 누락을 점검합니다.
- `plugins.html`: 카탈로그 필드, 표시 항목, 등록 절차가 바뀐 경우 갱신합니다.

## 버전 규칙

Plugin Platform은 SemVer를 따릅니다.

- `major`: 기존 플러그인 코드 또는 manifest가 수정 없이 동작하지 않을 수 있는 변경.
- `minor`: 기존 플러그인을 깨지 않고 새 API, 권한, manifest 필드, 배포 기능을 추가하는 변경.
- `patch`: 문서 보강, 예시 수정, 버그 수정처럼 개발자 계약을 바꾸지 않는 변경.

`manifest_version`은 SemVer가 아닙니다. manifest 파서나 필수 필드의 의미가 호환되지 않게 바뀔 때만 정수로 올립니다. 단순 선택 필드 추가는 기존 manifest를 깨지 않으므로 `manifest_version`을 유지합니다.

## PR 기준

플러그인 관련 변경 PR은 다음 문장을 기준으로 판단합니다.

> 플러그인 개발자가 이 변경을 알아야 하는가?

답이 "예"라면 공개 개발문서와 changelog를 갱신합니다. 답이 "아니오"라도 내부 구현이 API 동작에 영향을 줄 가능성이 있으면 release checklist에 근거를 남깁니다.

## 릴리스 순서

1. 코드 또는 카탈로그 변경을 작성합니다.
2. 변경 유형을 `major`, `minor`, `patch`, `docs-only`, `plugin-only` 중 하나로 분류합니다.
3. `developers.html`의 관련 섹션을 업데이트합니다.
4. `docs/plugin-platform/version.json`과 `docs/plugin-platform/changelog.md`를 업데이트합니다.
5. breaking change가 있으면 migration note를 changelog에 추가합니다.
6. PR 템플릿의 Plugin Platform 체크리스트를 채웁니다.
