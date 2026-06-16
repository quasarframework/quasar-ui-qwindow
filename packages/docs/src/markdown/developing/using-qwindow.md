---
title: Using QWindow
desc: How to use QWindow
keys: developing
examples: QWindow
---

QWindow provides floating, movable, and resizable panels for Quasar applications. It is useful when
your interface needs desktop-style working areas, inspectors, tool palettes, or draggable helper
panels without turning everything into modal dialogs.

<script import>
import QWindowApi from '@quasar/quasar-ui-qwindow/dist/api/QWindow.json'
</script>

<MarkdownApi :api="QWindowApi" name="QWindow"/>

## Responsive Window Props

Use `useQWindowResponsiveProps` when a floating or embedded window needs smaller dimensions and a
safer start position on narrow screens. The composable returns a computed prop object, so it can be
passed directly to QWindow with `v-bind`.

```vue
<template>
  <q-window v-model="showing" v-bind="windowProps" title="Responsive panel"> ... </q-window>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QWindow, useQWindowResponsiveProps } from '@quasar/quasar-ui-qwindow'

const showing = ref(true)
const windowProps = useQWindowResponsiveProps({
  width: 420,
  height: 260,
  startX: 72,
  startY: 104,
  mobileWidth: 320,
  mobileHeight: 280,
  mobileStartY: 88,
})
</script>
```

By default, mobile values are used below Quasar's `sm` breakpoint. Pass `mobileBreakpoint` or
`mobilePredicate` when an app needs a different cutoff.

## Basic Example

The basic example starts embedded so it does not immediately cover the docs page. Open the title bar menu to switch it to floating mode; once floating, it can be dragged by the title bar and resized from the visible handles around the outside edge.

<MarkdownExample title="Basic" file="Basic"/>

## Embedded Window

Use `embedded` when QWindow should behave like a regular panel inside the page instead of floating
above the app. This is useful for inspectors, builders, and other controls that belong to a specific
layout region.

<MarkdownExample title="Embedded Window" file="Embedded"/>

## Floating Editor Toolbar

Floating toolbars keep formatting or inspection actions close to the object being edited. This
example opens a compact, non-resizable window that can be pinned or closed without stealing the
whole screen.

<MarkdownExample title="Floating Editor Toolbar" file="EditorToolbar"/>

## Design Palette

Palette windows are a natural fit for creative tools. They keep controls available while leaving the
primary canvas or workspace visible underneath.

<MarkdownExample title="Design Palette" file="DesignPalette"/>

## Window Actions

QWindow can expose built-in menu actions for pinning, maximize, fullscreen, and close behavior. Keep
the action list focused so users only see controls that make sense for the current panel.

<MarkdownExample title="Window Actions" file="WindowActions"/>

## Resize Handles

Use `resizable` when only some edges or corners should resize. Combine it with
`round-grippers`, `gripper-border-color`, `gripper-background-color`, or `hide-grippers` when the
visible handles need to match a specific interaction style.

<MarkdownExample title="Resize Handles" file="ResizeHandles"/>

## Scroll With Window

By default, floating windows are viewport-relative. Add `scroll-with-window` when the window should
remain connected to document content as the page scrolls.

<MarkdownExample title="Scroll With Window" file="ScrollWithWindow"/>

## Event Logging

Persisted workspaces often need to react to window changes. QWindow emits selection, drag, position,
visibility, and state events that can be stored or mirrored in application state.

<MarkdownExample title="Event Logging" file="EventLog"/>

## Multiple Windows

Multiple QWindow instances can run together. This makes it possible to build desktop-like workspaces
with several floating helpers, inspectors, or document panels.

<MarkdownExample title="Multiple Windows" file="MultipleWindows"/>
