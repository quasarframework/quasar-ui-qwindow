# QWindow

![@quasar/quasar-ui-qwindow](https://img.shields.io/npm/v/@quasar/quasar-ui-qwindow?label=@quasar/quasar-ui-qwindow)
![@quasar/quasar-app-extension-qwindow](https://img.shields.io/npm/v/@quasar/quasar-app-extension-qwindow?label=@quasar/quasar-app-extension-qwindow)
[![npm](https://img.shields.io/npm/dt/@quasar/quasar-ui-qwindow.svg)](https://www.npmjs.com/package/@quasar/quasar-ui-qwindow)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/quasarframework/quasar-ui-qwindow.svg)](https://github.com/quasarframework/quasar-ui-qwindow)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/quasarframework/quasar-ui-qwindow.svg)](https://github.com/quasarframework/quasar-ui-qwindow)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

QWindow is a Quasar component and app extension for building floating, movable, and resizable window
panels. It is useful for desktop-style workspaces, inspectors, tool palettes, and dashboards where
users need to keep multiple panels open at once.

# Structure

This is a pnpm workspace mono-repo. You cannot use npm for building.

- [/ui](packages/ui) - standalone npm package (go here for more information)
- [/app-extension](packages/app-extension) - Quasar app extension
- [/docs](packages/docs) - Q-Press documentation site with docs, demos, and examples
- [live demo](https://qwindow.netlify.app/) - **live Q-Press docs, demos, and examples**

## Install

For Quasar CLI projects:

```bash
quasar ext add @quasar/qwindow
```

For direct package usage:

```bash
pnpm add @quasar/quasar-ui-qwindow
# or
bun add @quasar/quasar-ui-qwindow
# or
yarn add @quasar/quasar-ui-qwindow
# or
npm install @quasar/quasar-ui-qwindow
```

```ts
import { createApp } from 'vue'
import QWindow from '@quasar/quasar-ui-qwindow'
import '@quasar/quasar-ui-qwindow/dist/index.css'

const app = createApp(App)

app.use(QWindow)
app.mount('#app')
```

## Component

- `QWindow` provides the floating or embedded panel, title bar, menu actions, move behavior, and
  resize handles.

Use `quasar describe QWindow` after installing the app extension.

## Support

If QWindow is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

MIT (c) Jeff Galbraith <jeff@quasar.dev>

<!-- Trigger a Netlify branch redeploy without changing the rendered README. -->
