import QWindow from '@quasar/quasar-app-extension-qwindow/src/component/QWindow'
import { Colorize } from 'quasar-mixin-colorize'

export default ({ Vue, ssrContext }) => {
  Vue.component('q-window', QWindow(ssrContext))
  Vue.component(Colorize)
}
