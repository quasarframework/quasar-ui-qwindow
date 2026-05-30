---
title: FAQ
desc: Frequently asked QWindow questions
keys: developing
---

:::details Q. When should I use QWindow instead of QDialog?

Use QWindow when the user should be able to keep a panel open, move it around, resize it, or work
with multiple panels at once. Use QDialog for focused modal decisions and short blocking flows.

:::

:::details Q. Does QWindow support embedded content?

Yes. QWindow can behave as an embedded panel or a floating panel. Floating mode uses Vue 3
`Teleport` so the rendered panel can live inside Quasar's app root while the component stays where
you declared it.

:::

:::details Q. Is QWindow SSR-safe?

The v3 component guards browser-only drag, resize, scroll, and Teleport setup so server rendering does
not touch `window` or `document`. Floating windows target `#q-app` when it is available and fall back
to `body` in non-standard hosts.
:::
