import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  if (process.env.DEV) {
    const QWindow = require('@quasar/quasar-ui-qwindow')
    app.use(QWindow)
  }
})
