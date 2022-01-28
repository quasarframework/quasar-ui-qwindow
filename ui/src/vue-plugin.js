import QWindow from './components/QWindow'

import { version } from './version'

export default {
  version,
  QWindow,

  install (app) {
    app.component(QWindow.name, QWindow)
  }
}
