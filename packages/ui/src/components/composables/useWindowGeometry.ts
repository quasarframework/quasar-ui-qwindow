import { computed, ref } from 'vue'

type GeometryProps = {
  height?: number | string
  scrollWithWindow?: boolean
  startX?: number | string
  startY?: number | string
  width?: number | string
}

export interface QWindowGeometryPosition {
  height: number
  left: number
  scrollX: number
  scrollY: number
  top: number
  width: number
}

function toNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

export default function useWindowGeometry(props: GeometryProps) {
  const scrollX = ref(0)
  const scrollY = ref(0)
  const shiftX = ref(0)
  const shiftY = ref(0)
  const mousePos = ref({
    x: 0,
    y: 0,
  })
  const statesTmp = ref({
    tmpTop: 0,
    tmpLeft: 0,
    tmpRight: 0,
    tmpBottom: 0,
    tmpHeight: 0,
    tmpWidth: 0,
  })
  const states = ref({
    top: 150,
    left: 10,
    bottom: 400,
    right: 400,
    minHeight: 100,
    minWidth: 100,
    shouldDrag: false,
    dragging: false,
  })

  const computedLeft = computed(() => {
    return states.value.left
  })

  const computedTop = computed(() => {
    return states.value.top
  })

  const computedRight = computed(() => {
    return states.value.right
  })

  const computedBottom = computed(() => {
    return states.value.bottom
  })

  const computedHeight = computed(() => {
    return computedBottom.value - computedTop.value
  })

  const computedWidth = computed(() => {
    return computedRight.value - computedLeft.value
  })

  const computedScrollX = computed(() => {
    return computedLeft.value + (props.scrollWithWindow !== true ? scrollX.value : 0)
  })

  const computedScrollY = computed(() => {
    return computedTop.value + (props.scrollWithWindow !== true ? scrollY.value : 0)
  })

  const computedPosition = computed<QWindowGeometryPosition>(() => {
    return {
      height: computedHeight.value,
      left: computedLeft.value,
      scrollX: computedScrollX.value,
      scrollY: computedScrollY.value,
      top: computedTop.value,
      width: computedWidth.value,
    }
  })

  function initializePosition(windowIndex: number, defaultX: number, defaultY: number) {
    const startX = toNumber(props.startX, defaultX * windowIndex)
    const startY = toNumber(props.startY, defaultY * windowIndex)
    const width = toNumber(props.width, 400)
    const height = toNumber(props.height, 400)

    states.value.left = startX > 0 ? startX : defaultX * windowIndex
    states.value.top = startY > 0 ? startY : defaultY * windowIndex
    states.value.right = states.value.left + width
    states.value.bottom = states.value.top + height
  }

  function updateScroll(win: Window | undefined) {
    if (win !== void 0) {
      scrollY.value = win.scrollY
      scrollX.value = win.scrollX
    }
  }

  function setFullWindowPosition(width: number, height: number) {
    states.value.top = 0
    states.value.left = 0
    states.value.bottom = height
    states.value.right = width
  }

  function setMinimizePosition() {
    // Reserved for future docked minimization placement.
  }

  return {
    computedHeight,
    computedLeft,
    computedPosition,
    computedScrollX,
    computedScrollY,
    computedTop,
    computedWidth,
    initializePosition,
    mousePos,
    scrollX,
    scrollY,
    setFullWindowPosition,
    setMinimizePosition,
    shiftX,
    shiftY,
    states,
    statesTmp,
    updateScroll,
  }
}
