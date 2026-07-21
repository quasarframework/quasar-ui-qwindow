<!--
Release drafting notes:
- Lead with changes QWindow users feel in their apps: component behavior, app-extension behavior, public API, styling, compatibility, install, and migration notes.
- Include docs, CodePen, build tooling, dependency, or release-process changes only when they affect package consumers.
- Fixes should include the short commit id.
- Keep the summary short and concrete.
-->

# QWindow v3.0.1

Release date: 2026-07-21

## Summary

QWindow 3.0.1 improves SSR and static-generation compatibility by rendering windows in place
through hydration, then enabling Teleport after the application mounts. It also makes App Extension
style loading compatible with strict package-manager dependency layouts.

## What's Changed

**Features:**

- None.

**Fixes:**

- `b00b170` Render QWindow in place during SSR and hydration so Vue does not emit a Teleport entry
  targeting the populated `#q-app` mount; floating windows begin teleporting after mount.
- `469d2ca` Load QWindow styles from the App Extension boot file so installation works with strict
  package-manager dependency layouts such as pnpm.

**Maintenance:**

- `980fe61`, `469d2ca` Refresh the tested Quasar, App Vite, Vue, QPress, and build-tool versions.

## Breaking Changes

- None.

## Compatibility

- Node.js: `>=22.13`
- Quasar: `^2.22.0`
- Quasar App Vite target: `@quasar/app-vite@3.1.0`
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

https://github.com/quasarframework/quasar-ui-qwindow/compare/v3.0.0...v3.0.1

## Donations

If QWindow is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64
