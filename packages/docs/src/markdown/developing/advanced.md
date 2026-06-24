---
title: Advanced
desc: Advanced QWindow patterns
keys: developing
examples: QWindow
---

Advanced QWindow usage usually comes down to two concerns: keeping floating windows comfortable on
smaller screens and making the chrome match the workspace around it.

## Responsive Window Props

Use `useQWindowResponsiveProps` when a floating window needs desktop dimensions on wide screens and a
safer size or start position on narrow screens. The composable returns a computed prop object with
`width`, `height`, `startX`, and `startY`, so it can be passed directly to QWindow with `v-bind`.

```vue
<template>
  <q-window v-model="showing" v-bind="windowProps" title="Responsive panel"> ... </q-window>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QWindow, useQWindowResponsiveProps } from '@quasar/quasar-ui-qwindow'

const showing = ref(true)
const windowProps = useQWindowResponsiveProps({
  width: 540,
  height: 340,
  startX: 96,
  startY: 120,
  mobileWidth: 340,
  mobileHeight: 420,
  mobileStartX: 16,
  mobileStartY: 88,
  mobileBreakpoint: 'md',
  viewportPadding: 32,
})
</script>
```

The desktop values are used until the mobile condition matches. By default, that condition is
Quasar's `sm` breakpoint. Use `mobileBreakpoint` to choose a different breakpoint, or
`mobilePredicate` when your app needs custom logic based on Quasar's `$q.screen` object.

On mobile, the returned width is clamped to the viewport width minus `viewportPadding`, with
`minViewportWidth` used as the lower bound. This helps prevent a floating window from opening wider
than the available screen.

## Programmatic Control

Use `v-model:*` state bindings when your application needs to mirror QWindow state in a store,
toolbar, keyboard shortcut handler, or custom title bar. QWindow supports model bindings for
visibility, embedded mode, pinned mode, fullscreen mode, maximized mode, and minimized mode.

```vue
<template>
  <q-window
    ref="windowRef"
    v-model="showing"
    v-model:embedded="embedded"
    v-model:maximized="maximized"
    v-bind="windowProps"
    title="Inspector"
  >
    ...
  </q-window>

  <q-btn label="Float" @click="windowRef?.float()" />
  <q-btn label="Dock" @click="windowRef?.embed()" />
  <q-btn label="Maximize" @click="windowRef?.toggleMaximized()" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const windowRef = ref()
const showing = ref(true)
const embedded = ref(true)
const maximized = ref(false)
</script>
```

Template refs expose control methods for common window commands:

| Method | Description |
| --- | --- |
| `show()` | Shows the window. |
| `hide()` | Hides the window. |
| `embed()` | Docks the window back into its page layout position. |
| `float()` | Moves the window into floating mode. |
| `toggleEmbedded()` | Switches between embedded and floating modes. |
| `pin()` | Keeps the window above normal floating windows. |
| `unpin()` | Returns the window to the normal floating stack. |
| `togglePinned()` | Switches the pinned state. |
| `maximize()` | Maximizes the floating window. |
| `minimize()` | Collapses the window to its title bar. |
| `restore()` | Restores from minimized, maximized, or fullscreen state. |
| `toggleMaximized()` | Switches between maximized and restored state. |
| `toggleMinimized()` | Switches between minimized and restored state. |
| `enterFullscreen()` | Enters browser fullscreen when supported. |
| `leaveFullscreen()` | Leaves browser fullscreen. |
| `toggleFullscreen()` | Switches browser fullscreen state. |
| `getPosition()` | Returns the current window position and size. |

Double-clicking the built-in title bar maximizes or restores a floating window. If you provide a
custom `titlebar` slot, QWindow still handles title-bar double-clicks; stop the event on custom
buttons or links that should not trigger maximize/restore.

## Accessibility

QWindow renders a focusable shell with an ARIA role and label. By default the role is `region`, and
the accessible label comes from `aria-label`, then `title`, then a neutral fallback. Use `aria-role`
when a different role better describes the window in your app, such as `dialog` for a non-modal
task panel or `complementary` for supporting tools.

```vue
<q-window
  v-model="showing"
  title="Layer Inspector"
  aria-label="Layer inspector floating panel"
  aria-role="region"
/>
```

When the window shell has focus, `Escape` restores maximized or minimized windows and leaves browser
fullscreen. It does not close the window, and QWindow does not force modal focus behavior.

## Native Application Styling

Use the `titlebar` slot when the window chrome needs to look like a specific operating system,
product shell, or design system. The slot replaces the built-in title and menu, while
`titlebar-style`, `titlebar-class`, `content-style`, and `content-class` keep the outer surface
controllable from props.

The examples below start embedded so they stay inside the docs page, then use the public control
methods to float, embed, maximize, and restore. Their native close controls dock the window back into
the page instead of hiding it.

<MarkdownExample title="Native macOS Window" file="NativeMacWindow"/>

<MarkdownExample title="Native Windows Window" file="NativeWindowsWindow"/>
