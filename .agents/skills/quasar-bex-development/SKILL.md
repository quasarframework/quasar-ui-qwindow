---
name: quasar-bex-development
description: Build, configure, secure, debug, test, and package browser extensions with Quasar BEX mode. Use for extension manifests, Manifest V3, background service workers, content scripts, injected page scripts, popup and options pages, permissions, cross-context messaging, BEX bridge, Chrome or Firefox targets, store packaging, and `quasar dev` or `quasar build -m bex` workflows.
---

# Quasar Browser Extension Development

Use this skill with `quasar-development` for shared UI and application concerns.

## Map extension contexts

1. Inspect `quasar.config.* > bex`, `src-bex/manifest.json`, background scripts, content scripts, injected scripts, popup/options pages, and bridge usage.
2. Read the current [Quasar BEX documentation](https://quasar.dev/quasar-cli-vite/developing-browser-extensions/introduction) and target-browser extension documentation.
3. Add the mode with `quasar mode add bex`.
4. Identify each execution context and its available APIs before changing code.

## Minimize privilege and trust

- Request only required permissions, host permissions, and web-accessible resources.
- Treat page DOM, page messages, storage, tabs, and external messages as untrusted input.
- Validate message origin, shape, channel, and response before privileged actions.
- Use the BEX bridge for supported cross-context communication; handle teardown and navigation cleanly.
- Keep privileged APIs in the background context and expose narrow operations to content/UI contexts.
- Respect Manifest V3 service-worker suspension: persist required state and do not rely on long-lived globals.
- Avoid remote code and dynamic execution that violate browser store policies or CSP.
- Account for API and manifest differences between Chrome-family browsers and Firefox.

## Validate in target browsers

1. Run `quasar dev -m bex -T chrome` or the supported target and load the development extension.
2. Test installation, update, browser restart, tab navigation, service-worker restart, and permission denial/removal.
3. Test every content-script match pattern against intended and unintended pages.
4. Build with `quasar build -m bex -T <target>` and inspect the emitted manifest and package contents.
5. Run tests, typecheck, lint, formatting, and store-policy checks for each supported browser.
