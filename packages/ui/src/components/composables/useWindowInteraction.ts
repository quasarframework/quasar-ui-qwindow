import { nextTick } from 'vue'
import type { ComputedRef, Ref } from 'vue'

type PointerLikeEvent = MouseEvent | TouchEvent
type GeometryState = {
  top: number
  left: number
  bottom: number
  right: number
  minHeight: number
  minWidth: number
  shouldDrag: boolean
  dragging: boolean
}
type GeometrySnapshot = {
  tmpTop: number
  tmpLeft: number
  tmpRight: number
  tmpBottom: number
  tmpHeight: number
  tmpWidth: number
}
type Point = {
  x: number
  y: number
}

type InteractionProps = {
  scrollWithWindow?: boolean
}

type WindowPosition = {
  height: number
  left: number
  scrollX: number
  scrollY: number
  top: number
  width: number
}

function prevent(e: Event): void {
  e.preventDefault()
}

function stopAndPrevent(e: Event): void {
  e.stopPropagation()
  e.preventDefault()
}

function getWindow(): Window | undefined {
  return typeof window === 'undefined' ? undefined : window
}

function getDocument(): Document | undefined {
  return typeof document === 'undefined' ? undefined : document
}

function getTouchPoint(e: TouchEvent): Touch | undefined {
  return e.touches[0] ?? e.changedTouches[0] ?? e.targetTouches[0]
}

function getMousePosition(e: PointerLikeEvent, type = 'x') {
  if ('touches' in e) {
    const touch = getTouchPoint(e)
    if (touch === void 0) {
      return 0
    }

    if (type === 'x') {
      return touch.pageX
    }
    return touch.pageY
  }

  if (type === 'x') {
    return e.pageX
  }
  return e.pageY
}

function getMouseShift(e: PointerLikeEvent, rect: DOMRect, type = 'x') {
  if ('touches' in e) {
    const touch = getTouchPoint(e)
    if (touch === void 0) {
      return 0
    }

    if (type === 'x') {
      return touch.clientX - rect.left
    }
    return touch.clientY - rect.top
  }

  if (type === 'x') {
    return e.clientX - rect.left
  }
  return e.clientY - rect.top
}

export default function useWindowInteraction({
  addClass,
  clearSelected,
  computedHeight,
  computedPosition,
  computedWidth,
  emitAfterDrag,
  emitBeforeDrag,
  emitCanceled,
  emitPosition,
  isEmbedded,
  isDragging,
  mousePos,
  removeClass,
  resizeHandle,
  scrollX,
  scrollY,
  selectWindow,
  shiftX,
  shiftY,
  states,
  statesTmp,
  windowRef,
  props,
}: {
  addClass: (el: Element, name: string) => void
  clearSelected: () => void
  computedHeight: ComputedRef<number>
  computedPosition: ComputedRef<WindowPosition>
  computedWidth: ComputedRef<number>
  emitAfterDrag: (evt: MouseEvent | TouchEvent) => void
  emitBeforeDrag: (evt: MouseEvent | TouchEvent) => void
  emitCanceled: (position: WindowPosition) => void
  emitPosition: () => void
  isEmbedded: Ref<boolean>
  isDragging: ComputedRef<boolean>
  mousePos: Ref<Point>
  props: InteractionProps
  removeClass: (el: Element, name: string) => void
  resizeHandle: Ref<string | undefined>
  scrollX: Ref<number>
  scrollY: Ref<number>
  selectWindow: (x: number, y: number) => boolean
  shiftX: Ref<number>
  shiftY: Ref<number>
  states: Ref<GeometryState>
  statesTmp: Ref<GeometrySnapshot>
  windowRef: Ref<HTMLElement | null>
}) {
  function addEventListeners() {
    const doc = getDocument()
    if (doc === void 0) {
      return
    }

    doc.body.addEventListener('mousemove', onMouseMove, { capture: true })
    doc.body.addEventListener('mouseup', onMouseUp, { capture: true })
    doc.body.addEventListener('keyup', onKeyUp, { capture: true })
  }

  function removeEventListeners() {
    const doc = getDocument()
    if (doc === void 0) {
      return
    }

    doc.body.removeEventListener('mousemove', onMouseMove, { capture: true })
    doc.body.removeEventListener('mouseup', onMouseUp, { capture: true })
    doc.body.removeEventListener('keyup', onKeyUp, { capture: true })
  }

  function onMouseMove(evt: PointerLikeEvent, rh?: string) {
    if (states.value.shouldDrag !== true || (!('touches' in evt) && evt.buttons !== 1)) {
      removeEventListeners()
      return
    }

    const mouseX = getMousePosition(evt, 'x')
    const mouseY = getMousePosition(evt, 'y')
    const win = getWindow()

    if (states.value.dragging !== true) {
      if (Math.abs(mousePos.value.x - mouseX) >= 3 || Math.abs(mousePos.value.y - mouseY) >= 3) {
        states.value.dragging = true
        emitBeforeDrag(evt)
      } else {
        return
      }
    }

    switch (rh || resizeHandle.value) {
      case 'top':
        states.value.top = mouseY - (win?.scrollY ?? 0) - shiftY.value
        nextTick(() => {
          if (computedHeight.value < states.value.minHeight) {
            states.value.top = statesTmp.value.tmpBottom - states.value.minHeight
          }
        })
        break
      case 'left':
        states.value.left = mouseX - (win?.pageXOffset ?? 0) - shiftX.value
        nextTick(() => {
          if (computedWidth.value < states.value.minWidth) {
            states.value.left = statesTmp.value.tmpRight - states.value.minWidth
          }
        })
        break
      case 'right':
        states.value.right = mouseX - (win?.pageXOffset ?? 0)
        nextTick(() => {
          if (computedWidth.value < states.value.minWidth) {
            states.value.right = statesTmp.value.tmpLeft + states.value.minWidth
          }
        })
        break
      case 'bottom':
        states.value.bottom = mouseY - (win?.scrollY ?? 0)
        nextTick(() => {
          if (computedHeight.value < states.value.minHeight) {
            states.value.bottom = statesTmp.value.tmpTop + states.value.minHeight
          }
        })
        break
      case 'top-left':
        onMouseMove(evt, 'top')
        onMouseMove(evt, 'left')
        break
      case 'top-right':
        onMouseMove(evt, 'top')
        onMouseMove(evt, 'right')
        break
      case 'bottom-left':
        onMouseMove(evt, 'bottom')
        onMouseMove(evt, 'left')
        break
      case 'bottom-right':
        onMouseMove(evt, 'bottom')
        onMouseMove(evt, 'right')
        break
      case 'titlebar':
        if (props.scrollWithWindow === true) {
          states.value.top = mouseY - shiftY.value
          states.value.left = mouseX - shiftX.value
        } else {
          states.value.top = mouseY - (win?.pageYOffset ?? 0) - shiftY.value
          states.value.left = mouseX - (win?.pageXOffset ?? 0) - shiftX.value
        }

        states.value.bottom = states.value.top + statesTmp.value.tmpHeight
        states.value.right = states.value.left + statesTmp.value.tmpWidth
        break
    }
    stopAndPrevent(evt)
  }

  function onMouseDown(evt: PointerLikeEvent, rh?: string) {
    removeEventListeners()
    clearSelected()
    if (!('touches' in evt) && evt.buttons !== 1) {
      return
    }

    if (isEmbedded.value === true) {
      states.value.shouldDrag = states.value.dragging = false
      return
    }

    const x = getMousePosition(evt, 'x')
    const y = getMousePosition(evt, 'y')

    if (selectWindow(x - scrollX.value, y - scrollY.value) !== true) {
      return
    }

    resizeHandle.value = rh

    mousePos.value.x = x
    mousePos.value.y = y

    if (windowRef.value === null) {
      return
    }

    const rect = windowRef.value.getBoundingClientRect()
    shiftX.value = getMouseShift(evt, rect, 'x')
    shiftY.value = getMouseShift(evt, rect, 'y')

    statesTmp.value.tmpTop = states.value.top
    statesTmp.value.tmpLeft = states.value.left
    statesTmp.value.tmpRight = states.value.right
    statesTmp.value.tmpBottom = states.value.bottom
    statesTmp.value.tmpHeight = statesTmp.value.tmpBottom - statesTmp.value.tmpTop
    statesTmp.value.tmpWidth = statesTmp.value.tmpRight - statesTmp.value.tmpLeft

    states.value.shouldDrag = true

    addEventListeners()
    if ('touches' in evt) {
      const doc = getDocument()
      if (doc !== void 0) {
        addClass(doc.body, 'q-window__touch-action')
      }
    }
    prevent(evt)
  }

  function onMouseDownBody(e: MouseEvent) {
    if (isEmbedded.value) {
      states.value.shouldDrag = states.value.dragging = false
      return
    }

    if (states.value.dragging !== true) {
      const x = getMousePosition(e, 'x')
      const y = getMousePosition(e, 'y')

      selectWindow(x - scrollX.value, y - scrollY.value)
    }
  }

  function onMouseUp(e: MouseEvent | TouchEvent) {
    if (states.value.dragging === true) {
      prevent(e)
      removeEventListeners()
      if ('touches' in e) {
        const doc = getDocument()
        if (doc !== void 0) {
          removeClass(doc.body, 'q-window__touch-action')
        }
      }
      states.value.shouldDrag = states.value.dragging = false
      emitAfterDrag(e)
      emitPosition()
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.keyCode === 27 && isDragging.value === true) {
      prevent(e)
      removeEventListeners()
      states.value.shouldDrag = states.value.dragging = false
      states.value.top = statesTmp.value.tmpTop
      states.value.left = statesTmp.value.tmpLeft
      states.value.right = statesTmp.value.tmpRight
      states.value.bottom = statesTmp.value.tmpBottom
      nextTick(() => {
        emitCanceled(computedPosition.value)
      })
    }
  }

  function onTouchMove(e: TouchEvent, handle: string) {
    stopAndPrevent(e)
    resizeHandle.value = handle
    onMouseMove(e)
  }

  function onTouchStart(e: TouchEvent, handle: string) {
    stopAndPrevent(e)
    onMouseDown(e, handle)
  }

  function onTouchEnd(e: TouchEvent, handle: string) {
    stopAndPrevent(e)
    resizeHandle.value = handle
    onMouseUp(e)
  }

  return {
    addEventListeners,
    onMouseDown,
    onMouseDownBody,
    onMouseMove,
    onMouseUp,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    removeEventListeners,
  }
}
