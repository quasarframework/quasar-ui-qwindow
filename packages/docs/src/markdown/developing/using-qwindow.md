---
title: Using QWindow
desc: How to use QWindow
keys: developing
examples: QWindow
---

QWindow provides floating, movable, and resizable panels for Quasar applications. It is useful when
your interface needs desktop-style working areas, inspectors, tool palettes, or draggable helper
panels without turning everything into modal dialogs.

## API

<script import>
import QWindowApi from '@quasar/quasar-ui-qwindow/dist/api/QWindow.json'
</script>

<MarkdownApi :api="QWindowApi" name="QWindow"/>

## Basic Example

The basic example starts embedded so it does not immediately cover the docs page. Open the title bar menu to switch it to floating mode; once floating, it can be dragged by the title bar and resized from the visible handles around the outside edge.

<MarkdownExample title="Basic" file="Basic" no-edit/>

## Embedded Window

Use `embedded` when QWindow should behave like a regular panel inside the page instead of floating
above the app. This is useful for inspectors, builders, and other controls that belong to a specific
layout region.

<MarkdownExample title="Embedded Window" file="Embedded" no-edit/>

## Floating Editor Toolbar

Floating toolbars keep formatting or inspection actions close to the object being edited. This
example opens a compact, non-resizable window that can be pinned or closed without stealing the
whole screen.

<MarkdownExample title="Floating Editor Toolbar" file="EditorToolbar" no-edit/>

## Design Palette

Palette windows are a natural fit for creative tools. They keep controls available while leaving the
primary canvas or workspace visible underneath.

<MarkdownExample title="Design Palette" file="DesignPalette" no-edit/>

## Window Actions

QWindow can expose built-in menu actions for pinning, maximize, fullscreen, and close behavior. Keep
the action list focused so users only see controls that make sense for the current panel.

<MarkdownExample title="Window Actions" file="WindowActions" no-edit/>

## Resize Handles

Use `resizable` when only some edges should resize. This is especially helpful for tool panels that
should grow in one direction without drifting into nearby UI.

<MarkdownExample title="Resize Handles" file="ResizeHandles" no-edit/>

## Scroll With Window

By default, floating windows are viewport-relative. Add `scroll-with-window` when the window should
remain connected to document content as the page scrolls.

<MarkdownExample title="Scroll With Window" file="ScrollWithWindow" no-edit/>

## Event Logging

Persisted workspaces often need to react to window changes. QWindow emits selection, drag, position,
visibility, and state events that can be stored or mirrored in application state.

<MarkdownExample title="Event Logging" file="EventLog" no-edit/>

## Multiple Windows

Multiple QWindow instances can run together. This makes it possible to build desktop-like workspaces
with several floating helpers, inspectors, or document panels.

<MarkdownExample title="Multiple Windows" file="MultipleWindows" no-edit/>
