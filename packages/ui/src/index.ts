import type { App } from 'vue'

import QWindow from './components/QWindow'
import { useQWindowResponsiveProps } from './composables/useQWindowResponsiveProps'
import { version } from './version'
export type {
  QWindowResponsiveBreakpoint,
  QWindowResponsivePredicate,
  QWindowResponsiveProps,
  QWindowResponsivePropsOptions,
} from './composables/useQWindowResponsiveProps'

function install(app: App): void {
  app.component(String(QWindow.name), QWindow)
}

export { version, QWindow, install, useQWindowResponsiveProps }

export default {
  version,
  QWindow,
  useQWindowResponsiveProps,
  install,
}
