/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import { defineIndexScript } from '#q-app'

export default defineIndexScript((api) => {
  api.compatibleWith('quasar', '^2.0.0')
  api.compatibleWith('@quasar/app-vite', '>=3.0.0')

  api.extendViteConf(() => ({
    optimizeDeps: {
      exclude: ['@quasar/quasar-ui-qwindow'],
    },
  }))

  api.registerDescribeApi('QWindow', '~@quasar/quasar-ui-qwindow/dist/api/QWindow.json')

  api.extendQuasarConf(() => ({
    boot: ['~@quasar/quasar-app-extension-qwindow/dist/boot/vite-register.js'],
  }))
})
