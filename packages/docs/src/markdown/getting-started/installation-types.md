---
title: Installation Types
desc: How to install QWindow
keys: Getting Started
related:
  - /getting-started/introduction
  - /developing/using-qwindow
---

QWindow can be installed as a Quasar App Extension, as a Vue plugin, as a direct component import,
or through the UMD bundle.

## Quasar CLI

### App Extension

To add QWindow to your Quasar application, run the following in your Quasar app folder:

```bash
quasar ext add @quasar/qwindow
```

The QWindow v3 App Extension targets Quasar CLI Vite 3 and requires `@quasar/app-vite` >=3.0.0-rc.1. It
does not support webpack-based Quasar applications.

### Manual Boot File

If you do not install through the App Extension, install the UI package directly:

```tabs
<<| bash pnpm |>>
pnpm add @quasar/quasar-ui-qwindow
<<| bash bun |>>
bun add @quasar/quasar-ui-qwindow
<<| bash yarn |>>
yarn add @quasar/quasar-ui-qwindow
<<| bash npm |>>
npm install @quasar/quasar-ui-qwindow
```

Then create and register a boot file:

```js
import { defineBoot } from "#q-app";
import Plugin from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/dist/index.css";

export default defineBoot(({ app }) => {
  app.use(Plugin);
});
```

## Vue 3 Or Vite

```js
import { createApp } from "vue";
import Plugin from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/dist/index.css";
import App from "./App.vue";

const app = createApp(App);

app.use(Plugin);
app.mount("#app");
```

## Component Import

```html
<style src="@quasar/quasar-ui-qwindow/dist/index.css"></style>

<script setup lang="ts">
  import { QWindow } from "@quasar/quasar-ui-qwindow";
</script>
```
