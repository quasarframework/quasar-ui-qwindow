import { computed, h } from "vue";

export default function useBody(props, slots, computedHeight, computedToolbarHeight, zIndex, state) {

  const bodyStyle = computed(() => {
    if (state.value.context.actions.embedded.state === true) {
      return {
        height: (props.height - computedToolbarHeight.value) + 'px'
      }
    }
    if (state.value.context.actions.fullscreen.state === true) {
      return {
        position: 'fixed',
        height: `calc(100% - ${ computedToolbarHeight.value }px`,
        top: computedToolbarHeight.value + 'px'
      }
    }
    return {
      position: 'absolute',
      top: computedToolbarHeight.value + 'px',
      height: computedHeight.value - computedToolbarHeight.value - 2 + 'px'
    }
  })

  function renderBody() {
    const slot = slots && slots.default
    return h('div', {
      class: 'q-window__body row',
      style: bodyStyle.value
    }, [
      slot ? slot({ zIndex: zIndex.value }) : ''
    ])
  }


  return {
    renderBody
  }
}
