import { computed, h } from 'vue'
import type { Ref, Slots } from 'vue'

export default function useBody(
  props: Record<string, any>,
  slots: Slots,
  computedHeight: Ref<number>,
  computedToolbarHeight: Ref<number>,
  zIndex: Ref<number>,
  canDrag: () => boolean,
  isEmbedded: Ref<boolean>,
  isFullscreen: Ref<boolean>,
  renderResizeHandle: (name: string, actionsWidth?: number) => unknown,
) {
  const bodyStyle = computed(() => {
    if (isEmbedded.value === true) {
      return {
        height: props.height - computedToolbarHeight.value + 'px',
      }
    }

    if (isFullscreen.value === true) {
      return {
        position: 'fixed',
        height: `calc(100% - ${computedToolbarHeight.value}px`,
        top: computedToolbarHeight.value + 'px',
      }
    }
    return {
      position: 'absolute',
      top: computedToolbarHeight.value + 'px',
      height: computedHeight.value - computedToolbarHeight.value - 2 + 'px',
    }
  })

  function renderBody() {
    const slot = slots && slots.default
    return h(
      'div',
      {
        class: ['q-window__body row'],
        style: bodyStyle.value,
      },
      [
        slot ? slot({ zIndex: zIndex.value }) : '',
        props.headless === true &&
          canDrag() === true &&
          renderResizeHandle('titlebar', props.noMenu ? 0 : 44),
      ] as any,
    )
  }

  return {
    renderBody,
  }
}
