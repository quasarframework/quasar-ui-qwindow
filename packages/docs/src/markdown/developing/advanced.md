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

## Native Application Styling

Use the `titlebar` slot when the window chrome needs to look like a specific operating system,
product shell, or design system. The slot replaces the built-in title and menu, while
`titlebar-style`, `titlebar-class`, `content-style`, and `content-class` keep the outer surface
controllable from props.

The examples below use `embedded` mode so they stay inside the docs page. The same titlebar slot and
style props work on floating QWindow instances.

<MarkdownExample title="Native macOS Window" file="NativeMacWindow"/>

<MarkdownExample title="Native Windows Window" file="NativeWindowsWindow"/>
