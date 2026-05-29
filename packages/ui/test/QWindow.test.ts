import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import Plugin, { install, QWindow, version } from "../src";

function installSsrQuasarStub(app: ReturnType<typeof createSSRApp>): void {
  const $q = {
    config: {
      iconMapFn: () => undefined,
    },
    dark: { isActive: false },
    iconMapFn: null,
    platform: { has: { touch: false }, is: { desktop: true, ios: false, mobile: false } },
    screen: { height: 800, width: 1280 },
  };

  app.provide("_q_", $q);
  app.config.globalProperties.$q = $q;
}

describe("QWindow exports", () => {
  it("exports the installable QWindow component", () => {
    expect(QWindow.name).toBe("QWindow");
    expect(Plugin.QWindow).toBe(QWindow);
    expect(Plugin.install).toBe(install);
    expect(Plugin.version).toBe(version);
  });

  it("renders on the server without browser globals", async () => {
    const app = createSSRApp({
      render: () =>
        h(
          QWindow,
          {
            embedded: true,
            modelValue: true,
            title: "SSR Window",
          },
          {
            default: () => "SSR window content",
          },
        ),
    });

    installSsrQuasarStub(app);

    const html = await renderToString(app);

    expect(html).toContain("q-window");
    expect(html).toContain("SSR Window");
    expect(html).toContain("SSR window content");
  });
});
