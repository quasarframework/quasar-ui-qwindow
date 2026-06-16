import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

import Plugin, { install, QWindow, useQWindowResponsiveProps, version } from '../src'

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
            modelValue: true,
            title: 'SSR Window',
          },
          {
            default: () => 'SSR window content',
          },
        ),
    })

    installSsrQuasarStub(app)

    const html = await renderToString(app)

    expect(html).toContain('q-window')
    expect(html).toContain('SSR Window')
    expect(html).toContain('SSR window content')
  })
})
