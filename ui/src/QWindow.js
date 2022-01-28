import QWindow from './components/QWindow'
import pkg from '../package.json'
const { version } = pkg

export {
  version,
  QWindow
}

export default {
  version,
  QWindow,

  install (Vue) {
    console.log('WAJJJJJJJJJ')
    Vue.component(QWindow.name, QWindow)
  }
}
