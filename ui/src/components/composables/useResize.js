import { h, ref } from "vue";


export default function useResize(props, slots, computedHeight, computedToolbarHeight, zIndex, canDrag, computedWidth, onMouseDown, onTouchStart, onTouchMove, onTouchEnd) {

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
      onMousedown: (e) => onMouseDown(e, resizeHandle),
      onTouchstart: (e) => onTouchStart(e, resizeHandle),
      onTouchmove: (e) => onTouchMove(e, resizeHandle),
      onTouchend: (e) => onTouchEnd(e, resizeHandle)

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
      onMousedown: (e) => onMouseDown(e, resizeHandle),
      onTouchstart: (e) => onTouchStart(e, resizeHandle),
      onTouchmove: (e) => onTouchMove(e, resizeHandle),
      onTouchend: (e) => onTouchEnd(e, resizeHandle)
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
