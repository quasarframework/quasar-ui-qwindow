import type { App } from "vue";

import QWindow from "./components/QWindow";
import { version } from "./version";

function install(app: App): void {
  app.component(String(QWindow.name), QWindow);
}

export { version, QWindow, install };

export default {
  version,
  QWindow,
  install,
};
