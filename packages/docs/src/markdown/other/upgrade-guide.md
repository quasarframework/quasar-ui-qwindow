---
title: Upgrade Guide
desc: Upgrade to QWindow v3
keys: other
related:
  - /getting-started/installation-types
  - /developing/using-qwindow
---

QWindow v3 modernizes the package for Vue 3, Quasar v2, `@quasar/app-vite` v3, and ESM-first
tooling.

## Requirements

- Vue 3 and Quasar v2.
- Quasar CLI Vite with `@quasar/app-vite` v3 beta for the App Extension.
- Node.js 22.13 or newer.
- pnpm 11.4 or newer when working in this repository.

## Update Packages

For Quasar App Extension installs:

```bash
quasar ext add @quasar/qwindow@beta
```

For direct UI package installs:

```tabs
<<| bash pnpm |>>
pnpm add @quasar/quasar-ui-qwindow@beta
<<| bash bun |>>
bun add @quasar/quasar-ui-qwindow@beta
<<| bash yarn |>>
yarn add @quasar/quasar-ui-qwindow@beta
<<| bash npm |>>
npm install @quasar/quasar-ui-qwindow@beta
```

## Import Changes

Use the package entrypoint instead of old source-file imports:

```ts [twoslash]
import { QWindow } from "@quasar/quasar-ui-qwindow";

QWindow
// ^?
```

Import the component stylesheet alongside the component:

```ts
import "@quasar/quasar-ui-qwindow/dist/index.css";
```

Do not import legacy source paths such as `src/index.sass` or component implementation files. Those
paths belonged to the old package layout and may change without warning.

## Build Output

QWindow v3 publishes ESM and UMD builds. CommonJS entrypoints have been removed to match the modern
Quasar and Vite ecosystem.

## Floating Windows

The v3 docs include updated examples for embedded windows, floating windows, resize handles, toolbar
style palettes, and multiple windows. Review those examples when updating custom window layouts.
