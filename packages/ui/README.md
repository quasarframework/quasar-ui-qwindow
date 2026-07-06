# QWindow UI

[![npm version](https://img.shields.io/npm/v/@quasar/quasar-ui-qwindow?label=%40quasar%2Fquasar-ui-qwindow)](https://www.npmjs.com/package/@quasar/quasar-ui-qwindow)
[![npm downloads](https://img.shields.io/npm/dt/@quasar/quasar-ui-qwindow)](https://www.npmjs.com/package/@quasar/quasar-ui-qwindow)
[![npm monthly downloads](https://img.shields.io/npm/dm/@quasar/quasar-ui-qwindow)](https://www.npmjs.com/package/@quasar/quasar-ui-qwindow)
[![license](https://img.shields.io/npm/l/@quasar/quasar-ui-qwindow)](https://www.npmjs.com/package/@quasar/quasar-ui-qwindow)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

QWindow is a Quasar component for building floating, movable, and resizable window panels.

## Install

```bash
pnpm add @quasar/quasar-ui-qwindow
# or
bun add @quasar/quasar-ui-qwindow
# or
yarn add @quasar/quasar-ui-qwindow
# or
npm install @quasar/quasar-ui-qwindow
# or, in a Quasar CLI app
quasar ext add @quasar/qwindow
```

```ts
import { createApp } from 'vue'
import QWindow from '@quasar/quasar-ui-qwindow'
import '@quasar/quasar-ui-qwindow/dist/index.css'

const app = createApp(App)

app.use(QWindow)
app.mount('#app')
```

You can also import the component directly:

```ts
import { QWindow } from '@quasar/quasar-ui-qwindow'
import '@quasar/quasar-ui-qwindow/dist/index.css'
```

## Component

- `QWindow` provides the floating or embedded panel, title bar, menu actions, move behavior, and
  resize handles.

## UMD

The UMD build exports `window.QWindow`.

Add the following tags after the Quasar stylesheet and script tags:

```html
<link
  href="https://cdn.jsdelivr.net/npm/@quasar/quasar-ui-qwindow/dist/index.min.css"
  rel="stylesheet"
  type="text/css"
/>
<script src="https://cdn.jsdelivr.net/npm/@quasar/quasar-ui-qwindow/dist/index.umd.min.js"></script>
```

Use `dist/index.rtl.min.css` instead when your app needs the RTL stylesheet.

## Documentation

[Live docs and examples](https://qwindow.netlify.app/)

## Support

If QWindow is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

MIT (c) Jeff Galbraith <jeff@quasar.dev>
