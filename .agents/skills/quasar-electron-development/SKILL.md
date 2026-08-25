---
name: quasar-electron-development
description: Build, configure, secure, debug, test, package, and release Quasar desktop applications using Electron on Windows, macOS, and Linux. Use for Quasar Electron mode, main and preload processes, context isolation, IPC, native menus, file and protocol handling, deep links, auto-updates, packaging, signing, and `quasar dev` or `quasar build -m electron` workflows.
---

# Quasar Electron Development

Use this skill with `quasar-development` for renderer UI and shared application concerns.

## Map the process boundary

1. Inspect `quasar.config.* > electron`, `src-electron/electron-main.*`, every preload script, IPC definitions, packaging tool, and updater strategy.
2. Read the current [Quasar Electron documentation](https://quasar.dev/quasar-cli-vite/developing-electron-apps/introduction) and Electron security guidance.
3. Add the mode with `quasar mode add electron`.
4. Identify which code runs in main, preload, and renderer before editing.

## Enforce Electron security

- Keep `contextIsolation` enabled and renderer Node integration disabled.
- Expose a narrow, typed preload API through `contextBridge`; never expose raw `ipcRenderer`, filesystem, shell, or process objects.
- Validate IPC sender, channel, arguments, paths, URLs, and return data in the main process.
- Do not enable the deprecated `remote` module.
- Restrict navigation, new windows, permissions, protocols, and external URL opening. Allowlist schemes and destinations.
- Apply a strong Content Security Policy and avoid loading remote executable content.
- Treat renderer input as untrusted even when the app is local.
- Resolve packaged assets with Quasar's supported Electron runtime helpers when applicable.

## Package deliberately

- Keep main/preload dependencies and native modules in the correct package scope.
- Rebuild and test native modules for each target architecture.
- Configure application identity, icons, file associations, protocols, signing, notarization, and artifact names for each OS.
- Design auto-update signing, rollout, rollback, and migration behavior before enabling it.

## Validate

1. Run `quasar dev -m electron` and exercise main/preload/renderer interactions.
2. Add tests around IPC validation and privileged operations.
3. Build with `quasar build -m electron` using the configured packager.
4. Install and launch packaged artifacts on every supported OS; test upgrade/uninstall behavior where relevant.
5. Run tests, typecheck, lint, formatting, dependency audit, and inspect the packaged file set.
