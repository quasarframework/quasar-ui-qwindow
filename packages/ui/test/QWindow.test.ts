import { describe, expect, it } from "vitest";

import Plugin, { install, QWindow, version } from "../src";

describe("QWindow exports", () => {
  it("exports the installable QWindow component", () => {
    expect(QWindow.name).toBe("QWindow");
    expect(Plugin.QWindow).toBe(QWindow);
    expect(Plugin.install).toBe(install);
    expect(Plugin.version).toBe(version);
  });
});
