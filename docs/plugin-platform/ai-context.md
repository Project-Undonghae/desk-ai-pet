# DAP Plugin AI Context

Use this file when an AI coding assistant creates or modifies a DAP plugin.

## Compatibility baseline

- Plugin Platform: `0.2.0`
- DAP: `>=v1.3.9`
- Manifest: `manifest_version: 2` (unchanged stable contract)
- Documentation revision: `2026-07-20`

Older Plugin Platform `0.1.x` plugins remain compatible. Do not invent APIs from historical Python/PyQt plugin documentation; the current runtime is Electron/TypeScript.

## Required output

Return:

- `plugin.yaml`
- one self-contained ESM entry file, usually `dap_<plugin_name>/plugin.mjs`
- any plugin-owned palette or overlay pages
- required permissions and why each one is needed
- local installation steps
- assumptions, capability checks, and known limitations

The entry file must not use bare imports. Bundle dependencies into the single `.mjs` file before distribution.

## Minimal file tree

```text
my-plugin/
  plugin.yaml
  dap_my_plugin/
    plugin.mjs
  README.md
```

## Manifest rules

```yaml
id: com.example.my_plugin
name: My Plugin
version: 1.0.0
manifest_version: 2
entry: dap_my_plugin.plugin:activate
description: Short user-facing description
author: Your Name
min_app_version: "1.3.9"
surface: user
context_contributors: []
surface_slots: []
permissions: []
execution_modes:
  - user
```

Required fields are `id`, `name`, `version`, and `entry`. The manifest accepts only the fields shown above. Unknown fields are rejected. `surface_slots` is declaration metadata and is not currently consumed by the runtime.

Keep permissions empty unless the feature needs a gated Host API. Request the smallest set possible. Manifest permissions communicate consent and control Host API exposure; plugins must still come from a trusted, reviewed catalog.

## Activation and cleanup

```js
export function activate(ctx) {
  const timer = setInterval(() => {
    ctx.host.bubble.speak("Still running");
  }, 60_000);

  ctx.actions.registerAction({
    id: "hello",
    callback: () => "Hello from plugin",
  });

  // Return the cleanup function itself, not a disposable object.
  return () => {
    clearInterval(timer);
  };
}
```

DAP tracks registrations and disposes them automatically in reverse order when the plugin is disabled. Return a cleanup function only for timers, listeners, open windows, or other resources that the plugin owns. If activation throws, DAP rolls back registrations and isolates the failure.

## Contribution APIs

### Actions

```js
ctx.actions.registerAction({
  id: "open",
  callback: (payload) => {
    ctx.host.bubble.speak("Opened");
    return "Opened";
  },
});
```

### Commands

Use `ctx.commands.addCommand()`; no alternate command-registration alias is part of the public API.

```js
ctx.commands.addCommand({
  id: "weather",
  title: "Weather",
  matchers: [{ type: "keyword", patterns: ["weather", "forecast"], priority: 40 }],
  backend: { type: "cli", mode: "hub" },
});
```

Supported matcher types are `label_exact`, `label_prefix`, `keyword`, `prefix`, and `regex`. A command backend is either `builtin` or `cli`; do not replace `backend` with an undocumented callback.

### Settings, menus, and shortcuts

- `ctx.settings.registerSettingsSection(...)`
- `ctx.trayMenu.addItem(...)`
- `ctx.radialMenu.addItem(...)`
- `ctx.shortcuts.registerShortcut(...)`

`ctx.trayMenu.addItem()` returns a registration handle. DAP `>=v1.3.9` can update a safe declarative submenu through that handle:

```js
const tray = ctx.trayMenu.addItem({
  itemId: "usage",
  label: "AI usage",
  actionId: "open",
  submenu: [{ itemId: "loading", label: "Loading…", enabled: false }],
});

tray.update({
  submenu: [
    { itemId: "daily", label: "Today 25%", actionId: "open", enabled: true },
    { itemId: "separator", type: "separator" },
    { itemId: "details", label: "Open details…", actionId: "open", enabled: true },
  ],
});
```

Submenus accept labels, separators, and qualified actions, not arbitrary callbacks or Electron roles. A menu has at most 16 rows and a label at most 160 characters. Updates affect only the item owned by that registration and are ignored after disposal.

### AI context

Declare every contributor id in the manifest before registering it:

```yaml
context_contributors:
  - recent_items
```

```js
ctx.aiContext.contribute({
  id: "recent_items",
  provider: async () => "Three recent items: …",
});
```

The provider runs for each conversation turn. Keep the result to one or two summarized lines. Providers that fail or exceed about 300 ms are omitted for that turn; DAP also truncates per-contributor and total plugin context. An undeclared contributor id causes activation to fail.

## Host services and permissions

Always available Host services:

- `ctx.host.clipboard`: current clipboard text
- `ctx.host.bubble`: pet speech bubble
- `ctx.host.hotkey`: manual global hotkey registration
- `ctx.host.llm`: one generation through the active provider
- `ctx.host.settings`: saved values for this plugin's settings section
- `ctx.host.events`: pet behavior event bus

Permission-gated services:

| Permission | Service or capability | Use |
| --- | --- | --- |
| `storage.private` | `ctx.host.storage` | Isolated JSON and blob storage |
| `clipboard.history` | `ctx.host.clipboardHistory` | Opt-in clipboard history; sensitive |
| `window.palette` | `ctx.host.windows` | Sandboxed plugin palette UI |
| `input.synthesize` | `ctx.host.paste` | Paste into the previously focused app |
| `dragdrop.export` | `window.dapPalette.startDragExport/startDragFiles` | Export images or files by OS drag |
| `presentation.overlay` | `ctx.host.presentation` | Sandboxed transparent presentation overlay |
| `meeting.capture` | `ctx.host.meeting` | Meeting capture status and transcript events; sensitive |
| `ai.accounts` | `ctx.host.aiAccounts` | Display-safe account and usage metadata; sensitive |

`clipboard.read` and `clipboard.write` are disclosure tokens; the legacy `ctx.host.clipboard` namespace remains available without gating.

### Capability checks

Meeting capture must be capability-gated. Do not assume it is available:

```js
const capability = ctx.host.meeting?.capabilities();
if (!capability?.available) {
  ctx.host.bubble.speak(capability?.reason ?? "Meeting capture is unavailable.");
  return;
}

await ctx.host.meeting.start({ source: "both", sourceLanguage: "en", targetLanguage: "ko" });
```

The current public host reports meeting capture as unavailable until a transcription backend is connected. DAP owns the single capture session, OS permission flow, running indicator, and cleanup; the plugin receives status and transcript events rather than raw credentials.

Presentation overlays use `openOverlay`, `postMessage`, `onMessage`, `setInteractive`, `showOverlay`, `hideOverlay`, `cursorPos`, and `closeOverlay`. Close the overlay and unsubscribe listeners in the activation cleanup function.

AI account integrations use `getOverview()`, `getAccountUsage(providerId, accountId)`, `addAccount(providerId)`, and `openAccounts()`. The Host exposes display-safe metadata and normalized usage, never tokens, cookies, keychain values, or raw authentication output.

## Palette safety

Palette pages use only the `window.dapPalette` message bridge. They run with sandboxing, context isolation, plugin-root path scoping, and a CSP that blocks external network connections. Privileged operations stay in the main-side plugin and cross the bridge as messages.

## Installation

Copy the complete plugin folder to:

```text
Windows: %APPDATA%\dap\plugins\com.example.my_plugin\
macOS:   ~/Library/Application Support/dap/plugins/com.example.my_plugin/
```

Restart DAP or toggle the plugin off and on in Settings. External distribution uses the official reviewed catalog; installation and activation are separate user actions.

## Common mistakes

- Missing the named `activate(ctx)` export or pointing `entry` at the wrong `.mjs` file.
- Using an undocumented command-registration alias instead of `ctx.commands.addCommand()`.
- Returning a disposable object instead of returning a cleanup function directly.
- Adding unknown manifest fields or undeclared `ctx.aiContext` contributor ids.
- Requesting broad permissions without a concrete need.
- Calling a gated Host API without its permission or capability check.
- Assuming meeting capture or another optional backend is always available.
- Using bare imports, external network calls from a palette page, or undocumented Host APIs.

## Prompt template

```text
Read https://project-undonghae.github.io/desk-ai-pet/llms.txt
and create a DAP plugin that [describe the feature].

Target DAP >=v1.3.9 and manifest_version: 2.
Return plugin.yaml, one self-contained ESM entry file, required permissions with reasons,
installation steps, capability checks, and known limitations.
```
