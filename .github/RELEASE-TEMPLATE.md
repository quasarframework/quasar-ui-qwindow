<!--
Release drafting notes:
- Lead with changes QWindow users feel in their apps: component behavior, app-extension behavior, public API, styling, compatibility, install, and migration notes.
- Include docs, CodePen, build tooling, dependency, or release-process changes only when they affect package consumers.
- Fixes should include the short commit id.
- Keep the summary short and concrete.
-->

# QWindow v3.0.2

Release date: 2026-08-19

## Summary

QWindow v3.0.2 improves Quasar CLI Vite integration by keeping the UI package out of Vite
dependency optimization. This ensures its Quasar imports use the application's runtime instance.

## What's Changed

**Features:**

- None.

**Fixes:**

- `dd2e89a` Exclude the QWindow UI package from Vite dependency optimization when installed through
  the App Extension, preventing a separately optimized Quasar runtime.

**Maintenance:**

- `08cb310` Refresh dependencies and the QPress documentation runtime.

## Breaking Changes

- None.

## Compatibility

- Node.js: `>=22.13`
- Quasar: `^2.25.0`
- Quasar App Vite target: `@quasar/app-vite@3.6.0`
- npm dist-tag: `latest`

## Installation

```bash
pnpm add @quasar/quasar-ui-qwindow
# or
bun add @quasar/quasar-ui-qwindow
# or
yarn add @quasar/quasar-ui-qwindow
# or
npm install @quasar/quasar-ui-qwindow
# or
quasar ext add @quasar/qwindow
```

## Documentation

- Docs: https://qwindow.netlify.app/
- Installation: https://qwindow.netlify.app/getting-started/installation-types
- Upgrade Guide: https://qwindow.netlify.app/other/upgrade-guide

## Full Changelog

https://github.com/quasarframework/quasar-ui-qwindow/compare/v3.0.1...v3.0.2

## Donations

If QWindow is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64
