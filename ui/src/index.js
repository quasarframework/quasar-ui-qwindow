import { version } from '../package.json'
import QWindow from './components/QWindow'

export {
  version,
  QWindow
}

export default {
  version,
  QWindow,

  install (Vue) {
    Vue.component(QWindow.name, QWindow)
  }
}
