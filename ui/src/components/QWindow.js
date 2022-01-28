import {
  h,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  computed,
  watch,
  onMounted,
  ref
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

// the starting zIndex for floating windows
const startingZIndex = 4000

// maxZIndex is for fullscreen
// 6000 is $z-fullscreen and $z-menu
const maxZIndex = 6000 - 100

// number of windows registered globally
const QWindowCount = 0

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
      return e.touches[0].pageX
    }
    return e.touches[0].pageY
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
      return e.touches[0].clientX - rect.left
    }
    return e.touches[0].clientY - rect.top
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

    startX: [Number, String],
    startY: [Number, String],
    width: {
      type: [Number, String],
      default: 400
    },
    height: {
      type: [Number, String],
      default: 400
    },
    actions: {
      type: Array,
      default: () => (['pin', 'embedded', 'close']),
      validator: (v) => v.some(action => [
        'pin',
        'embedded',
        'minimize',
        'maximize',
        'close',
        'fullscreen'].includes(action))
    },
    menuFunc: Function,
    titlebarStyle: [String, Object, Array],
    titlebarClass: [String, Object, Array],
    contentClass: [String, Object, Array],
    contentStyle: [String, Object, Array]
  },
  setup(props, {slots}) {


    onBeforeMount(() => {
      this.id = ++QWindowCount
      this.$set(layers, this.id, {window: this})
    })

    onBeforeUnmount(() => {
      // just in case
      this.__removeClass(document.body, 'q-window__touch-action')
      this.fullscreenLeave()

      document.removeEventListener('scroll', this.__onScroll, {passive: true})
      document.body.removeEventListener('mousedown', this.__onMouseDownBody, {passive: false})

      this.__destroyPortal()
    })

    onMounted(() => {
      this.__updateStateInfo()

      // calculate left starting position
      if (this.startX > 0) {
        this.state.left = this.startX
      } else {
        this.state.left = defaultX * QWindowCount
      }

      // calculate top starting position
      if (this.startY > 0) {
        this.state.top = this.startY
      } else {
        this.state.top = defaultY * QWindowCount
      }

      // calculate right and bottom starting positions
      this.state.right = this.state.left + this.width
      this.state.bottom = this.state.top + this.height

      // adjust initial user states
      if (this.value !== void 0) {
        if (this.value === true) {
          this.__setStateInfo('visible', true)
        } else {
          this.__setStateInfo('visible', false)
        }
      }
      if (this.embedded !== void 0) {
        if (this.embedded === true) {
          this.__setStateInfo('embedded', true)
        } else {
          this.__setStateInfo('embedded', false)
        }
      }
      if (this.pinned !== void 0) {
        if (this.pinned === true) {
          if (this.canDo('pinned', true)) {
            this.__setStateInfo('pinned', true)
          }
        } else {
          if (this.canDo('pinned', false)) {
            this.__setStateInfo('pinned', false)
          }
        }
      }
      if (this.fullscreen !== void 0) {
        if (this.fullscreen === true) {
          this.fullscreenEnter()
        }
      }
      if (this.maximize !== void 0) {
        if (this.maximize === true && this.__getStateInfo('fullscreen') !== true) {
          this.__setStateInfo('maximize', true)
        } else {
          this.__setStateInfo('maximize', false)
        }
      }
      if (this.minimize !== void 0) {
        if (this.minimize === true && this.__getStateInfo('fullscreen') !== true) {
          this.__setStateInfo('minimize', true)
        } else {
          this.__setStateInfo('minimize', false)
        }
      }

      // set up scroll handler
      document.addEventListener('scroll', this.__onScroll, {passive: true})
      // set up mousedown on body (so windows can deselect themselves on outside click)
      document.body.addEventListener('mousedown', this.__onMouseDownBody, {passive: false})
    })


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
    const mouseOffsetX = ref(-1)
    const mouseOffsetY = ref(-1)
    const mousePos = ref({x: 0, y: 0})
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
    const stateInfo = ref() // filled in mounted
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


    //const __removeClass = computed((el, name) => {
    //  const arr = el.className.split(' ')
    //  const index = arr.indexOf(name)
    // if (index !== -1) {
    //    arr.splice(index, 1)
    //    el.className = arr.join(' ')
    //  }
    // })

    //   __setStateInfo (id, val) {
//     if (id in this.stateInfo) {
//       this.stateInfo[id].state = val
//       return true
//     }
//     return false
//   },
//
    function __getStateInfo(id) {
      // if (id in this.stateInfo) {
      //  return this.stateInfo[id].state
      //}
      return false
    }


    //   value (val) {
//     this.stateInfo.visible.state = val
//   },
    watch(() => props.iconSet, () => {
      // handler () {
      this.__updateStateInfo()
      //}

    }, {deep: true})

    watch(() => selected, (val) => {
      if (this.autoPin === true) {
        if (val === true) {
          this.unpin()
        } else {
          this.pin()
        }
      }
      this.$emit('selected', this.selected)
    })


    watch(() => 'stateInfo.visible.state', (val) => {
      this.$emit('input', val)
    })

    watch(() => 'stateInfo.embedded.state', (val) => {
      if (val !== true) {
        this.__createPortal()
        this.$nextTick(() => {
          this.__showPortal()
          this.$forceUpdate()
        })
      } else {
        this.__hidePortal()
        this.$nextTick(() => {
          this.__destroyPortal()
          this.$forceUpdate()
        })
      }
    })


    watch(() => 'stateInfo.maximize.state', (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        this.__restorePositionAndState()
      }
    })

    watch(() => 'stateInfo.minimize.state', (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        this.__restorePositionAndState()
      }
    })

    watch(() => 'stateInfo.fullscreen.state', (val, oldVal) => {
      if (oldVal === void 0) {
        return
      }
      if (val === true) {
        this.__savePositionAndState()
        this.zIndex = maxZIndex
      } else {
        this.__restorePositionAndState()
        this.fullscreenInitiated = val
      }
      this.$emit('fullscreen', val)
    })

    watch(() => '$q.fullscreen.isActive', (val) => {
      if (this.fullscreenInitiated === true) {
        this.__setStateInfo('fullscreen', val)
      }
    })
    watch(() => '$q.screen.height', (val) => {
      if (this.isFullscreen === true) {
        this.state.bottom = val
      }
    })
    watch(() => '$q.screen.width', (val) => {
      if (this.isFullscreen === true) {
        this.state.right = val
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
      return disabled === true
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
      //let extra = 0
      //if (this.isDragging) extra = 100
      return this.zIndex + extra
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
      // if (this.actions.includes('minimize') && (this.canDo('minimize', true) || this.canDo('minimize', false))) {
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
        // if (this.stateInfo[key]) {
        //   menuData.push({ ...this.stateInfo[key], key: key })
        // }
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
          color: props.color,
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

      if (this.contentStyle) {
        const type = Object.prototype.toString.call(props.contentStyle)
        if (type === '[object Object]') {
          style = {...style, ...props.contentStyle}
        } else if ((type === '[object Array]')) {
          props.contentStyle.forEach(item => {
            style = {...style, ...item}
          })
        } else if (typeof props.contentStyle === 'string') {
          const items = props.contentStyle.split(';')
          items.forEach(item => {
            const props = item.split(':')
            style[props[0].trim()] = props[1].trim()
          })
        }
      }

      return style
    })
//
    const __tbStaticClass = computed(() => {
      return 'q-window__titlebar'
        + (props.hideToolbarDivider !== true ? ' q-window__titlebar--divider' : '')
        + (props.dense === true ? ' q-window__titlebar--dense' : '')
        + (isEmbedded.value !== true && isMinimized.value !== true ? ' absolute' : '')
        + (isDragging.value === true ? ' q-window__touch-action' : '')
        + ' row justify-between items-center'
    })

    const __tbStyle = computed(() => {
      const titleHeight = `${computedToolbarHeight.value}px`
      let style = {height: titleHeight}

      if (props.titlebarStyle) {
        if (typeof props.titlebarStyle === 'object') {
          style = Object.assign(props.titlebarStyle, style)
        } else if (typeof props.titlebarStyle === 'string') {
          style = props.titlebarStyle + '; height:' + titleHeight
        } else if (Array.isArray(props.titlebarStyle)) {
          style = props.titlebarStyle
          style.push({height: titleHeight})
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
          height: `calc(100% - ${computedToolbarHeight.value}px`,
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

    //
    // show the component
    function show() {
      if (canDo('visible', true)) {
        __setStateInfo('visible', true)
        //this.$emit('input', true)
        return true
      }
      return false
    }

    // hide the component
    function hide() {
      if (canDo('visible', false)) {
        __setStateInfo('visible', false)
        //this.$emit('input', false)
        return true
      }
      return false
    }

//
//   // embedded
    function lock() {
      if (canDo('embedded', true)) {
        __setStateInfo('embedded', true)
        this.$emit('embedded', true)
        return true
      }
      return false
    }

    // floating
    function unlock() {
      if (canDo('embedded', false)) {
        __setStateInfo('embedded', false)
        this.$emit('embedded', false)
        return true
      }
      return false
    }

    // pinned (can't move or re-size)
    function pin() {
      if (canDo('pinned', true)) {
        __setStateInfo('pinned', true)
        this.$emit('pinned', true)
        return true
      }
      return false
    }

    // move and resize available, if not embedded
    function unpin() {
      if (canDo('pinned', false)) {
        __setStateInfo('pinned', false)
        this.$emit('pinned', false)
        return true
      }
      return false
    }

    function maximize() {
      if (canDo('maximize', true)) {
        bringToFront()
        __savePositionAndState()
        __setFullWindowPosition()

        this.__setStateInfo('embedded', false)
        this.$nextTick(() => {
          this.__setStateInfo('maximize', true)
          this.$emit('maximize', true)
        })
        return true
      }
      return false
    }

    function minimize() {
      if (this.canDo('minimize', true)) {
        this.__savePositionAndState()
        this.__setMinimizePosition()

        this.__setStateInfo('embedded', true)
        this.__setStateInfo('minimize', true)
        this.$emit('minimize', true)
        return true
      }
      return false
    }

    function restore() {
      if (this.__getStateInfo('visible') !== true) {
        // not allowed
        return
      }
      if (this.__getStateInfo('maximize') === true) {
        this.__setStateInfo('maximize', false)
        this.$emit('maximize', false)
      } else if (this.__getStateInfo('minimize') === true) {
        this.__setStateInfo('minimize', false)
        this.$emit('minimize', false)
      }
    }

    // go into fullscreen mode
    function fullscreenEnter() {
      if (canDo('fullscreen', true)) {
        this.fullscreenInitiated = true
        this.$q.fullscreen.request()
        return true
      }
      return false
    }

    // leave fullscreen mode
    function fullscreenLeave() {
      if (canDo('fullscreen', false)) {
        this.$q.fullscreen.exit()
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
      this.$q.fullscreen.isActive ? fullscreenLeave() : fullscreenEnter()
    }

    // bring this window to the front
    function bringToFront() {
      // const sortedLayers = this.__computedSortedLayers
      const sortedLayers = this.__sortedLayers()
      for (let index = 0; index < sortedLayers.length; ++index) {
        const layer = sortedLayers[index]
        layer.zIndex = startingZIndex + index
      }
      // this window gets highest zIndex
      this.zIndex = startingZIndex + sortedLayers.length
    }

    // send this window to the back
    function sendToBack() {
      // const sortedLayers = this.__computedSortedLayers
      const sortedLayers = this.__sortedLayers()
      for (let index = 0; index < sortedLayers.length; ++index) {
        const layer = sortedLayers[index]
        layer.zIndex = startingZIndex + index + 1
      }
      // this window gets lowest zIndex
      this.zIndex = startingZIndex
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

    //   // function that returns true/false if
//   // passed in mode/state can be done
//   // where state = [true = 'on', false = 'off']
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
      console.error(`QWindow unknown mode: ${mode}`)
    }

    // ============ PRIVATE  FUNCTIONS

    function __canBeSelected(x, y) {
      // const sortedLayers = this.__computedSortedLayers
      const sortedLayers = __sortedLayers()
      for (let index = sortedLayers.length - 1; index >= 0; --index) {
        if (sortedLayers[index].__portal !== void 0) {
          if (__isPointInRect(x, y, sortedLayers[index].__portal.$el)) {
            if (sortedLayers[index].id === this.id) {
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

      return x >= rect.left - gripperSize && x <= rect.left + rect.width + gripperSize &&
        y >= rect.top - gripperSize && y <= rect.top + rect.height + gripperSize
    }

    function __sortedLayers() {
      const sortedLayers = []
      const keys = Object.keys(layers)
      for (let index = 0; index < keys.length; ++index) {
        sortedLayers.push(layers[keys[index]].window)
      }

      function sort(a, b) {
        return a.zIndex < b.zIndex ? -1 : a.zIndex === b.zIndex ? 0 : 1
      }

      sortedLayers.sort(sort)

      return sortedLayers
    }

    function __canResize(resizeHandle) {
      if (this.noResize === true) return false
      const missing = this.handles.filter(handle => !this.resizable.includes(handle))
      return missing.includes(resizeHandle) !== true
    }

    function __updateStateInfo() {
      const stateInfo = {
        visible: {
          state: this.stateInfo.visible !== void 0 && this.stateInfo.visible.state !== void 0 ? this.stateInfo.visible.state : true,
          on: {
            label: this.iconSet !== void 0 && this.iconSet.visible !== void 0 && this.iconSet.visible.on !== void 0 && this.iconSet.visible.on.label !== void 0 ? this.iconSet.visible.on.label : this.iconSetTemplate.visible.on.label,
            icon: this.iconSet !== void 0 && this.iconSet.visible !== void 0 && this.iconSet.visible.on !== void 0 && this.iconSet.visible.on.icon !== void 0 ? this.iconSet.visible.on.icon : this.iconSetTemplate.visible.on.icon,
            func: this.show
          },
          off: {
            label: this.iconSet !== void 0 && this.iconSet.visible !== void 0 && this.iconSet.visible.off !== void 0 && this.iconSet.visible.off.label !== void 0 ? this.iconSet.visible.off.label : this.iconSetTemplate.visible.off.label,
            icon: this.iconSet !== void 0 && this.iconSet.visible !== void 0 && this.iconSet.visible.off !== void 0 && this.iconSet.visible.off.icon !== void 0 ? this.iconSet.visible.off.icon : this.iconSetTemplate.visible.off.icon,
            func: this.hide
          }
        },
        embedded: {
          state: this.stateInfo.embedded !== void 0 && this.stateInfo.embedded.state !== void 0 ? this.stateInfo.embedded.state : true,
          on: {
            label: this.iconSet !== void 0 && this.iconSet.embedded !== void 0 && this.iconSet.embedded.on !== void 0 && this.iconSet.embedded.on.label !== void 0 ? this.iconSet.embedded.on.label : this.iconSetTemplate.embedded.on.label,
            icon: this.iconSet !== void 0 && this.iconSet.embedded !== void 0 && this.iconSet.embedded.on !== void 0 && this.iconSet.embedded.on.icon !== void 0 ? this.iconSet.embedded.on.icon : this.iconSetTemplate.embedded.on.icon,
            func: this.lock
          },
          off: {
            label: this.iconSet !== void 0 && this.iconSet.embedded !== void 0 && this.iconSet.embedded.off !== void 0 && this.iconSet.embedded.off.label !== void 0 ? this.iconSet.embedded.off.label : this.iconSetTemplate.embedded.off.label,
            icon: this.iconSet !== void 0 && this.iconSet.embedded !== void 0 && this.iconSet.embedded.off !== void 0 && this.iconSet.embedded.off.icon !== void 0 ? this.iconSet.embedded.off.icon : this.iconSetTemplate.embedded.off.icon,
            func: this.unlock
          }
        },
        pinned: {
          state: this.stateInfo.pinned !== void 0 && this.stateInfo.pinned.state !== void 0 ? this.stateInfo.pinned.state : false,
          on: {
            label: this.iconSet !== void 0 && this.iconSet.pinned !== void 0 && this.iconSet.pinned.on !== void 0 && this.iconSet.pinned.on.label !== void 0 ? this.iconSet.pinned.on.label : this.iconSetTemplate.pinned.on.label,
            icon: this.iconSet !== void 0 && this.iconSet.pinned !== void 0 && this.iconSet.pinned.on !== void 0 && this.iconSet.pinned.on.icon !== void 0 ? this.iconSet.pinned.on.icon : this.iconSetTemplate.pinned.on.icon,
            func: this.pin
          },
          off: {
            label: this.iconSet !== void 0 && this.iconSet.pinned !== void 0 && this.iconSet.pinned.off !== void 0 && this.iconSet.pinned.off.label !== void 0 ? this.iconSet.pinned.off.label : this.iconSetTemplate.pinned.off.label,
            icon: this.iconSet !== void 0 && this.iconSet.pinned !== void 0 && this.iconSet.pinned.off !== void 0 && this.iconSet.pinned.off.icon !== void 0 ? this.iconSet.pinned.off.icon : this.iconSetTemplate.pinned.off.icon,
            func: this.unpin
          }
        },
        maximize: {
          state: this.stateInfo.maximize !== void 0 && this.stateInfo.maximize.state !== void 0 ? this.stateInfo.maximize.state : false,
          on: {
            label: this.iconSet !== void 0 && this.iconSet.maximize !== void 0 && this.iconSet.maximize.on !== void 0 && this.iconSet.maximize.on.label !== void 0 ? this.iconSet.maximize.on.label : this.iconSetTemplate.maximize.on.label,
            icon: this.iconSet !== void 0 && this.iconSet.maximize !== void 0 && this.iconSet.maximize.on !== void 0 && this.iconSet.maximize.on.icon !== void 0 ? this.iconSet.maximize.on.icon : this.iconSetTemplate.maximize.on.icon,
            func: this.maximize
          },
          off: {
            label: this.iconSet !== void 0 && this.iconSet.maximize !== void 0 && this.iconSet.maximize.off !== void 0 && this.iconSet.maximize.off.label !== void 0 ? this.iconSet.maximize.off.label : this.iconSetTemplate.maximize.off.label,
            icon: this.iconSet !== void 0 && this.iconSet.maximize !== void 0 && this.iconSet.maximize.off !== void 0 && this.iconSet.maximize.off.icon !== void 0 ? this.iconSet.maximize.off.icon : this.iconSetTemplate.maximize.off.icon,
            func: this.restore
          }
        },
        // TODO: commenting out until minimize functionality is completed
        // minimize: {
        //   state: this.stateInfo.minimize !== void 0 && this.stateInfo.minimize.state !== void 0 ? this.stateInfo.minimize.state : false,
        //   on: {
        //     label: this.iconSet !== void 0 && this.iconSet.minimize !== void 0 && this.iconSet.minimize.on !== void 0 && this.iconSet.minimize.on.label !== void 0 ? this.iconSet.minimize.on.label : this.iconSetTemplate.minimize.on.label,
        //     icon: this.iconSet !== void 0 && this.iconSet.minimize !== void 0 && this.iconSet.minimize.on !== void 0 && this.iconSet.minimize.on.icon !== void 0 ? this.iconSet.minimize.on.icon : this.iconSetTemplate.minimize.on.icon,
        //     func: this.minimize
        //   },
        //   off: {
        //     label: this.iconSet !== void 0 && this.iconSet.minimize !== void 0 && this.iconSet.minimize.off !== void 0 && this.iconSet.minimize.off.label !== void 0 ? this.iconSet.minimize.off.label : this.iconSetTemplate.minimize.off.label,
        //     icon: this.iconSet !== void 0 && this.iconSet.minimize !== void 0 && this.iconSet.minimize.off !== void 0 && this.iconSet.minimize.off.icon !== void 0 ? this.iconSet.minimize.off.icon : this.iconSetTemplate.minimize.off.icon,
        //     func: this.restore
        //   }
        // },
        fullscreen: {
          state: this.stateInfo.fullscreen !== void 0 && this.stateInfo.fullscreen.state !== void 0 ? this.stateInfo.fullscreen.state : false,
          on: {
            label: this.iconSet !== void 0 && this.iconSet.fullscreen !== void 0 && this.iconSet.fullscreen.on !== void 0 && this.iconSet.fullscreen.on.label !== void 0 ? this.iconSet.fullscreen.on.label : this.iconSetTemplate.fullscreen.on.label,
            icon: this.iconSet !== void 0 && this.iconSet.fullscreen !== void 0 && this.iconSet.fullscreen.on !== void 0 && this.iconSet.fullscreen.on.icon !== void 0 ? this.iconSet.fullscreen.on.icon : this.iconSetTemplate.fullscreen.on.icon,
            func: this.fullscreenEnter
          },
          off: {
            label: this.iconSet !== void 0 && this.iconSet.fullscreen !== void 0 && this.iconSet.fullscreen.off !== void 0 && this.iconSet.fullscreen.off.label !== void 0 ? this.iconSet.fullscreen.off.label : this.iconSetTemplate.fullscreen.off.label,
            icon: this.iconSet !== void 0 && this.iconSet.fullscreen !== void 0 && this.iconSet.fullscreen.off !== void 0 && this.iconSet.fullscreen.off.icon !== void 0 ? this.iconSet.fullscreen.off.icon : this.iconSetTemplate.fullscreen.off.icon,
            func: this.fullscreenLeave
          }
        }
      }
      this.stateInfo = stateInfo
    }


    function __setStateInfo(id, val) {
      if (id in this.stateInfo) {
        this.stateInfo[id].state = val
        return true
      }
      return false
    }

//
    function __getStateInfo(id) {
      if (id in this.stateInfo) {
        return this.stateInfo[id].state
      }
      return false
    }

    function __setFullWindowPosition() {
      this.state.top = 0
      this.state.left = 0
      this.state.bottom = this.$q.screen.height
      this.state.right = this.$q.screen.width
      this.$nextTick(() => {
        this.$emit('position', this.computedPosition)
      })
    }

    function __setMinimizePosition() {
      const elements = document.getElementsByClassName('q-notifications__list--bottom')
      if (elements.length > 0) {
        elements[0].appendChild(this.$el)
      }
    }

    function __savePositionAndState() {
      this.restoreState.top = this.state.top
      this.restoreState.left = this.state.left
      this.restoreState.bottom = this.state.bottom
      this.restoreState.right = this.state.right
      this.restoreState.zIndex = this.__computedZIndex
      this.restoreState.pinned = this.__getStateInfo('pinned')
      this.restoreState.embedded = this.__getStateInfo('embedded')
      this.restoreState.maximize = this.__getStateInfo('maximize')
      this.restoreState.minimize = this.__getStateInfo('minimize')
    }

    function __restorePositionAndState() {
      this.state.top = this.restoreState.top
      this.state.left = this.restoreState.left
      this.state.bottom = this.restoreState.bottom
      this.state.right = this.restoreState.right
      this.zIndex = this.restoreState.zIndex
      this.__setStateInfo('pinned', this.restoreState.pinned)
      this.__setStateInfo('embedded', this.restoreState.embedded)
      this.__setStateInfo('maximize', this.restoreState.maximixe)
      this.__setStateInfo('minimize', this.restoreState.minimize)
      this.$nextTick(() => {
        this.$emit('position', this.computedPosition)
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
        this.scrollY = window.pageYOffset
        this.scrollX = window.pageXOffset
        if (this.isFloating === true) {
          this.$nextTick(() => {
            this.$emit('position', this.computedPosition)
          })
        }
      }
    }


    // mousedown for document.body
    function __onMouseDownBody(e) {
      if (this.isEmbedded) {
        this.state.shouldDrag = this.state.dragging = false
        return
      }

      // if dragging, already selected
      if (this.state.dragging !== true) {
        const x = getMousePosition(e, 'x')
        const y = getMousePosition(e, 'y')

        this.selected = this.__canBeSelected(x - this.scrollX, y - this.scrollY)
        if (this.selected) {
          this.bringToFront()
        }
      }
    }

    // mousedown for element
    function __onMouseDown(e, resizeHandle) {
      this.__removeEventListeners(resizeHandle)

      this.selected = false
      if (e.touches === void 0 && e.buttons !== 1) {
        return
      }

      if (this.isEmbedded === true) {
        this.state.shouldDrag = this.state.dragging = false
        return
      }

      const x = getMousePosition(e, 'x')
      const y = getMousePosition(e, 'y')

      //  can window be selected
      this.selected = this.__canBeSelected(x - this.scrollX, y - this.scrollY)
      if (!this.selected) {
        return
      }

      // bring window to front
      this.bringToFront()


      this.resizeHandle = resizeHandle
      // this.selected = true

      // save mouse position
      this.mousePos.x = x
      this.mousePos.y = y

      const rect = this.__portal.$el.getBoundingClientRect()
      this.shiftX = getMouseShift(e, rect, 'x')
      this.shiftY = getMouseShift(e, rect, 'y')

      // save existing position information
      this.tmpTop = this.state.top
      this.tmpLeft = this.state.left
      this.tmpRight = this.state.right
      this.tmpBottom = this.state.bottom
      this.tmpHeight = this.tmpBottom - this.tmpTop
      this.tmpWidth = this.tmpRight - this.tmpLeft

      this.state.shouldDrag = true

      this.__addEventListeners()
      if (e.touches !== void 0) {
        this.__addClass(document.body, 'q-window__touch-action')
      }

      // stopAndPrevent(e)
      prevent(e)
    }

    function __addEventListeners() {
      document.body.addEventListener('mousemove', this.__onMouseMove, {capture: true})
      document.body.addEventListener('mouseup', this.__onMouseUp, {capture: true})
      document.body.addEventListener('keyup', this.__onKeyUp, {capture: true})
    }

    function __removeEventListeners() {
      document.body.removeEventListener('mousemove', this.__onMouseMove, {capture: true})
      document.body.removeEventListener('mouseup', this.__onMouseUp, {capture: true})
      document.body.removeEventListener('keyup', this.__onKeyUp, {capture: true})
    }


    function __onKeyUp(e) {
      // if ESC key
      if (e.keyCode === 27 && this.isDragging === true) {
        prevent(e)
        this.__removeEventListeners()
        this.state.shouldDrag = this.state.dragging = false
        this.state.top = this.tmpTop
        this.state.left = this.tmpLeft
        this.state.right = this.tmpRight
        this.state.bottom = this.tmpBottom
        this.$nextTick(() => {
          this.$emit('canceled', this.computedPosition)
        })
      }
    }


    function __onMouseMove(e, resizeHandle) {
      if (this.state.shouldDrag !== true || (e.touches === void 0 && e.buttons !== 1)) {
        this.__removeEventListeners()
        return
      }

      const mouseX = getMousePosition(e, 'x')
      const mouseY = getMousePosition(e, 'y')

      // wait 3 pixel move to initiate drag
      if (this.state.dragging !== true) {
        if (Math.abs(this.mousePos.x - mouseX) >= 3 || Math.abs(this.mousePos.y - mouseY) >= 3) {
          this.state.dragging = true
          this.$emit('beforeDrag', e)
        } else {
          return
        }
      }

      switch (resizeHandle || this.resizeHandle) {
        case 'top':
          this.state.top = mouseY - window.pageYOffset - this.shiftY
          this.$nextTick(() => {
            if (this.computedHeight < this.state.minHeight) {
              this.state.top = this.tmpBottom - this.state.minHeight
            }
          })
          break
        case 'left':
          this.state.left = mouseX - window.pageXOffset - this.shiftX
          this.$nextTick(() => {
            if (this.computedWidth < this.state.minWidth) {
              this.state.left = this.tmpRight - this.state.minWidth
            }
          })
          break
        case 'right':
          this.state.right = mouseX - window.pageXOffset
          this.$nextTick(() => {
            if (this.computedWidth < this.state.minWidth) {
              this.state.right = this.tmpLeft - this.state.minWidth
            }
          })
          break
        case 'bottom':
          this.state.bottom = mouseY - window.pageYOffset
          this.$nextTick(() => {
            if (this.computedHeight < this.state.minHeight) {
              this.state.bottom = this.tmpTop - this.state.minHeight
            }
          })
          break
        case 'top-left':
          this.__onMouseMove(e, 'top')
          this.__onMouseMove(e, 'left')
          return
        case 'top-right':
          this.__onMouseMove(e, 'top')
          this.__onMouseMove(e, 'right')
          return
        case 'bottom-left':
          this.__onMouseMove(e, 'bottom')
          this.__onMouseMove(e, 'left')
          return
        case 'bottom-right':
          this.__onMouseMove(e, 'bottom')
          this.__onMouseMove(e, 'right')
          return
        case 'titlebar':
          if (this.scrollWithWindow === true) {
            this.state.top = mouseY - this.shiftY
            this.state.left = mouseX - this.shiftX
          } else {
            this.state.top = mouseY - window.pageYOffset - this.shiftY
            this.state.left = mouseX - window.pageXOffset - this.shiftX
          }
          this.state.bottom = this.state.top + this.tmpHeight
          this.state.right = this.state.left + this.tmpWidth
          break
      }

      stopAndPrevent(e)
    }


    function __onMouseUp(e) {
      if (this.state.dragging === true) {
        prevent(e)
        this.__removeEventListeners()
        if (e.touches !== void 0) {
          this.__removeClass(document.body, 'q-window__touch-action')
        }
        this.state.shouldDrag = this.state.dragging = false
        this.$emit('afterDrag', e)
        this.$emit('position', this.computedPosition)
      }
    }

//
    function __onTouchMove(e, resizeHandle) {
      stopAndPrevent(e)
      this.resizeHandle = resizeHandle
      // let touchY = e.touches[0].pageY
      // let touchYDelta = touchY - (this.lastTouchY ? this.lastTouchY : 0)
      // if (window.pageYOffset === 0) {
      //   // to supress pull-to-refresh preventDefault
      //   // on the overscrolling touchmove when
      //   // window.pageYOffset === 0
      //   if (touchYDelta > 0) {
      //     prevent(e)
      //   }
      // }

      this.__onMouseMove(e)
    }

    function __onTouchStart(e, resizeHandle) {
      stopAndPrevent(e)
      this.__onMouseDown(e, resizeHandle)
    }

    function __onTouchEnd(e, resizeHandle) {
      stopAndPrevent(e)
      this.resizeHandle = resizeHandle
      this.__onMouseUp(e)
    }

//
    function __renderMoreItem(h, stateInfo) {
      if (stateInfo === void 0) {
        return ''
      }

      if (typeof stateInfo === 'string' && stateInfo === 'separator') {
        return h(QSeparator)
      }

      return h(QItem, {
        attrs: {
          key: stateInfo.key
        },
        directives: [
          {
            name: 'close-popup',
            value: true
          }
        ],
        props: {
          clickable: true,
          dense: this.dense
        },
        on: {
          click: () => (stateInfo.state === true ? stateInfo.off.func() : stateInfo.on.func())
        }
      }, [
        h(QItemSection, {
          props: {
            noWrap: true
          }
        }, stateInfo.state === true ? stateInfo.off.label : stateInfo.on.label),
        h(QItemSection, {
          props: {
            avatar: true
          }
        }, [
          h(QIcon, {
            props: {
              name: stateInfo.state === true ? stateInfo.off.icon : stateInfo.on.icon
            }
          })
        ])
      ])
    }


    function __renderMoreItems(h, menuData) {
      return menuData.map(stateInfo => this.__renderMoreItem(h, stateInfo))
    }

    function __renderMoreMenu(h, menuData) {
      // these two issues happen during early render
      if (this.computedActions.length === 0) {
        return ''
      }
      if (this.hasStateInfo !== true) {
        return ''
      }

      // let user manipulate menu
      if (this.menuFunc) {
        this.menuFunc(menuData)
      }

      return h(QMenu, [
        h(QList, this.setBothColors(this.color, this.backgroundColor, {
          props: {
            highlight: true,
            dense: true
          },
          style: {
            zIndex: (this.isEmbedded === true) ? void 0 : this.__computedZIndex + 1
          }
        }), [
          ...this.__renderMoreItems(h, menuData)
        ])
      ])
    }

//
    function __renderMoreButton(h, menuData) {
      if (this.noMenu === true) {
        return ''
      }

      return h(QBtn, {
        staticClass: 'q-window__titlebar--actions',
        props: {
          flat: true,
          round: true,
          dense: true,
          icon: 'more_vert'
        }
      }, [
        this.__renderMoreMenu(h, menuData)
      ])
    }

    function __renderTitle(h) {
      return h('div', {
        staticClass: 'q-window__title col ellipsis'
      }, this.title)
    }

    function __renderTitlebar(h, menuData) {
      if (this.headless === true) {
        return ''
      }

      const titlebarSlot = this.$scopedSlots.titlebar

      return h('div', {
        staticClass: this.__tbStaticClass,
        class: this.titlebarClass,
        style: this.__tbStyle
      }, [
        titlebarSlot === void 0 ? this.__renderTitle(h) : '',
        titlebarSlot === void 0 ? this.__renderMoreButton(h, menuData) : '',
        titlebarSlot !== void 0 ? titlebarSlot(menuData) : '',
        (this.canDrag === true) &&
        this.__renderResizeHandle(h, 'titlebar', this.noMenu ? 0 : 35) // width of more button
      ])
    }

    // grippers can visibly be seen
    function __renderGripper(h, resizeHandle) {
      if (this.__canResize(resizeHandle) === false) {
        return ''
      }
      const staticClass = 'gripper gripper-' + resizeHandle + (this.roundGrippers === true ? ' gripper-round' : '')
      return h('div', this.setBorderColor(this.gripperBorderColor, this.setBackgroundColor(this.gripperBackgroundColor, {
        ref: resizeHandle,
        staticClass: staticClass,
        on: {
          mousedown: (e) => this.__onMouseDown(e, resizeHandle),
          touchstart: (e) => this.__onTouchStart(e, resizeHandle),
          touchmove: (e) => this.__onTouchMove(e, resizeHandle),
          touchend: (e) => this.__onTouchEnd(e, resizeHandle)
        }
      })))
    }

    // resize handles are for when there are no grippers
    function __renderResizeHandle(h, resizeHandle, actionsWidth) {
      if (this.noMove && resizeHandle === 'titlebar') {
        return ''
      }
      if (resizeHandle !== 'titlebar' && this.__canResize(resizeHandle) === false) {
        return ''
      }
      const staticClass = 'q-window__resize-handle ' + 'q-window__resize-handle--' + resizeHandle
      let width = this.computedWidth
      const style = {}
      if (actionsWidth && actionsWidth > 0 && this.canDrag === true) {
        width -= actionsWidth
        style.width = width + 'px'
      }
      return h('div', {
        ref: resizeHandle,
        staticClass: staticClass,
        style: style,
        on: {
          mousedown: (e) => this.__onMouseDown(e, resizeHandle),
          touchstart: (e) => this.__onTouchStart(e, resizeHandle),
          touchmove: (e) => this.__onTouchMove(e, resizeHandle),
          touchend: (e) => this.__onTouchEnd(e, resizeHandle)
        }
      })
    }

    function __renderGrippers(h) {
      if (this.hideGrippers === true) {
        return ''
      }
      return this.handles.map(resizeHandle => this.__renderGripper(h, resizeHandle))
    }

    function __renderResizeHandles(h) {
      if (this.hideGrippers !== true) {
        return ''
      }
      return this.handles.map(resizeHandle => this.__renderResizeHandle(h, resizeHandle))
    }

    function __renderBody(h) {
      const defaultScopedSlot = this.$scopedSlots.default
      const defaultSlot = this.$slots.default
      return h('div', {
        staticClass: 'q-window__body row',
        style: this.__bodyStyle
      }, [
        defaultSlot || defaultScopedSlot ? defaultScopedSlot({zIndex: this.zIndex}) : '',
        (this.headless === true && this.canDrag === true) &&
        this.__renderResizeHandle(h, 'titlebar', this.noMenu ? 0 : 44) // width of more button

      ])
    }

    function __render(h) {
      // get stateInfo for each menu item
      const menuData = [...this.computedMenuData]

      return h('div', this.setBothColors(this.color, this.backgroundColor, {
        staticClass: 'q-window ' + this.__classes,
        class: this.contentClass,
        style: this.__style
      }), [
        (this.canDrag === true) && [...this.__renderResizeHandles(h)],
        (this.canDrag === true) && [...this.__renderGrippers(h)],
        this.__renderTitlebar(h, menuData),
        this.isMinimized !== true && this.__renderBody(h)
      ])
    }

    function __createPortal() {
      const obj = {
        name: 'QWindowPortal',
        parent: this,

        inheritAttrs: false,

        render: h => this.__render(h),

        components: this.$options.components,
        directives: this.$options.directives
      }

      this.__portal = new Vue(obj).$mount()
    }

    function __destroyPortal() {
      if (this.__portal) {
        this.__portal.$destroy()
        this.__portal.$el.remove()
        this.__portal = void 0
      }
    }

    function __showPortal() {
      if (this.__portal !== void 0 && this.__portal.showing !== true) {
        const app = document.getElementById('q-app')
        if (app) {
          app.appendChild(this.__portal.$el)
        } else {
          document.body.appendChild(this.__portal.$el)
        }
        this.__portal.showing = true
      }
    }

    function __hidePortal() {
      if (this.__portal !== void 0 && this.__portal.showing === true) {
        this.__portal.$el.remove()
        this.__portal.showing = false
      }
    }


    onBeforeMount(() => {
      // this.id = ++QWindowCount
      // this.$set(layers, this.id, {window: this})
    })
//
    onBeforeUnmount(() => {
      // just in case
      // this.__removeClass(document.body, 'q-window__touch-action')
      //  this.fullscreenLeave()

      //document.removeEventListener('scroll', this.__onScroll, {passive: true})
      // document.body.removeEventListener('mousedown', this.__onMouseDownBody, {passive: false})

      //this.__destroyPortal()
    });


    function render() {
      return h('div', {
        style: 'background-color: black;'
      })
    }

    return () => render()
  }
})

// import { QColorizeMixin } from 'q-colorize-mixin'
// import canRender from 'quasar/src/mixins/can-render'
//
// // Utils
// import { prevent, stopAndPrevent } from 'quasar/src/utils/event'
//
// mixins: [QColorizeMixin, canRender],

