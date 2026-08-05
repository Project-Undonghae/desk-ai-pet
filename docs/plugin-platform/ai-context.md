# DAP Plugin AI Context

Use this file when an AI coding assistant creates or modifies a DAP plugin.

Contract baseline: Plugin Platform `0.3.0`, `manifest_version: 2`, full API requires DAP `>=1.4.1`.
The complete source of truth is `mydeskpet/docs/PLUGIN_API.md`; never invent an API that is not documented here or there.

## Required output

Return:

- `plugin.yaml`
- a self-contained ESM entry file, normally `dap_<plugin_name>/plugin.mjs`
- optional static UI files such as `palette/index.html` or `tray/index.html`
- every required permission and why it is needed
- local install steps
- known limitations and platform requirements

## Runtime and trust model

- The current runtime is Electron + TypeScript. Python/PyQt plugin examples are historical.
- A plugin entry is trusted in-process main-process code. `permissions[]` controls user consent and Host API exposure; it is not a process sandbox.
- DAP installs only reviewed plugins from the official `Project-Undonghae/dap-plugins` catalog. Arbitrary install URLs are unsupported.
- The entry `.mjs` must be self-contained. Bundle dependencies before publishing; do not ship bare npm imports or require an install/build step on the user's machine.
- Registration handles are tracked by the host and disposed in reverse order on disable or activation failure.
- `activate(ctx)` may return a cleanup function for timers, listeners, palettes, captures, and other external resources. Do not return `{ dispose() {} }`.

## Minimal file tree

```text
my-plugin/
  plugin.yaml
  dap_my_plugin/
    plugin.mjs
  README.md
```

Optional UI:

```text
  palette/index.html
  tray/index.html
```

## Manifest contract

```yaml
id: com.example.my_plugin
name: My Plugin
version: 1.0.0
manifest_version: 2
entry: dap_my_plugin.plugin:activate
description: Short user-facing description
author: Your Name
min_app_version: "1.4.1"
surface: user
permissions: []
execution_modes:
  - user
```

Allowed fields:

- required: `id`, `name`, `version`, `entry`
- optional: `description`, `author`, `min_app_version`, `manifest_version`, `surface`, `permissions`, `execution_modes`, `context_contributors`, `surface_slots`
- `surface` is `user` by default; `dev` is discovered only in development builds
- use `surface_slots: [tray_panel]` for `ctx.trayPanel`
- use `surface_slots: [briefing.daily]` before calling `ctx.briefing.contribute(...)`
- declare each `ctx.aiContext` contribution id in `context_contributors`
- extra fields are rejected
- do not put commands, matchers, callbacks, or backends in YAML
- `entry: dap_my_plugin.plugin:activate` resolves to the named `activate` export in `dap_my_plugin/plugin.mjs`
- catalog id and manifest id must match

## Minimal entry

```js
export function activate(ctx) {
  ctx.actions.registerAction({
    id: "hello",
    callback: () => {
      ctx.host.bubble.speak("Hello from plugin");
      return "Hello from plugin";
    },
  });

  ctx.radialMenu.addItem({
    itemId: "hello",
    label: "Hello",
    actionId: "hello",
    priority: 50,
  });

  return () => {
    // Clean up timers, listeners, palettes, captures, or other resources.
  };
}
```

## Contribution namespaces

### Actions

Use actions for work invoked by tray, radial, shortcut, selection, or another host surface.

```js
ctx.actions.registerAction({
  id: "polish",
  callback: async (payload) => {
    const text = String(payload?.text ?? "").trim();
    if (!text) return "다듬을 텍스트가 없어요.";
    return ctx.host.llm.generate(`다음 문장을 자연스럽게 다듬어줘:\n${text}`, 30);
  },
});
```

### Commands

Commands use matchers plus a builtin or CLI backend. There is no `ctx.commands.registerCommand` callback API.

```js
ctx.commands.addCommand({
  id: "weather",
  title: "날씨",
  matchers: [{ type: "keyword", patterns: ["날씨", "weather"], priority: 40 }],
  backend: { type: "builtin", handler: "dap.weather.current" },
});
```

Matcher types: `label_exact`, `label_prefix`, `keyword`, `prefix`, `regex`.
Lower `priority` runs first. Backends are `{ type: "builtin", handler }` or
`{ type: "cli", mode: "hub"|"cli_tool"|"category", tool?, category? }`.
Prefer an action unless natural-language routing is required.

### Settings

```js
ctx.settings.registerSettingsSection({
  sectionId: "general",
  title: "My Plugin",
  spec: { fields: [
    { key: "enabled", label: "사용", type: "toggle", default: true },
    { key: "mode", label: "모드", type: "select", default: "fast",
      options: [{ value: "fast", label: "빠르게" }] },
    { key: "note", label: "메모", type: "text" },
    { key: "size", label: "크기", type: "range", default: 50,
      min: 10, max: 100, step: 5, unit: "%" },
  ] },
});

const values = ctx.host.settings.values("general");
ctx.host.settings.set("general", "enabled", false);
```

Field types: `toggle`, `select`, `text`, `range`.

### Tray and radial menu

```js
ctx.trayMenu.addItem({
  itemId: "open",
  label: "My Plugin 열기",
  actionId: "open",
  showInContextMenu: true,
});

ctx.radialMenu.addItem({
  itemId: "open",
  label: "My Plugin",
  actionId: "open",
  priority: 50,
  icon: "icon.png",
});
```

Only tray items with `showInContextMenu: true` appear in the current DAP tray hub.
Radial icons are plugin-relative files up to 512KB; if omitted, DAP uses a first-letter avatar.
Do not reuse the DAP app icon for a plugin.

Tray registrations support safe declarative `submenu` rows and `registration.update({ submenu })`.
One menu is limited to 16 rows and 160 characters per label.

### Tray panel

Requires `permissions: [window.palette]` and `surface_slots: [tray_panel]`.

```js
const panel = ctx.trayPanel.register({
  id: "status",
  page: "tray/index.html",
  height: 210,
  priority: 10,
});
const offPanel = panel.onMessage((message) => {
  if (message?.type === "refresh") refresh();
});
panel.postMessage({ type: "status", items });
```

- allowed height is 120–420px; 120–240px is recommended
- the page runs in a path-scoped, external-network-blocked `dap-plugin://` iframe
- no Node, DAP IPC, or parent DOM access
- messages must be JSON-like and no larger than 64KB
- use a palette for detailed UI

### AI context

```yaml
context_contributors: [recent_items]
```

```js
ctx.aiContext.contribute({
  id: "recent_items",
  provider: async () => "최근 항목 요약",
});
```

The id must be declared in the manifest. Providers have a 300ms budget, about 300 characters per
contributor, and about 800 characters across the plugin block.

## Host services

Always available:

- `ctx.host.clipboard.readText()` / `writeText(text)`
- `ctx.host.bubble.speak(text)`
- `ctx.host.hotkey.register(accelerator, callback)` / `unregister(accelerator)`
- `ctx.host.llm.generate(prompt, timeoutS?)`
- `ctx.host.settings.values(sectionId)` / `set(sectionId, key, value)`
- `ctx.host.events`

Permission-gated:

| Permission | Service | Purpose |
| --- | --- | --- |
| `storage.private` | `ctx.host.storage` | isolated JSON and blob storage |
| `clipboard.history` | `ctx.host.clipboardHistory` | sensitive clipboard history; user opt-in defaults OFF |
| `window.palette` | `ctx.host.windows` | sandboxed palette windows and tray-panel UI |
| `input.synthesize` | `ctx.host.paste` | paste into the previous foreground app |
| `presentation.overlay` | `ctx.host.presentation` | transparent presentation overlay |
| `meeting.capture` | `ctx.host.meeting` | meeting capture status and transcript events |
| `ai.accounts` | `ctx.host.aiAccounts` | account and normalized subscription-usage metadata |
| `image.generate` | `ctx.host.imageGen` | Codex-provider PNG generation |
| `oauth.connect` | `ctx.host.oauth` | Host-managed OAuth connect, status, access-token, and disconnect flow |
| `connectors.read` | `ctx.host.connectors` | Read-only status for the Gmail connector |

Other permission tokens:

- `clipboard.read` / `clipboard.write`: install-time disclosure; clipboard namespace is currently always available
- `dragdrop.export`: enables `window.dapPalette.startDragExport` and `startDragFiles`

Request the smallest permission set. Unknown tokens are ignored, not granted.
Do not invent a generic network permission; plugin palette/tray pages have external networking blocked.

### Daily briefing and connected services

Declare `surface_slots: [briefing.daily]`, then register a short, fast provider with `ctx.briefing.contribute({ id, provider })`. Return a single user-facing line for today's briefing and perform no interactive OAuth work inside the provider.

OAuth plugins declare `oauth.connect` and use `ctx.host.oauth.status(connectionId)`, `connect({ connectionId, provider, scopes })`, `accessToken(connectionId)`, and `disconnect(connectionId)`. DAP owns the browser flow and protected credential storage; plugins never receive refresh tokens.

Plugins declaring `connectors.read` can currently call only `ctx.host.connectors.status("gmail")`. It returns `{ state, via, hint }`, where `state` is `"connected"`, `"unavailable"`, or `"unknown"`. Treat only explicit `unavailable` as blocking and show the Host-provided `hint`. `unknown` means the probe itself could not determine status, so fall through to the existing behavior instead of telling the user to reconnect.

## Palette contract

Requires `window.palette`.

```js
const palette = ctx.host.windows.openPalette({
  page: "palette/index.html",
  width: 360,
  height: 520,
  frame: false,
  closeOnPetDrop: true,
});
palette.show();
palette.postMessage({ type: "items", items });
const off = palette.onMessage((message) => {});
```

The palette page receives only `window.dapPalette`:

- `postMessage(message)`
- `onMessage(callback)`
- `close()`
- `startDragExport(blobUrl)` and `startDragFiles(paths)` when `dragdrop.export` is declared

Palette pages are sandboxed, path-scoped to the plugin root, and blocked from external networks.
Perform privileged work in the main-side plugin entry and exchange JSON messages.
Use native HTML5 `dataTransfer.setData("text/plain", text)` for text drag-out.

## Sensitive-service rules

- `clipboard.history` remains empty until the user separately opts in. Plugins cannot enable collection.
- `meeting.capture` must call `ctx.host.meeting.capabilities()` before `start()`, support unavailable reasons,
  clean up status/transcript listeners, and stop capture on cleanup.
- `ai.accounts` returns display metadata and normalized usage only. It never exposes tokens, cookies, keychain
  values, auth paths, or raw CLI output.
- `image.generate` is Codex-provider-only, can take 1–3 minutes, consumes the user's subscription quota, and
  returns `{ bytes: Uint8Array, mime: "image/png", name }`. Store/display the result yourself.
- macOS paste can require Accessibility permission; meeting capture can require microphone/system-audio permission.

## Install and distribution

Local paths:

```text
Windows: %APPDATA%\dap\plugins\<id>\
macOS:   ~/Library/Application Support/dap/plugins/<id>/
```

For public distribution:

1. Put `plugin.yaml` at the root of a public GitHub repository.
2. Ship a self-contained `.mjs`; users do not run git, npm install, or a build.
3. Increase the manifest `version` for every release and create a version tag.
4. Add a catalog entry to `Project-Undonghae/dap-plugins/plugin_catalog.json`.

```json
{
  "id": "com.example.my_plugin",
  "name": "My Plugin",
  "description": "One-line description",
  "category": "productivity",
  "repo": "owner/dap-my-plugin",
  "ref": "v1.0.0"
}
```

Catalog rules:

- required: `id`, `repo`; optional: `name`, `description`, `category`, `ref`
- `repo` accepts `owner/name` or a GitHub URL
- `ref` accepts a branch, tag, or SHA; version tags are recommended
- manifest id and catalog id must match
- installer limit: 200 files and 20MB; `.git`, `.github`, and `node_modules` are excluded
- install is an explicit trust action and activates immediately unless the id was previously disabled
- updates preserve plugin storage and enabled/disabled state; newly added permissions require fresh consent
- arbitrary URL installation is unsupported

## Validation checklist

- `plugin.yaml` has only allowed fields.
- `entry` resolves to an existing `.mjs` named export.
- the `.mjs` is self-contained and has no bare imports.
- every used permission-gated Host API has the matching token.
- `activate(ctx)` does not throw and returns a cleanup function when needed.
- palette/tray pages stay inside the plugin root and use only their documented message bridge.
- sensitive services implement their required opt-in or capability gate.
- disabling the plugin removes every contribution and stops listeners, windows, captures, and timers.

## Prompt template

```text
Read https://project-undonghae.github.io/desk-ai-pet/llms.txt
and create a DAP plugin that [describe the feature].

Return plugin.yaml, a self-contained ESM entry file, required permissions with reasons,
local install steps, known limitations, and any optional palette/tray static files.
Follow manifest_version: 2 and Plugin Platform 0.3.0. Do not invent Host APIs.
```
