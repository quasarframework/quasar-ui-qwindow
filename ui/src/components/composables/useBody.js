import { computed, h } from "vue";

export default function useBody(props, slots, computedHeight, computedToolbarHeight, zIndex,canDrag,  isEmbedded,isFullscreen, renderResizeHandle) {

  const bodyStyle = computed(() => {

    if (isEmbedded.value === true) {

      console.log(`Embedded Height: ${ (props.height - computedToolbarHeight.value) }px` )

      return {
        height: (props.height - computedToolbarHeight.value) + 'px'
      }
    }

    if (isFullscreen.value === true) {
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
      class: ['q-window__body row'],
      style: bodyStyle.value
    }, [
      slot ? slot({ zIndex: zIndex.value }) : '',
      (props.headless === true && canDrag() === true)
      && renderResizeHandle('titlebar', props.noMenu ? 0 : 44)
    ])
  }


  return {
    renderBody
  }
}
