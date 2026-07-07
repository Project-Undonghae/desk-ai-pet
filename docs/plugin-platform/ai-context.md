# DAP Plugin AI Context

Use this file when an AI coding assistant is asked to create or modify a DAP plugin.

## Goal

DAP plugins add commands, selected-text actions, settings, palette UI, storage, or local-service integrations to Desk AI Pet.

## Required Output

When generating a plugin, return:

- `plugin.yaml`
- an ESM entry file, usually `dap_<plugin_name>/plugin.mjs`
- required permissions and why each one is needed
- local install steps
- assumptions and known limitations

## Minimal File Tree

```text
my-plugin/
  plugin.yaml
  dap_my_plugin/
    plugin.mjs
  README.md
```

## Manifest Rules

Use `manifest_version: 2`.

```yaml
id: com.example.my_plugin
name: My Plugin
version: 1.0.0
manifest_version: 2
entry: dap_my_plugin.plugin:activate
description: Short user-facing description
author: Your Name
surface: user
permissions: []
execution_modes:
  - user
```

Rules:

- `id` must be stable and globally unique.
- `entry` points to the exported activation function.
- Keep `permissions` empty unless the requested feature needs privileged APIs.
- Use the smallest permission set possible.
- Keep the plugin self-contained unless the user explicitly asks for dependencies.

## Entry File Pattern

```js
export function activate(ctx) {
  ctx.actions.registerAction({
    id: "hello",
    callback: () => {
      ctx.host.bubble.speak("Hello from plugin");
      return "Hello from plugin";
    },
  });

  return {
    dispose() {
      // Clean up timers, listeners, or long-running work here.
    },
  };
}
```

## Common Tasks

### Add a selected-text action

Use this when the plugin should summarize, translate, rewrite, explain, or inspect selected text.

```js
export function activate(ctx) {
  ctx.actions.registerAction({
    id: "polish-selection",
    title: "Polish selected text",
    callback: async ({ text }) => {
      const result = String(text || "").trim();
      ctx.host.bubble.speak("Done");
      return result;
    },
  });
}
```

### Add a command

Use this when the plugin should be launched from a command or launcher style surface.

```js
export function activate(ctx) {
  ctx.commands.addCommand({
    id: "say-hello",
    title: "Say hello",
    matchers: [{ type: "keyword", patterns: ["hello", "안녕"], priority: 40 }],
    backend: { type: "builtin", handler: "dap.say_hello" },
  });
}
```

## Permissions

Only request permissions that are needed for the requested behavior.

Common permission decisions:

- No permission: simple actions, commands, and short bubble feedback.
- `storage.private`: plugin-private persisted settings or state.
- `window.palette`: plugin palette windows or custom UI.
- Network-related permission: only when the user explicitly asks for web/API access.

Always explain why each permission is required.

## Install Steps

Tell the user to copy the plugin folder to the local DAP plugins directory, then restart DAP or reload the plugin from settings.

Use the platform-specific locations from the public developer docs when exact paths are needed:

- https://project-undonghae.github.io/desk-ai-pet/developers.html#distribution

## Common Mistakes

- Missing `activate(ctx)` export.
- `entry` does not match the actual file/function.
- Plugin folder structure does not match the manifest.
- Requesting broad permissions without a clear need.
- Calling undocumented host APIs.
- Forgetting to return or display a useful result for selected-text actions.
- Assuming API-key setup is required before using DAP.

## AI Prompt Template

```text
Read https://project-undonghae.github.io/desk-ai-pet/llms.txt
and create a DAP plugin that [describe the feature].

Return plugin.yaml, the ESM entry file, required permissions, and install steps.
Keep the implementation minimal and follow manifest_version: 2.
```
