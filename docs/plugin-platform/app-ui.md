# DAP App UI System v1

공개 문서 기준: DAP 1.6.15+ (앱 보관함), 1.6.17+ (검색형 앱 찾기). Plugin Platform 0.4 / manifest v2 계약을 유지합니다.

DAP 안에서 열리는 설치형 앱을 위한 UI 계약이다. palette 창과 Tray Hub 위젯에는 호스트가
이 시스템을 자동으로 주입하므로 앱이 색상 파일이나 외부 폰트를 따로 포함할 필요가 없다.

## 적용 범위

- `ctx.host.windows.openPalette()`로 여는 앱 창
- `ctx.trayPanel.register()`로 표시하는 Tray Hub 위젯
- 제외: presentation/판서/투명 canvas 표면

문서에는 다음 표식이 자동으로 붙는다.

```html
<html data-dap-app-ui="1" data-dap-surface="palette">
```

기존 앱 CSS는 그대로 우선한다. 자동 계층은 토큰, 시스템 글꼴, 키보드 포커스, 스크롤바,
다크 모드와 reduced-motion 품질 하한을 제공한다.

## 권장 앱 셸

아래 공통 셸을 palette와 tray 페이지에 사용할 수 있습니다. 본체 소스의 `plugins/templates/app-ui-v1/`에도 두 형태의 템플릿이 있습니다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>할 일</title>
  </head>
  <body>
    <main class="dap-app">
      <header class="dap-app-header">
        <div class="dap-app-title">
          <h1>할 일</h1>
          <p>오늘 해야 할 일을 정리합니다</p>
        </div>
        <button class="dap-button dap-button--ghost dap-button--icon" type="button" aria-label="닫기">×</button>
      </header>

      <section class="dap-app-content dap-stack" aria-label="할 일 목록">
        <div class="dap-card">콘텐츠</div>
      </section>

      <footer class="dap-app-footer">
        <button class="dap-button" type="button">취소</button>
        <button class="dap-button dap-button--primary" type="button">할 일 추가</button>
      </footer>
    </main>
  </body>
</html>
```

프레임 없는 palette에서는 `.dap-app-header`가 창 이동 영역이다. 그 안의 버튼·입력·링크는
자동으로 조작 가능한 `no-drag` 영역이 된다.

## 제공 요소

| 역할 | 클래스 |
|---|---|
| 앱 구조 | `.dap-app`, `.dap-app-header`, `.dap-app-title`, `.dap-app-content`, `.dap-app-footer` |
| 배치 | `.dap-stack`, `.dap-row`, `.dap-grid` |
| 표면 | `.dap-card` |
| 버튼 | `.dap-button`, `--primary`, `--ghost`, `--danger`, `--icon` |
| 폼 | `.dap-field`, `.dap-label`, `.dap-input`, `.dap-select`, `.dap-textarea`, `.dap-help` |
| 탭 | `.dap-tabs`, `.dap-tab` + `aria-selected` 또는 `aria-pressed` |
| 상태 | `.dap-empty`, `.dap-status`, `--success`, `--warning`, `--danger`, `.dap-skeleton` |

비동기 상태 문구에는 `role="status" aria-live="polite"`, 실패에는 상황에 따라
`role="alert"`를 사용한다. 아이콘 전용 버튼에는 반드시 `aria-label`을 준다.

## 토큰

본체와 같은 `--dap-*` 의미 토큰을 제공한다.

- 색: `--dap-color-bg`, `surface`, `surface-2`, `border`, `text`, `text-muted`, `accent`
- 상태: `--dap-color-info|success|warning|danger`와 각 `-soft`
- 간격: `--dap-space-1..6`
- 모서리: `--dap-radius-xs|sm|md|lg|window|pill`
- 컨트롤: `--dap-control-h-compact|control-h|control-h-lg`
- 모션: `--dap-motion-fast|default`, `--dap-ease`

앱 이름을 붙인 색상 토큰 대신 의미 토큰을 사용한다. 브랜드 색이 꼭 필요하면 강조색 1개와
아이콘·일러스트에만 제한하고, 텍스트·배경·경계·상태는 DAP 토큰을 유지한다.

## 품질 기준

1. palette는 최소 너비 320px에서도 가로 스크롤이 없어야 한다.
2. 마우스 없이 모든 기능을 조작할 수 있어야 한다.
3. light/dark, 빈 데이터, 로딩, 실패, 매우 긴 이름을 각각 확인한다.
4. `transition: all`, 포커스 표시 없는 `outline: none`, 동작하는 `div`/`span`을 사용하지 않는다.
5. 드래그·스와이프에는 클릭 또는 키보드 대체 동작을 제공한다.
6. 앱 배포 전 `pnpm app-ui:check <앱 폴더>`를 실행한다.

## 호환 정책

App UI System v1은 기존 플러그인의 manifest 계약을 바꾸지 않습니다. 공개 플러그인은 manifest v2를 유지하며, 기존 앱은 자동 foundation만 받고 점진적으로 공통 클래스로 이전할 수 있습니다.

`pnpm app-ui:check <앱 폴더>`는 본체 소스 저장소의 `app/`에서 실행하는 제작자용 검사입니다. 사용자가 앱을 설치할 때 실행하는 빌드 단계가 아닙니다.

## 앱 찾기에 노출하기 (DAP 1.6.17+)

공식 `plugin_catalog.json`의 선택 필드 `category`를 사용합니다. 앱 찾기는 이름·설명·ID·카테고리 표시명을 검색하며, 알 수 없는 카테고리도 검색 대상에 남깁니다. `utility`, `productivity`, `communication`, `creativity`는 각각 도구·생산성·소통·창작으로 표시합니다. `category`가 없으면 기타로 묶습니다.

사용자는 앱 보관함의 가방 아이콘 → 앱 찾기에서 검색하고, 받기 → 버전·권한 미리보기 → 받기로 설치합니다. 내 앱에서는 설정·업데이트·활성 상태를 관리하고, 웹 · 프로그램에서는 사용자 바로가기를 관리합니다. 사용자 화면의 앱은 기술적으로 기존 플러그인 패키지이며, `plugin.yaml`, `activate(ctx)`와 Host API 이름은 바뀌지 않습니다.

문서 근거: 본체 `f7cce04af8`의 `docs/APP_UI_SYSTEM.md`, `docs/PLUGIN_API.md`, `app-store-view.ts` 및 `quick-menu-view.ts`. 공개 설치본: [v1.6.17](https://github.com/Project-Undonghae/desk-ai-pet/releases/tag/v1.6.17).
