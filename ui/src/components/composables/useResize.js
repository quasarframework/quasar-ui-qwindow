import { h, ref } from "vue";



export default function useResize(props, slots, computedHeight, computedToolbarHeight, zIndex, state, canDrag, computedWidth) {

  const handles = ref([
    'top',
    'left',
    'right',
    'bottom',
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right'
  ])

  function canResize (resizeHandle) {
    if (props.noResize === true) return false
    const missing = handles.value.filter(handle => !props.resizable.includes(handle))
    return missing.includes(resizeHandle) !== true
  }

  function renderGripper(resizeHandle) {
    if (canResize(resizeHandle) === false) {
      return ''
    }

    return h('div', {
      ref: resizeHandle,
      style:  `border-color: ${ props.gripperBorderColor }`,
      class: `gripper gripper-${ resizeHandle }${ props.roundGrippers === true ? ' gripper-round' : '' }`,
      onMousedown: (e) => console.log(`MouseDown: ${ e }`),
      onTouchstart: (e) => console.log(`Touchstart: ${ e }`),
      onTouchmove: (e) => console.log(`Touchmove: ${ e }`),
      onTouchend: (e) => console.log(`Touchend: ${ e }`)

    })
  }
  // on: {
  //   mousedown: (e) => this.__onMouseDown(e, resizeHandle),
  //     touchstart: (e) => this.__onTouchStart(e, resizeHandle),
  //     touchmove: (e) => this.__onTouchMove(e, resizeHandle),
  //     touchend: (e) => this.__onTouchEnd(e, resizeHandle)
  // }

// resize handles are for when there are no grippers
  function renderResizeHandle(resizeHandle, actionsWidth) {
    if (this.noMove && resizeHandle === 'titlebar') {
      return ''
    }
    if (resizeHandle !== 'titlebar' && canResize(resizeHandle) === false) {
      return ''
    }

    const style = {}
    if (actionsWidth && actionsWidth > 0 && canDrag() === true) {
      let width = computedWidth.value
      width -= actionsWidth
      style.width = width + 'px'
    }
    return h('div', {
      ref: resizeHandle,
      class: `q-window__resize-handle ' + 'q-window__resize-handle--${ resizeHandle }`,
      style: style,
      onMousedown: (e) => console.log(`MouseDown: ${ e }`),
      onTouchstart: (e) => console.log(`Touchstart: ${ e }`),
      onTouchmove: (e) => console.log(`Touchmove: ${ e }`),
      onTouchend: (e) => console.log(`Touchend: ${ e }`)
    })
  }

  // on: {
  //   mousedown: (e) => this.__onMouseDown(e, resizeHandle),
  //     touchstart: (e) => this.__onTouchStart(e, resizeHandle),
  //     touchmove: (e) => this.__onTouchMove(e, resizeHandle),
  //     touchend: (e) => this.__onTouchEnd(e, resizeHandle)
  // }

  function renderGrippers() {
    if (props.hideGrippers === true) {
      return ''
    }
    return handles.value.map(resizeHandle => renderGripper(resizeHandle))
  }


  function renderResizeHandles() {
    if (props.hideGrippers !== true) {
      return ''
    }
    return handles.value.map(resizeHandle => renderResizeHandle(resizeHandle))
  }

  return {
    renderGrippers,
    renderResizeHandles
  }
}
