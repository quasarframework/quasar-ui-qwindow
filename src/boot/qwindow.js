import QWindow from '@quasar/quasar-app-extension-qwindow/src/component/QWindow'

export default ({ Vue, ssrContext }) => {
  Vue.component('q-window', QWindow(ssrContext))
}
