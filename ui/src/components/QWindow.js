import {
  h,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  computed,
  watch,
  onMounted,
  ref,
  nextTick,
  createApp,
  getCurrentInstance
} from 'vue'

import {
  QBtn,
  QMenu,
  QList,
  QItem,
  QItemSection,
  QIcon,
  QSeparator,
  ClosePopup,
  Scroll,
  useQuasar
} from 'quasar'

import {
  prevent,
  stopAndPrevent
} from 'quasar/src/utils/event'


// import { QColorizeMixin } from 'q-colorize-mixin'
// import canRender from 'quasar/src/mixins/can-render'
//
// // Utils
// import { prevent, stopAndPrevent } from 'quasar/src/utils/event'
//
// mixins: [QColorizeMixin, canRender],


// the starting zIndex for floating windows
const startingZIndex = 4000

// maxZIndex is for fullscreen
// 6000 is $z-fullscreen and $z-menu
const maxZIndex = 6000 - 100

// number of windows registered globally
let QWindowCount = 0

// layered windows
const layers = {}

// default starting position
// relative to viewport for floating
// relative to document for scroll-with-window
const defaultX = 20
const defaultY = 20


const getMousePosition = function (e, type = 'x') {
  if (e.touches !== void 0) {
    if (type === 'x') {
      return e.touches[ 0 ].pageX
    }
    return e.touches[ 0 ].pageY
  } else {
    if (type === 'x') {
      return e.pageX
    }
    return e.pageY
  }
}
const getMouseShift = function (e, rect, type = 'x') {
  if (e.touches !== void 0) {
    if (type === 'x') {
      return e.touches[ 0 ].clientX - rect.left
    }
    return e.touches[ 0 ].clientY - rect.top
  } else {
    if (type === 'x') {
      return e.clientX - rect.left
    }
    return e.clientY - rect.top
  }
}


export default defineComponent({
  name: 'QWindow',
  directives: {
    ClosePopup,
    Scroll
  },
  props: {
    value: Boolean,
    title: String,
    dense: Boolean,
    embedded: Boolean,
    pinned: Boolean,
    fullscreen: Boolean,
    maximized: Boolean,
    minimized: Boolean,
    noMenu: Boolean,
    noMove: Boolean,
    noResize: Boolean,
    resizable: {
      type: Array,
      default: () => [
        'top',
        'left',
        'right',
        'bottom',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right'
      ]
    },
    scrollWithWindow: {
      type: Boolean,
      default: false
    },
    autoPin: Boolean,

    disabled: Boolean,
    hideToolbarDivider: Boolean,
    hideGrippers: Boolean,
    roundGrippers: Boolean,
    headless: Boolean,
    iconSet: Object,

    backgroundColor: {
      type: String
    },
    gripperBorderColor: {
      type: String
    },
    gripperBackgroundColor: {
      type: String
    },
    borderWidth: {
      type: String,
      default: '1px'
    },
    borderStyle: {
      type: String,
      default: 'solid'
    },

    startX: [ Number, String ],
    startY: [ Number, String ],
    width: {
      type: [ Number, String ],
      default: 400
    },
    height: {
      type: [ Number, String ],
      default: 400
    },
    actions: {
      type: Array,
      default: () => ([ 'pin', 'embedded', 'close' ]),
      validator: (v) => v.some(action => [
        'pin',
        'embedded',
        'minimize',
        'maximize',
        'close',
        'fullscreen' ].includes(action))
    },
    menuFunc: Function,
    titlebarStyle: [ String, Object, Array ],
    titlebarClass: [ String, Object, Array ],
    contentClass: [ String, Object, Array ],
    contentStyle: [ String, Object, Array ]
  },

  emits: [
    'selected',
    'input',
    'fullscreen',
    'embedded',
    'pinned',
    'maximize',
    'minimize',
    'position',
    'canceled',
    'beforeDrag',
    'afterDrag'
  ],

  setup(props, { slots, emit }) {

    const $q = useQuasar();

    // ======= REACTIVE DATA

    const state = ref({
      top: 10,
      left: 10,
      bottom: 400,
      right: 400,
      minHeight: 100,
      minWidth: 100,
      shouldDrag: false,
      dragging: false
    })

    const restoreState = ref({
      top: 10,
      left: 10,
      bottom: 400,
      right: 400,
      zIndex: 4000,
      pinned: false,
      embedded: false,
      maximize: false,
      minimize: false
    })

    const zIndex = ref(4000)
    const mouseOffsetX = ref(-1) // FIXME unused ?
    const mouseOffsetY = ref(-1) // FIXME unused ?
    const mousePos = ref({ x: 0, y: 0 })
    const scrollX = ref(0)
    const scrollY = ref(0)
    const selected = ref(false)
    const fullscreenInitiated = ref(false)
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
    const stateInfo = ref({}) // filled in mounted
    const iconSetTemplate = ref({ // uses material design icons
      visible: {
        on: {
          icon: 'close',
          label: 'Show'
        },
        off: {
          icon: 'close',
          label: 'Hide'
        }
      },
      embedded: {
        on: {
          icon: 'lock_outline',
          label: 'Embed'
        },
        off: {
          icon: 'lock_open',
          label: 'Float'
        }
      },
      pinned: {
        on: {
          icon: 'location_searching',
          label: 'Pin'
        },
        off: {
          icon: 'gps_fixed',
          label: 'Unpin'
        }
      },
      maximize: {
        on: {
          icon: 'arrow_upward',
          label: 'Maximize'
        },
        off: {
          icon: 'restore',
          label: 'Restore'
        }
      },
      fullscreen: {
        on: {
          icon: 'fullscreen',
          label: 'Enter fullscreen'
        },
        off: {
          icon: 'fullscreen_exit',
          label: 'Leave fullscreen'
        }
      }
    })
    const __portal = ref()
    const id = ref(0)


    const shiftX = ref()
    const shiftY = ref()

    // save existing position information
    const tmpTop = ref()
    const tmpLeft = ref()
    const tmpRight = ref()
    const tmpBottom = ref()
    const tmpHeight = ref()
    const tmpWidth = ref()
    const resizeHandle = ref()

    onBeforeMount(() => {
      const internalInstance = getCurrentInstance() // Correct for this ?
      console.log('Internal Instance')
      console.log(internalInstance)
      id.value = ++QWindowCount
      layers[ id.value ] = { window: internalInstance } // TODO this
    })

    onBeforeUnmount(() => {
      // just in case
      __removeClass(document.body, 'q-window__touch-action')
      fullscreenLeave()

      document.removeEventListener('scroll', __onScroll, { passive: true })
      document.body.removeEventListener('mousedown', __onMouseDownBody, { passive: false })

      __destroyPortal()
    })

    onMounted(() => {
      console.log('onMounted')
      __updateStateInfo()

      // calculate left starting position
      if (props.startX > 0) {
        state.value.left = props.startX
      } else {
        state.value.left = defaultX * QWindowCount
      }

      // calculate top starting position
      if (props.startY > 0) {
        state.value.top = props.startY
      } else {
        state.value.top = defaultY * QWindowCount
      }

      // calculate right and bottom starting positions
      state.value.right = state.value.left + props.width
      state.value.bottom = state.value.top + props.height

      // adjust initial user states
      if (props.value !== void 0) {
        if (props.value === true) {
          __setStateInfo('visible', true)
        } else {
          __setStateInfo('visible', false)
        }
      }
      if (props.embedded !== void 0) {
        if (props.embedded === true) {
          __setStateInfo('embedded', true)
        } else {
          __setStateInfo('embedded', false)
        }
      }
      if (props.pinned !== void 0) {
        if (props.pinned === true) {
          if (canDo('pinned', true)) {
            __setStateInfo('pinned', true)
          }
        } else {
          if (canDo('pinned', false)) {
            __setStateInfo('pinned', false)
          }
        }
      }
      if (props.fullscreen !== void 0) {
        if (props.fullscreen === true) {
          fullscreenEnter()
        }
      }
      if (maximize() !== void 0) {
        if (maximize() === true && __getStateInfo('fullscreen') !== true) {
          __setStateInfo('maximize', true)
        } else {
          __setStateInfo('maximize', false)
        }
      }
      if (minimize() !== void 0) {
        if (minimize() === true && __getStateInfo('fullscreen') !== true) {
          __setStateInfo('minimize', true)
        } else {
          __setStateInfo('minimize', false)
        }
      }

      // set up scroll handler
      document.addEventListener('scroll', __onScroll, { passive: true })
      // set up mousedown on body (so windows can deselect themselves on outside click)
      document.body.addEventListener('mousedown', __onMouseDownBody, { passive: false })
    })


    watch(() => props.value, (val) => {
      stateInfo.value.visible.state = val
    })

    watch(() => props.iconSet, () => {
      //  handler () {
      __updateStateInfo()
      //}

    }, { deep: true })

    watch(() => selected.value, (val) => {
      if (props.autoPin === true) {
        if (val === true) {
          unpin()
        } else {
          pin()
        }
      }
      emit('selected', selected.value)
    })


    watch(() => 'stateInfo.value.visible.state', (val) => {
      emit('input', val)
    })

    watch(() => 'stateInfo.value.embedded.state', (val) => {
      console.log('CREATE PORTAL')
      if (val !== true) {
        __createPortal()
        nextTick(() => {
          __showPortal()
          // this.$forceUpdate() // TODO
        })
      } else {
        __hidePortal()
        nextTick(() => {
          __destroyPortal()
          //this.$forceUpdate() // TODO
        })
      }
    })


    watch(() => 'stateInfo.value.maximize.state', (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        __restorePositionAndState()
      }
    })

    watch(() => 'stateInfo.value.minimize.state', (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        __restorePositionAndState()
      }
    })

    watch(() => 'stateInfo.value.fullscreen.state', (val, oldVal) => {
      if (oldVal === void 0) {
        return
      }
      if (val === true) {
        __savePositionAndState()
        zIndex.value = maxZIndex
      } else {
        __restorePositionAndState()
        fullscreenInitiated.value = val
      }
      emit('fullscreen', val)
    })

    // watch(() => '$q.fullscreen.isActive', (val) => {
    //   if (fullscreenInitiated.value === true) {
    //     __setStateInfo('fullscreen', val)
    //   }
    // })
    watch(() => '$q.screen.height', (val) => {
      if (isFullscreen.value === true) {
        state.value.bottom = val
      }
    })
    watch(() => '$q.screen.width', (val) => {
      if (isFullscreen.value === true) {
        state.value.right = val
      }
    })


// ======= COMPUTED FUNCTIONS
    const isVisible = computed(() => {
      return __getStateInfo('visible')
    })

    const isEmbedded = computed(() => {
      return __getStateInfo('embedded')
    })

    const isFloating = computed(() => {
      return __getStateInfo('embedded') !== true
    })

    const isPinned = computed(() => {
      return __getStateInfo('pinned')
    })
    const isFullscreen = computed(() => {
      return __getStateInfo('fullscreen')
    })

    const isMaximized = computed(() => {
      return __getStateInfo('maximize')
    })

    const isMinimized = computed(() => {
      return __getStateInfo('minimize')
    })

    const isDisabled = computed(() => {
      return props.disabled === true
    })

    const isEnabled = computed(() => {
      return isDisabled.value === false
    })

    const isDragging = computed(() => {
      return state.value.dragging === true
    })

    const isSelected = computed(() => {
      return selected.value === true
    })


    const canDrag = computed(() => {
      return isVisible.value === true
        && isEmbedded.value !== true
        && isPinned.value !== true
        && isFullscreen.value !== true
        && isMaximized.value !== true
        && isMinimized.value !== true
    })

    const hasStateInfo = computed(() => {
      return Object.keys(stateInfo.value).length > 0
    })

    const __computedVisibility = computed(() => {
      return isVisible.value === true ? 'visible' : 'hidden'
    })

    const computedToolbarHeight = computed(() => {
      return props.headless === true ? 0 : props.dense === true ? 28 : 40
    })

    const computedLeft = computed(() => {
      return state.value.left
    })

    const computedTop = computed(() => {
      return state.value.top
    })

    const computedRight = computed(() => {
      return state.value.right
    })

    const computedBottom = computed(() => {
      return state.value.bottom
    })

    const computedHeight = computed(() => {
      return computedBottom.value - computedTop.value
    })

    const computedWidth = computed(() => {
      return computedRight.value - computedLeft.value
    })

    const computedScrollX = computed(() => {
      return computedLeft.value + (props.scrollWithWindow === false ? scrollX.value : 0)
    })

    const computedScrollY = computed(() => {
      return computedTop.value + (props.scrollWithWindow === false ? scrollY.value : 0)
    })

    const __computedZIndex = computed(() => {
      let extra = 0
      if (isDragging.value) extra = 100
      return zIndex.value + extra
    })

    const computedPosition = computed(() => {
      return {
        left: state.value.left,
        top: state.value.top,
        width: computedWidth.value,
        height: computedHeight.value,
        scrollX: computedScrollX.value,
        scrollY: computedScrollY.value
      }
    })


    const computedActions = computed(() => {
      // sort and pick ones that are visible based on user selection and state
      const actions = []
      if (props.actions.includes('embedded') && (canDo('embedded', true) || canDo('embedded', false))) {
        actions.push('embedded')
      }
      if (props.actions.includes('pin') && (canDo('pinned', true) || canDo('pinned', false))) {
        actions.push('pinned')
      }
      if (props.actions.includes('fullscreen') && (canDo('fullscreen', true) || canDo('fullscreen', false))) {
        actions.push('fullscreen')
      }
      if (props.actions.includes('maximize') && (canDo('maximize', true) || canDo('maximize', false))) {
        actions.push('maximize')
      }
      // if (props.actions.includes('minimize') && (canDo('minimize', true) || canDo('minimize', false))) {
      //   actions.push('maximize')
      // }
      if (props.actions.includes('close') && canDo('close', true)) {
        actions.push('visible')
      }

      return actions
    })

    const computedMenuData = computed(() => {
      // get stateInfo for each menu item
      const menuData = []
      computedActions.value.map(key => {
        if (stateInfo.value[ key ]) {
          menuData.push({ ...stateInfo.value[ key ], key: key })
        }
      })
      return menuData
    })

    const __style = computed(() => {
      let style
      if (isMinimized.value === true) {
        style = {
          position: 'relative',
          visibility: __computedVisibility.value,
          height: computedToolbarHeight.value + 'px',
          borderWidth: '1px',
          borderStyle: 'solid',
         // color: props.color, // TODO
          backgroundColor: props.backgroundColor,
          minWidth: '100px'
        }
      } else if (isEmbedded.value === true) {
        style = {
          position: 'relative',
          visibility: __computedVisibility.value,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          width: '100%',
          height: '100%'
        }
      } else {
        const top = state.value.top + (props.scrollWithWindow !== true ? scrollY.value : 0)
        const left = state.value.left + (props.scrollWithWindow !== true ? scrollX.value : 0)
        style = {
          position: 'absolute',
          display: 'inline-block',
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          padding: 0,
          visibility: __computedVisibility.value,
          minWidth: '90px',
          minHeight: '50px',
          top: top + 'px',
          left: left + 'px',
          zIndex: __computedZIndex.value
        }
        if (isMaximized.value) {
          style.width = '100%'
          style.height = '100%'
        } else {
          style.width = computedWidth.value + 'px'
          style.height = computedHeight.value + 'px'
        }
      }

      if (props.contentStyle) {
        const type = Object.prototype.toString.call(props.contentStyle)
        if (type === '[object Object]') {
          style = { ...style, ...props.contentStyle }
        } else if ((type === '[object Array]')) {
          props.contentStyle.forEach(item => {
            style = { ...style, ...item }
          })
        } else if (typeof props.contentStyle === 'string') {
          const items = props.contentStyle.split(';')
          items.forEach(item => {
            const props = item.split(':')
            style[ props[ 0 ].trim() ] = props[ 1 ].trim()
          })
        }
      }

      return style
    })

    const __tbStaticClass = computed(() => {
      return 'q-window__titlebar'
        + (props.hideToolbarDivider !== true ? ' q-window__titlebar--divider' : '')
        + (props.dense === true ? ' q-window__titlebar--dense' : '')
        + (isEmbedded.value !== true && isMinimized.value !== true ? ' absolute' : '')
        + (isDragging.value === true ? ' q-window__touch-action' : '')
        + ' row justify-between items-center'
    })

    const __tbStyle = computed(() => {
      const titleHeight = `${ computedToolbarHeight.value }px`
      let style = { height: titleHeight }

      if (props.titlebarStyle) {
        if (typeof props.titlebarStyle === 'object') {
          style = Object.assign(props.titlebarStyle, style)
        } else if (typeof props.titlebarStyle === 'string') {
          style = props.titlebarStyle + '; height:' + titleHeight
        } else if (Array.isArray(props.titlebarStyle)) {
          style = props.titlebarStyle
          style.push({ height: titleHeight })
        }
      }
      return style
    })
//
    const __bodyStyle = computed(() => {
      if (isEmbedded.value === true) {
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

    const __classes = computed(() => {
      return ''
        + (isEnabled.value === true ? ' q-focusable q-hoverable' : ' disabled')
        + (isFloating.value === true && isFullscreen.value !== true ? ' q-window__floating' : '')
        + (isFullscreen.value === true ? ' q-window__fullscreen' : '')
        + (isSelected.value === true && isEmbedded.value !== true && isFullscreen.value !== true ? ' q-window__selected' : '')
        + (isDragging.value === true ? ' q-window__dragging q-window__touch-action' : '')
    })


    // ============ PUBLIC FUNCTIONS

    // show the component
    function show() {
      if (canDo('visible', true)) {
        __setStateInfo('visible', true)
        // emit('input', true)
        return true
      }
      return false
    }

    // hide the component
    function hide() {
      if (canDo('visible', false)) {
        __setStateInfo('visible', false)
        // emit('input', false)
        return true
      }
      return false
    }


    // embedded
    function lock() {
      if (canDo('embedded', true)) {
        __setStateInfo('embedded', true)
        emit('embedded', true)
        return true
      }
      return false
    }

    // floating
    function unlock() {
      if (canDo('embedded', false)) {
        __setStateInfo('embedded', false)
        emit('embedded', false)
        return true
      }
      return false
    }

    // pinned (can't move or re-size)
    function pin() {
      if (canDo('pinned', true)) {
        __setStateInfo('pinned', true)
        emit('pinned', true)

        return true
      }
      return false
    }

    // move and resize available, if not embedded
    function unpin() {
      if (canDo('pinned', false)) {
        __setStateInfo('pinned', false)
        emit('pinned', false)
        return true
      }
      return false
    }

    function maximize() {
      if (canDo('maximize', true)) {
        bringToFront()
        __savePositionAndState()
        __setFullWindowPosition()

        __setStateInfo('embedded', false)
        nextTick(() => {
          __setStateInfo('maximize', true)
          emit('maximize', true)
        })
        return true
      }
      return false
    }

    function minimize() {
      if (canDo('minimize', true)) {
        __savePositionAndState()
        __setMinimizePosition()

        __setStateInfo('embedded', true)
        __setStateInfo('minimize', true)
        emit('minimize', true)
        return true
      }
      return false
    }

    function restore() {
      if (__getStateInfo('visible') !== true) {
        // not allowed
        return
      }
      if (__getStateInfo('maximize') === true) {
        __setStateInfo('maximize', false)
        emit('maximize', false)
      } else if (__getStateInfo('minimize') === true) {
        __setStateInfo('minimize', false)
        emit('minimize', false)
      }
    }

    // go into fullscreen mode
    function fullscreenEnter() {
      if (canDo('fullscreen', true)) {
        fullscreenInitiated.value = true
       // $q.fullscreen.request()
        return true
      }
      return false
    }

    // leave fullscreen mode
    function fullscreenLeave() {
      if (canDo('fullscreen', false)) {
      // $q.fullscreen.exit()
        return true
      }
      return false
    }

    // toggle fullscreen mode
    function toggleFullscreen() {
      if (__getStateInfo('visible') !== true) {
        // not allowed
        return
      }
    //  $q.fullscreen.isActive ? fullscreenLeave() : fullscreenEnter() // TODO
    }

    // bring this window to the front
    function bringToFront() {
      // const sortedLayers = __computedSortedLayers
      const sortedLayers = __sortedLayers()
      for (let index = 0; index < sortedLayers.length; ++index) {
        const layer = sortedLayers[ index ]
        layer.zIndex = startingZIndex + index
      }
      // this window gets highest zIndex
      zIndex.value = startingZIndex + sortedLayers.length
    }

    // send this window to the back
    function sendToBack() {
      // const sortedLayers = __computedSortedLayers
      const sortedLayers = __sortedLayers()
      for (let index = 0; index < sortedLayers.length; ++index) {
        const layer = sortedLayers[ index ]
        layer.zIndex = startingZIndex + index + 1
      }
      // this window gets lowest zIndex
      zIndex.value = startingZIndex
    }

    function centerWindow() {
      const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      const startX = w / 2 - computedWidth.value / 2
      const startY = h / 2 - computedHeight.value / 2
      setXY(startX, startY)
    }

    function setX(x) {
      const w = computedWidth.value
      state.value.left = x
      state.value.right = state.value.left + w
    }

    function setY(y) {
      const h = computedHeight.value
      state.value.top = y
      state.value.bottom = state.value.top + h
    }

    function setXY(x, y) {
      setX(x)
      setY(y)
    }

    function setWidth(width) {
      state.value.right = state.value.left + width
    }

    function setHeight(height) {
      state.value.bottom = state.value.top + height
    }

    // function that returns true/false if
    // passed in mode/state can be done
    // where state = [true = 'on', false = 'off']
    function canDo(mode, state) {
      switch (mode) {
        case 'visible':
          if (state === true) {
            if (__getStateInfo('visible') !== true) {
              return true
            }
          } else {
            if (__getStateInfo('visible') === true) {
              return true
            }
          }
          return false

        case 'embedded':
          if (state === true) {
            if (__getStateInfo('embedded') !== true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          } else {
            if (__getStateInfo('embedded') === true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'pinned':
          if (state === true) {
            if (__getStateInfo('pinned') !== true
              && __getStateInfo('embedded') !== true
              && __getStateInfo('maximize') !== true
              && __getStateInfo('minimize') !== true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          } else {
            if (__getStateInfo('pinned') === true
              && __getStateInfo('embedded') !== true
              && __getStateInfo('maximize') !== true
              && __getStateInfo('minimize') !== true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'maximize':
          if (state === true) {
            if (__getStateInfo('maximize') !== true
              && __getStateInfo('embedded') !== true
              && __getStateInfo('minimize') !== true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          } else {
            if (__getStateInfo('maximize') === true
              && __getStateInfo('embedded') !== true
              && __getStateInfo('minimize') !== true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'minimize':
          if (state === true) {
            if (__getStateInfo('minimize') !== true
              && __getStateInfo('embedded') !== true
              && __getStateInfo('maximize') !== true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          } else {
            if (__getStateInfo('minimize') === true
              && __getStateInfo('embedded') !== true
              && __getStateInfo('maximize') !== true
              && __getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'fullscreen':
          if (state === true) {
            if (__getStateInfo('fullscreen') !== true
              && __getStateInfo('embedded') !== true) {
              return true
            }
          } else {
            if (__getStateInfo('fullscreen') === true
              && __getStateInfo('embedded') !== true) {
              return true
            }
          }
          return false
        case 'close':
          if (state === true) {
            if (__getStateInfo('embedded') !== true) {
              return true
            }
          } else {
            return true
          }
          return false
      }
      console.error(`QWindow unknown mode: ${ mode }`)
    }

    // ============ PRIVATE  FUNCTIONS

    function __canBeSelected(x, y) { // TODO
      // const sortedLayers = __computedSortedLayers
      const sortedLayers = __sortedLayers()
      for (let index = sortedLayers.length - 1; index >= 0; --index) {
        if (sortedLayers[ index ].__portal.value !== void 0) {
          if (__isPointInRect(x, y, sortedLayers[ index ].__portal.value.$el)) {
            if (sortedLayers[ index ].id === id.value) {
              return true
            } else {
              return false
            }
          }
        }
      }
      return false
    }

    function __isPointInRect(x, y, el) {
      // include gripper size
      const gripperSize = 10

      const rect = el.getBoundingClientRect()

      return x >= rect.left - gripperSize && x <= rect.left + rect.width + gripperSize
        && y >= rect.top - gripperSize && y <= rect.top + rect.height + gripperSize
    }

    function __sortedLayers() {
      const sortedLayers = []
      const keys = Object.keys(layers)
      for (let index = 0; index < keys.length; ++index) {
        sortedLayers.push(layers[ keys[ index ] ].window)
      }

      function sort(a, b) {
        return a.zIndex < b.zIndex ? -1 : a.zIndex === b.zIndex ? 0 : 1
      }

      sortedLayers.sort(sort)

      return sortedLayers
    }

    function __canResize(resizeHandle) {
      if (props.noResize === true) return false
      const missing = handles.value.filter(handle => !props.resizable.includes(handle))
      return missing.includes(resizeHandle) !== true
    }

    function __updateStateInfo() {
      stateInfo.value = {
        visible: {
          state: stateInfo.value.visible !== void 0 && stateInfo.value.visible.state !== void 0 ? stateInfo.value.visible.state : true,
          on: {
            label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.label !== void 0 ? props.iconSet.visible.on.label : iconSetTemplate.value.visible.on.label,
            icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.icon !== void 0 ? props.iconSet.visible.on.icon : iconSetTemplate.value.visible.on.icon,
            func: show
          },
          off: {
            label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.label !== void 0 ? props.iconSet.visible.off.label : iconSetTemplate.value.visible.off.label,
            icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.icon !== void 0 ? props.iconSet.visible.off.icon : iconSetTemplate.value.visible.off.icon,
            func: hide
          }
        },
        embedded: {
          state: stateInfo.value.embedded !== void 0 && stateInfo.value.embedded.state !== void 0 ? stateInfo.value.embedded.state : true,
          on: {
            label: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.on !== void 0 && props.iconSet.embedded.on.label !== void 0 ? props.iconSet.embedded.on.label : iconSetTemplate.value.embedded.on.label,
            icon: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.on !== void 0 && props.iconSet.embedded.on.icon !== void 0 ? props.iconSet.embedded.on.icon : iconSetTemplate.value.embedded.on.icon,
            func: lock
          },
          off: {
            label: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.off !== void 0 && props.iconSet.embedded.off.label !== void 0 ? props.iconSet.embedded.off.label : iconSetTemplate.value.embedded.off.label,
            icon: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.off !== void 0 && props.iconSet.embedded.off.icon !== void 0 ? props.iconSet.embedded.off.icon : iconSetTemplate.value.embedded.off.icon,
            func: unlock
          }
        },
        pinned: {
          state: stateInfo.value.pinned !== void 0 && stateInfo.value.pinned.state !== void 0 ? stateInfo.value.pinned.state : false,
          on: {
            label: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.on !== void 0 && props.iconSet.pinned.on.label !== void 0 ? props.iconSet.pinned.on.label : iconSetTemplate.value.pinned.on.label,
            icon: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.on !== void 0 && props.iconSet.pinned.on.icon !== void 0 ? props.iconSet.pinned.on.icon : iconSetTemplate.value.pinned.on.icon,
            func: pin
          },
          off: {
            label: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.off !== void 0 && props.iconSet.pinned.off.label !== void 0 ? props.iconSet.pinned.off.label : iconSetTemplate.value.pinned.off.label,
            icon: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.off !== void 0 && props.iconSet.pinned.off.icon !== void 0 ? props.iconSet.pinned.off.icon : iconSetTemplate.value.pinned.off.icon,
            func: unpin
          }
        },
        maximize: {
          state: stateInfo.value.maximize !== void 0 && stateInfo.value.maximize.state !== void 0 ? stateInfo.value.maximize.state : false,
          on: {
            label: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.on !== void 0 && props.iconSet.maximize.on.label !== void 0 ? props.iconSet.maximize.on.label : iconSetTemplate.value.maximize.on.label,
            icon: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.on !== void 0 && props.iconSet.maximize.on.icon !== void 0 ? props.iconSet.maximize.on.icon : iconSetTemplate.value.maximize.on.icon,
            func: maximize
          },
          off: {
            label: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.off !== void 0 && props.iconSet.maximize.off.label !== void 0 ? props.iconSet.maximize.off.label : iconSetTemplate.value.maximize.off.label,
            icon: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.off !== void 0 && props.iconSet.maximize.off.icon !== void 0 ? props.iconSet.maximize.off.icon : iconSetTemplate.value.maximize.off.icon,
            func: restore
          }
        },
        // TODO: commenting out until minimize functionality is completed
        // minimize: {
        //   state: stateInfo.value.minimize !== void 0 && stateInfo.value.minimize.state !== void 0 ? stateInfo.value.minimize.state : false,
        //   on: {
        //     label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.label !== void 0 ? props.iconSet.minimize.on.label : props.iconSetTemplate.minimize.on.label,
        //     icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.icon !== void 0 ? props.iconSet.minimize.on.icon : props.iconSetTemplate.minimize.on.icon,
        //     func: minimize
        //   },
        //   off: {
        //     label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.label !== void 0 ? props.iconSet.minimize.off.label : props.iconSetTemplate.minimize.off.label,
        //     icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.icon !== void 0 ? props.iconSet.minimize.off.icon : props.iconSetTemplate.minimize.off.icon,
        //     func: restore
        //   }
        // },
        fullscreen: {
          state: stateInfo.value.fullscreen !== void 0 && stateInfo.value.fullscreen.state !== void 0 ? stateInfo.value.fullscreen.state : false,
          on: {
            label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.label !== void 0 ? props.iconSet.fullscreen.on.label : iconSetTemplate.value.fullscreen.on.label,
            icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.icon !== void 0 ? props.iconSet.fullscreen.on.icon : iconSetTemplate.value.fullscreen.on.icon,
            func: fullscreenEnter()
          },
          off: {
            label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.label !== void 0 ? props.iconSet.fullscreen.off.label : iconSetTemplate.value.fullscreen.off.label,
            icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.icon !== void 0 ? props.iconSet.fullscreen.off.icon : iconSetTemplate.value.fullscreen.off.icon,
            func: fullscreenLeave()
          }
        }
      }
    }


    function __setStateInfo(id, val) {
      if (id in stateInfo.value) {
        stateInfo.value[ id ].state = val
        return true
      }
      return false
    }

//
    function __getStateInfo(id) {
      if (id in stateInfo.value) {
        return stateInfo.value[ id ].state
      }
      return false
    }

    function __setFullWindowPosition() {
      state.value.top = 0
      state.value.left = 0
      state.value.bottom = $q.screen.height
      state.value.right = $q.screen.width
      nextTick(() => {
        emit('position', computedPosition.value)
      })
    }

    function __setMinimizePosition() {
      const elements = document.getElementsByClassName('q-notifications__list--bottom')
      if (elements.length > 0) {
        // elements[ 0 ].appendChild(this.$el) // TODO
      }
    }

    function __savePositionAndState() {
      restoreState.value.top = state.value.top
      restoreState.value.left = state.value.left
      restoreState.value.bottom = state.value.bottom
      restoreState.value.right = state.value.right
      restoreState.value.zIndex = __computedZIndex.value
      restoreState.value.pinned = __getStateInfo('pinned')
      restoreState.value.embedded = __getStateInfo('embedded')
      restoreState.value.maximize = __getStateInfo('maximize')
      restoreState.value.minimize = __getStateInfo('minimize')
    }

    function __restorePositionAndState() {
      state.value.top = restoreState.value.top
      state.value.left = restoreState.value.left
      state.value.bottom = restoreState.value.bottom
      state.value.right = restoreState.value.right
      zIndex.value = restoreState.value.zIndex
      __setStateInfo('pinned', restoreState.value.pinned)
      __setStateInfo('embedded', restoreState.value.embedded)
      __setStateInfo('maximize', restoreState.value.maximize)
      __setStateInfo('minimize', restoreState.value.minimize)
      nextTick(() => {
        emit('position', computedPosition.value)
      })
    }

    function __addClass(el, name) {
      const arr = el.className.split(' ')
      // make sure it's not already there
      if (arr.indexOf(name) === -1) {
        arr.push(name)
        el.className = arr.join(' ')
      }
    }

    function __removeClass(el, name) {
      const arr = el.className.split(' ')
      const index = arr.indexOf(name)
      if (index !== -1) {
        arr.splice(index, 1)
        el.className = arr.join(' ')
      }
    }

    function __onScroll(e) {
      if (window !== void 0) {
        scrollY.value = window.pageYOffset
        scrollX.value = window.pageXOffset
        if (isFloating.value === true) {
          nextTick(() => {
            emit('position', computedPosition.value)
          })
        }
      }
    }


    // mousedown for document.body
    function __onMouseDownBody(e) {
      if (isEmbedded.value) {
        state.value.shouldDrag = state.value.dragging = false
        return
      }

      // if dragging, already selected
      if (state.value.dragging !== true) {
        const x = getMousePosition(e, 'x')
        const y = getMousePosition(e, 'y')

        selected.value = __canBeSelected(x - scrollX.value, y - scrollY.value)
        if (selected.value) {
          bringToFront()
        }
      }
    }

    // mousedown for element
    function __onMouseDown(e, resizeHandle) {
      __removeEventListeners(resizeHandle)

      selected.value = false
      if (e.touches === void 0 && e.buttons !== 1) {
        return
      }

      if (isEmbedded.value === true) {
        state.value.shouldDrag = state.value.dragging = false
        return
      }

      const x = getMousePosition(e, 'x')
      const y = getMousePosition(e, 'y')

      //  can window be selected
      selected.value = __canBeSelected(x - scrollX.value, y - scrollY.value)
      if (!selected.value) {
        return
      }

      // bring window to front
      bringToFront()


      resizeHandle.value = resizeHandle
      //selected.value = true

      // save mouse position
      mousePos.value.x = x
      mousePos.value.y = y

      const rect = __portal.value.$el.getBoundingClientRect()
      shiftX.value = getMouseShift(e, rect, 'x')
      shiftY.value = getMouseShift(e, rect, 'y')

      // save existing position information
      tmpTop.value = state.value.top
      tmpLeft.value = state.value.left
      tmpRight.value = state.value.right
      tmpBottom.value = state.value.bottom
      tmpHeight.value = tmpBottom.value - tmpTop.value
      tmpWidth.value = tmpRight.value - tmpLeft.value

      state.value.shouldDrag = true

      __addEventListeners()
      if (e.touches !== void 0) {
        __addClass(document.body, 'q-window__touch-action')
      }

      // stopAndPrevent(e)
      prevent(e)
    }

    function __addEventListeners() {
      document.body.addEventListener('mousemove', __onMouseMove, { capture: true })
      document.body.addEventListener('mouseup', __onMouseUp, { capture: true })
      document.body.addEventListener('keyup', __onKeyUp, { capture: true })
    }

    function __removeEventListeners() {
      document.body.removeEventListener('mousemove', __onMouseMove, { capture: true })
      document.body.removeEventListener('mouseup', __onMouseUp, { capture: true })
      document.body.removeEventListener('keyup', __onKeyUp, { capture: true })
    }


    function __onKeyUp(e) {
      // if ESC key
      if (e.keyCode === 27 && isDragging.value === true) {
        prevent(e)
        __removeEventListeners()
        state.value.shouldDrag = state.value.dragging = false
        state.value.top = tmpTop.value
        state.value.left = tmpLeft.value
        state.value.right = tmpRight.value
        state.value.bottom = tmpBottom.value
        nextTick(() => {
          emit('canceled', computedPosition.value)
        })
      }
    }


    function __onMouseMove(e, resizeHandle) {
      if (state.value.shouldDrag !== true || (e.touches === void 0 && e.buttons !== 1)) {
        __removeEventListeners()
        return
      }

      const mouseX = getMousePosition(e, 'x')
      const mouseY = getMousePosition(e, 'y')

      // wait 3 pixel move to initiate drag
      if (state.value.dragging !== true) {
        if (Math.abs(mousePos.value.x - mouseX) >= 3 || Math.abs(mousePos.value.y - mouseY) >= 3) {
          state.value.dragging = true
          emit('beforeDrag', e)
        } else {
          return
        }
      }

      switch (resizeHandle || resizeHandle.value) {
        case 'top':
          state.value.top = mouseY - window.pageYOffset - shiftY.value
          nextTick(() => {
            if (computedHeight.value < state.value.minHeight) {
              state.value.top = tmpBottom.value - state.value.minHeight // TODO
            }
          })
          break
        case 'left':
          state.value.left = mouseX - window.pageXOffset - shiftX.value
          nextTick(() => {
            if (computedWidth.value < state.value.minWidth) {
              state.value.left = tmpRight.value - state.value.minWidth // TODO
            }
          })
          break
        case 'right':
          state.value.right = mouseX - window.pageXOffset
          nextTick(() => {
            if (computedWidth.value < state.value.minWidth) {
              state.value.right = tmpLeft.value - state.value.minWidth // TODO
            }
          })
          break
        case 'bottom':
          state.value.bottom = mouseY - window.pageYOffset
          nextTick(() => {
            if (computedHeight.value < state.value.minHeight) {
              state.value.bottom = tmpTop.value - state.value.minHeight // TODO
            }
          })
          break
        case 'top-left':
          __onMouseMove(e, 'top')
          __onMouseMove(e, 'left')
          return
        case 'top-right':
          __onMouseMove(e, 'top')
          __onMouseMove(e, 'right')
          return
        case 'bottom-left':
          __onMouseMove(e, 'bottom')
          __onMouseMove(e, 'left')
          return
        case 'bottom-right':
          __onMouseMove(e, 'bottom')
          __onMouseMove(e, 'right')
          return
        case 'titlebar':
          if (props.scrollWithWindow === true) {
            state.value.top = mouseY - shiftY.value
            state.value.left = mouseX - shiftX.value
          } else {
            state.value.top = mouseY - window.pageYOffset - shiftY.value
            state.value.left = mouseX - window.pageXOffset - shiftX.value
          }
          state.value.bottom = state.value.top + tmpHeight.value
          state.value.right = state.value.left + tmpWidth.value
          break
      }

      stopAndPrevent(e)
    }


    function __onMouseUp(e) {
      if (state.value.dragging === true) {
        prevent(e)
        __removeEventListeners()
        if (e.touches !== void 0) {
          __removeClass(document.body, 'q-window__touch-action')
        }
        state.value.shouldDrag = state.value.dragging = false
        emit('afterDrag', e)
        emit('position', computedPosition.value)
      }
    }

//
    function __onTouchMove(e, resizeHandle) {
      stopAndPrevent(e)
      resizeHandle.value = resizeHandle
      // let touchY = e.touches[0].pageY
      // let touchYDelta = touchY - (lastTouchY ? lastTouchY : 0)
      // if (window.pageYOffset === 0) {
      //   // to supress pull-to-refresh preventDefault
      //   // on the overscrolling touchmove when
      //   // window.pageYOffset === 0
      //   if (touchYDelta > 0) {
      //     prevent(e)
      //   }
      // }

      __onMouseMove(e)
    }

    function __onTouchStart(e, resizeHandle) {
      stopAndPrevent(e)
      __onMouseDown(e, resizeHandle)
    }

    function __onTouchEnd(e, resizeHandle) {
      stopAndPrevent(e)
      resizeHandle.value = resizeHandle // TODO
      __onMouseUp(e)
    }

//
    function __renderMoreItem(stateInfo) {
      if (stateInfo === void 0) {
        return ''
      }

      if (typeof stateInfo === 'string' && stateInfo === 'separator') {
        return h(QSeparator)
      }

      return h(QItem, {
        key: stateInfo.key,
        // TODO
        // directives: [
        //   {
        //     name: 'close-popup',
        //     value: true
        //   }
        // ],
        clickable: true,
        dense: props.dense,
        onClick: () => (stateInfo.state === true ? stateInfo.off.func() : stateInfo.on.func())
      }, [
        h(QItemSection, {
          noWrap: true
        }, stateInfo.state === true ? stateInfo.off.label : stateInfo.on.label),
        h(QItemSection, {
          avatar: true
        }, [
          h(QIcon, {
            name: stateInfo.state === true ? stateInfo.off.icon : stateInfo.on.icon
          })
        ])
      ])
    }


    function __renderMoreItems(menuData) {
      return menuData.map(stateInfo => __renderMoreItem(stateInfo))
    }

    function __renderMoreMenu(h, menuData) {
      // these two issues happen during early render
      if (computedActions.value.length === 0) {
        return ''
      }
      if (hasStateInfo.value !== true) {
        return ''
      }

      // let user manipulate menu
      if (props.menuFunc) {
        props.menuFunc(menuData)
      }

      // this.setBothColors(props.color, props.backgroundColor, // TODO
      return h(QMenu, [
        h(QList, {
          highlight: true,
          dense: true,
          style: [{ zIndex: (isEmbedded.value === true) ? void 0 : __computedZIndex.value + 1 }]
        }, [
          ...__renderMoreItems(menuData)
        ])
      ])
    }

//
    function __renderMoreButton(menuData) {
      if (props.noMenu === true) {
        return ''
      }

      return h(QBtn, {
        class: 'q-window__titlebar--actions',
        flat: true,
        round: true,
        dense: true,
        icon: 'more_vert'
      }, [
        __renderMoreMenu(menuData)
      ])
    }

    function __renderTitle(h) {
      return h('div', {
        class: 'q-window__title col ellipsis'
      }, props.title)
    }

    function __renderTitlebar(menuData) {
      if (props.headless === true) {
        return ''
      }

      const titlebarSlot = (slots.titlebar && slots.titlebar())

      return h('div', {
        class: [ __tbStaticClass.value,props.titlebarClass ],
        style: __tbStyle.value
      }, [
        titlebarSlot === void 0 ? __renderTitle() : '',
        titlebarSlot === void 0 ? __renderMoreButton(menuData) : '',
        titlebarSlot !== void 0 ? titlebarSlot(menuData) : '',
        (canDrag.value === true)
        && __renderResizeHandle('titlebar', props.noMenu ? 0 : 35) // width of more button
      ])
    }

    // grippers can visibly be seen
    function __renderGripper(resizeHandle) {
      if (__canResize(resizeHandle) === false) {
        return ''
      }
      const staticClass = 'gripper gripper-' + resizeHandle + (props.roundGrippers === true ? ' gripper-round' : '')
      // this.setBorderColor(props.gripperBorderColor, this.setBackgroundColor(props.gripperBackgroundColor,
      return h('div', { // TODO
        ref: resizeHandle,
        class: staticClass,
        on: {
          mousedown: (e) => __onMouseDown(e, resizeHandle),
          touchstart: (e) => __onTouchStart(e, resizeHandle),
          touchmove: (e) => __onTouchMove(e, resizeHandle),
          touchend: (e) => __onTouchEnd(e, resizeHandle)
        }
      })
    }

    // resize handles are for when there are no grippers
    function __renderResizeHandle(resizeHandle, actionsWidth) {
      if (props.noMove && resizeHandle === 'titlebar') {
        return ''
      }
      if (resizeHandle !== 'titlebar' && __canResize(resizeHandle) === false) {
        return ''
      }
      const staticClass = 'q-window__resize-handle q-window__resize-handle--' + resizeHandle
      let width = computedWidth.value
      const style = {}
      if (actionsWidth && actionsWidth > 0 && canDrag.value === true) {
        width -= actionsWidth
        style.width = width + 'px'
      }
      return h('div', {
        ref: resizeHandle,
        class: staticClass,
        style: style,
        on: {
          mousedown: (e) => __onMouseDown(e, resizeHandle),
          touchstart: (e) => __onTouchStart(e, resizeHandle),
          touchmove: (e) => __onTouchMove(e, resizeHandle),
          touchend: (e) => __onTouchEnd(e, resizeHandle)
        }
      })
    }

    function __renderGrippers() {
      if (props.hideGrippers === true) {
        return ''
      }
      return handles.value.map(resizeHandle => __renderGripper(resizeHandle))
    }

    function __renderResizeHandles() {
      if (props.hideGrippers !== true) {
        return ''
      }
      return handles.value.map(resizeHandle => __renderResizeHandle(resizeHandle))
    }

    function __renderBody() {
      const defaultScopedSlot = slots.default()
      const defaultSlot = slots.default()
      return h('div', {
        class: 'q-window__body row',
        style: __bodyStyle.value
      }, [
        defaultSlot || defaultScopedSlot ? defaultScopedSlot({ zIndex: zIndex.value }) : '',
        (props.headless === true && canDrag.value === true)
        && __renderResizeHandle('titlebar', props.noMenu ? 0 : 44) // width of more button

      ])
    }

    function __render(h) {
      // get stateInfo for each menu item
      const menuData = [...computedMenuData.value]
    console.log(menuData)
      return h('div', {
        class: [ 'q-window ' + __classes.value,props.contentClass ],
        style: __style.value
      }, [
        (canDrag.value === true) && [...__renderResizeHandles()],
        (canDrag.value === true) && [...__renderGrippers()],
        __renderTitlebar(h, menuData),
        isMinimized.value !== true && __renderBody()
      ])
    }

    function __createPortal() {
      const obj = {
        name: 'QWindowPortal',
        parent: this,
        inheritAttrs: false,
        render: h => __render(h),
        //components: this.$options.components, // TODO
        //directives: this.$options.directives // TODO
      }

      // TODO FIXME
      __portal.value = createApp(obj).mount()
    }

    function __destroyPortal() {
      if (__portal.value) {
        __portal.value.$destroy()
        __portal.value.$el.remove()
        __portal.value = void 0
      }
    }

    function __showPortal() {
      if (__portal.value !== void 0 && __portal.value.showing !== true) {
        const app = document.getElementById('q-app')
        if (app) {
          app.appendChild(__portal.value.$el)
        } else {
          document.body.appendChild(__portal.value.$el)
        }
        __portal.value.showing = true
      }
    }

    function __hidePortal() {
      if (__portal.value !== void 0 && __portal.value.showing === true) {
        __portal.value.$el.remove()
        __portal.value.showing = false
      }
    }

    function renderComp() {
      console.log(__portal.value)
      if (__portal.value === void 0) {
        //return __render(h)
      }
      return ''
    }

    return renderComp()
  }
})


