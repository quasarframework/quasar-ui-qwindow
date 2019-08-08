/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

const extendConf = function (conf) {
  // make sure qwindow boot file is registered
  conf.boot.push('~@quasar/quasar-app-extension-qwindow/src/boot/qwindow.js')
  console.log(` App Extension (qwindow) Info: 'Adding qwindow boot reference to your quasar.conf.js'`)

  // make sure boot & component files transpile
  conf.build.transpileDependencies.push(/quasar-app-extension-qwindow[\\/]src/)

  // make sure these plugins are in the build
  conf.framework.plugins.push('AppFullscreen')
  conf.framework.plugins.push('Platform')
  conf.framework.plugins.push('Screen')

  conf.framework.directives.push('Scroll')

  // make sure qwindow css goes through webpack to avoid ssr issues
  conf.css.push('~@quasar/quasar-app-extension-qwindow/src/component/window.styl')
  console.log(` App Extension (qwindow) Info: 'Adding window.styl css reference to your quasar.conf.js'`)
}

module.exports = function (api) {
  // quasar compatibility check
  api.compatibleWith('@quasar/app', '^1.0.0')

  // register JSON api
  // api.registerDescribeApi('QWindow', './component/QWindow.json')

  // extend quasar.conf
  api.extendQuasarConf(extendConf)
}
