QWindow (Vue Plugin, UMD and Quasar App Extension)
===

![@quasar/quasar-ui-qwindow](https://img.shields.io/npm/v/@quasar/quasar-ui-qwindow.svg?label=@quasar/quasar-ui-qwindow)
![@quasar/quasar-app-extension-qwindow](https://img.shields.io/npm/v/@quasar/quasar-app-extension-qwindow.svg?label=@quasar/quasar-app-extension-qwindow)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/quasarframework/quasar-ui-qwindow.svg)]()
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/quasarframework/quasar-ui-qwindow.svg)]()

# Structure

* [/ui](ui) - standalone npm package (go here for more information)
* [/app-extension](app-extension) - Quasar app extension
* [/demo](demo) - sources for docs, demo and examples project
* [live demo](https://quasarframework.github.io/quasar-ui-qwindow/docs) - live docs, demo and examples

# Demo Workflow
If you fork or download this project, make sure you have the Quasar CLI globally installed:

```
$ npm i -g @quasar/cli
```

The workflow to build the demo, on a fresh project, is as follows:
```
$ cd ui
$ yarn
$ yarn build
$ cd ../demo
$ yarn
$ quasar dev
```

# Codepen
[UMD example on Codepen](https://codepen.io/Hawkeye64/pen/RwwwKQL)

# Donate
If you appreciate the work that went into this, please consider donating to [Quasar](https://donate.quasar.dev) or [Jeff](https://github.com/sponsors/hawkeye64).

# License
MIT (c) Jeff Galbraith <jeff@quasar.dev>
