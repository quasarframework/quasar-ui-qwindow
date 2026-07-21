import { describe, expect, it } from 'vitest'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

import Plugin, { install, QWindow, useQWindowResponsiveProps, version } from '../src'
import useWindowGeometry from '../src/components/composables/useWindowGeometry'
import useWindowRestoreState from '../src/components/composables/useWindowRestoreState'
import useWindowStack from '../src/components/composables/useWindowStack'
import useWindowState, {
  ACTION_EMBEDDED,
  ACTION_MAXIMIZE,
  ACTION_MINIMIZE,
  ACTION_PINNED,
  ACTION_VISIBLE,
} from '../src/components/composables/useWindowState'

function installSsrQuasarStub(
  app: ReturnType<typeof createSSRApp>,
  screen = {
    height: 800,
    width: 1280,
    name: 'lg',
    sizes: { sm: 600, md: 1024, lg: 1440, xl: 1920 },
    lt: { sm: false, md: false, lg: true, xl: true },
    gt: { xs: true, sm: true, md: true, lg: false, xl: false },
  },
): void {
  const $q = {
    config: {
      iconMapFn: () => undefined,
    },
    dark: { isActive: false },
    iconMapFn: null,
    platform: { has: { touch: false }, is: { desktop: true, ios: false, mobile: false } },
    screen,
  }

  app.provide('_q_', $q)
  app.config.globalProperties.$q = $q
}

describe('QWindow exports', () => {
  it('exports the installable QWindow component', () => {
    expect(QWindow.name).toBe('QWindow')
    expect(Plugin.QWindow).toBe(QWindow)
    expect(Plugin.install).toBe(install)
    expect(Plugin.version).toBe(version)
    expect(Plugin.useQWindowResponsiveProps).toBe(useQWindowResponsiveProps)
  })

  it('creates responsive QWindow props from the Quasar screen', async () => {
    let renderedProps = ''
    const app = createSSRApp({
      setup() {
        const windowProps = useQWindowResponsiveProps({
          width: 420,
          height: 260,
          startX: 72,
          startY: 104,
          mobileWidth: 380,
          mobileHeight: 280,
          mobileStartY: 88,
        })

        return () => {
          renderedProps = JSON.stringify(windowProps.value)
          return h('pre', renderedProps)
        }
      },
    })

    installSsrQuasarStub(app, {
      height: 720,
      width: 340,
      name: 'xs',
      sizes: { sm: 600, md: 1024, lg: 1440, xl: 1920 },
      lt: { sm: true, md: true, lg: true, xl: true },
      gt: { xs: false, sm: false, md: false, lg: false, xl: false },
    })

    await renderToString(app)

    expect(JSON.parse(renderedProps)).toEqual({
      height: 280,
      startX: 16,
      startY: 88,
      width: 308,
    })
  })

  it('renders on the server without browser globals', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          QWindow,
          {
            embedded: true,
            menuIcon: 'more_horiz',
            modelValue: true,
            title: 'SSR Window',
          },
          {
            default: () => 'SSR window content',
          },
        ),
    })

    installSsrQuasarStub(app)

    const ssrContext: { teleports?: Record<string, string> } = {}
    const html = await renderToString(app, ssrContext)

    expect(html).toContain('q-window')
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="SSR Window"')
    expect(html).toContain('more_horiz')
    expect(html).toContain('SSR Window')
    expect(html).toContain('SSR window content')
    expect(ssrContext.teleports).toBeUndefined()
  })

  it('models window state transitions and update events in one place', () => {
    const events: unknown[][] = []
    const state = useWindowState((event, ...args) => {
      events.push([event, ...args])
    })

    expect(state.isVisible.value).toBe(true)
    expect(state.isEmbedded.value).toBe(true)
    expect(state.checkActionState(ACTION_PINNED, true)).toBe(false)

    expect(state.setActionState(ACTION_EMBEDDED, false)).toBe(true)
    expect(state.isEmbedded.value).toBe(false)
    expect(state.checkActionState(ACTION_PINNED, true)).toBe(true)

    expect(state.setActionState(ACTION_PINNED, true)).toBe(true)
    expect(state.isPinned.value).toBe(true)

    expect(state.setActionState(ACTION_VISIBLE, false)).toBe(true)

    expect(events).toEqual([
      ['embedded', false],
      ['update:embedded', false],
      ['pinned', true],
      ['update:pinned', true],
      ['update:modelValue', false],
      ['input', false],
      ['hide'],
    ])
  })

  it('computes geometry from initial placement and scroll mode', () => {
    const geometry = useWindowGeometry({
      height: 260,
      scrollWithWindow: false,
      startX: 72,
      startY: 104,
      width: 420,
    })

    geometry.initializePosition(3, 20, 20)
    geometry.updateScroll({ scrollX: 11, scrollY: 17 } as Window)

    expect(geometry.computedPosition.value).toEqual({
      height: 260,
      left: 72,
      scrollX: 83,
      scrollY: 121,
      top: 104,
      width: 420,
    })
  })

  it('tracks selected window stacking independently from component rendering', () => {
    const first = useWindowStack(4000)
    const second = useWindowStack(4000)

    first.bringToFront()
    second.bringToFront()

    expect(first.selected.value).toBe(true)
    expect(second.selected.value).toBe(true)
    expect(second.zIndex.value).toBeGreaterThan(first.zIndex.value)

    first.clearSelected()

    expect(first.selected.value).toBe(false)
  })

  it('keeps fullscreen restore state separate from maximized restore state', () => {
    const states = ref({
      top: 80,
      left: 96,
      bottom: 360,
      right: 536,
    })
    let zIndex = 4010
    const actions = {
      [ACTION_EMBEDDED]: false,
      [ACTION_PINNED]: false,
      [ACTION_MAXIMIZE]: false,
      [ACTION_MINIMIZE]: false,
    }

    const restore = useWindowRestoreState({
      states,
      startingZIndex: zIndex,
      getZIndex: () => zIndex,
      setZIndex: (value) => {
        zIndex = value
      },
      getActionState: (action) => actions[action as keyof typeof actions] === true,
      setActionState: (action, value) => {
        actions[action as keyof typeof actions] = value
        return true
      },
    })

    restore.savePositionAndState()

    states.value = {
      top: 0,
      left: 0,
      bottom: 800,
      right: 1280,
    }
    actions[ACTION_MAXIMIZE] = true
    restore.savePositionAndState(restore.fullscreenRestoreState.value)

    states.value = {
      top: 0,
      left: 0,
      bottom: 900,
      right: 1440,
    }
    zIndex = 5900

    restore.restorePositionAndState(restore.fullscreenRestoreState.value)

    expect(states.value).toEqual({
      top: 0,
      left: 0,
      bottom: 800,
      right: 1280,
    })
    expect(actions[ACTION_MAXIMIZE]).toBe(true)

    actions[ACTION_MAXIMIZE] = false
    restore.restorePositionAndState()

    expect(states.value).toEqual({
      top: 80,
      left: 96,
      bottom: 360,
      right: 536,
    })
    expect(actions[ACTION_MAXIMIZE]).toBe(false)
  })
})
