/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import { defineIndexScript } from "@quasar/app-vite";

export default defineIndexScript((api) => {
  api.compatibleWith("quasar", "^2.0.0");
  api.compatibleWith("@quasar/app-vite", ">=3.0.0-beta.27");

  api.registerDescribeApi("QWindow", "~@quasar/quasar-ui-qwindow/dist/api/QWindow.json");

  api.extendQuasarConf(() => ({
    boot: ["~@quasar/quasar-app-extension-qwindow/src/boot/vite-register.ts"],
    css: ["~@quasar/quasar-ui-qwindow/src/index.scss"],
  }));
});
