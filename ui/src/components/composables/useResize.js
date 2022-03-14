import { h, ref } from "vue";
import { prevent, stopAndPrevent } from 'quasar/src/utils/event'


export default function useResize(props, slots, computedHeight, computedToolbarHeight, zIndex, state, canDrag, computedWidth, send) {

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

  function onSend(evt, resizeHandle) {
    console.log(evt.type, resizeHandle)
    send({
      type: evt.type,
      value: [ resizeHandle,evt ]
    })
  }

  function canResize(resizeHandle) {
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
      style: `border-color: ${ props.gripperBorderColor }`,
      class: `gripper gripper-${ resizeHandle }${ props.roundGrippers === true ? ' gripper-round' : '' }`,
      onMousedown: (e) => onSend(e, resizeHandle),
      onTouchstart: (e) => console.log(`Touchstart: ${ e }`),
      onTouchmove: (e) => console.log(`Touchmove: ${ e }`),
      onTouchend: (e) => console.log(`Touchend: ${ e }`)

    })
  }

// resize handles are for when there are no grippers
  function renderResizeHandle(resizeHandle, actionsWidth) {
    console.log(resizeHandle)
    if (props.noMove && resizeHandle === 'titlebar') {
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
      class: [ 'q-window__resize-handle', `q-window__resize-handle--${ resizeHandle }` ],
      style: style,
      onMousedown: (e) => onSend(e, resizeHandle),
      onTouchstart: (e) => console.log(`Touchstart: ${ e }`),
      onTouchmove: (e) => console.log(`Touchmove: ${ e }`),
      onTouchend: (e) => console.log(`Touchend: ${ e }`)
    })
  }

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
    renderResizeHandles,
    renderResizeHandle
  }
}
