import { QColorizeMixin } from 'q-colorize-mixin'
import canRender from 'quasar/src/mixins/can-render'

// Utils
import { prevent, stopAndPrevent } from 'quasar/src/utils/event'

import {
  QBtn,
  QMenu,
  QList,
  QItem,
  QItemSection,
  QIcon,
  QSeparator,
  ClosePopup,
  Scroll
} from 'quasar'

import Vue from 'vue'

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
      return e.touches[0].pageX
    }
    return e.touches[0].pageY
  }
  else {
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
  }
  else {
    if (type === 'x') {
      return e.clientX - rect.left
    }
    return e.clientY - rect.top
  }
}

// const getOffset = function (el) {
//   let x = 0, y = 0
//   while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
//       x += el.offsetLeft - el.scrollLeft
//       y += el.offsetTop - el.scrollTop
//       el = el.offsetParent
//   }
//   return { top: y, left: x }
// }

export default {
  name: 'QWindow',

  directives: {
    ClosePopup,
    Scroll
  },

  mixins: [QColorizeMixin, canRender],

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

  data () {
    return {
      state: {
        top: 10,
        left: 10,
        bottom: 400,
        right: 400,
        minHeight: 100,
        minWidth: 100,
        shouldDrag: false,
        dragging: false
      },
      restoreState: {
        top: 10,
        left: 10,
        bottom: 400,
        right: 400,
        zIndex: 4000,
        pinned: false,
        embedded: false,
        maximize: false,
        minimize: false
      },
      zIndex: 4000,
      mouseOffsetX: -1,
      mouseOffsetY: -1,
      mousePos: { x: 0, y: 0 },
      scrollX: 0,
      scrollY: 0,
      selected: false,
      fullscreenInitiated: false,
      handles: [
        'top',
        'left',
        'right',
        'bottom',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right'
      ],
      stateInfo: {}, // filled in mounted
      iconSetTemplate: { // uses material design icons
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
      }
    }
  },

  beforeMount () {
    this.id = ++QWindowCount
    this.$set(layers, this.id, { window: this })
  },

  beforeDestroy () {
    // just in case
    this.__removeClass(document.body, 'q-window__touch-action')
    this.fullscreenLeave()

    document.removeEventListener('scroll', this.__onScroll, { passive: true })
    document.body.removeEventListener('mousedown', this.__onMouseDownBody, { passive: false })

    this.__destroyPortal()
  },

  mounted () {
    this.__updateStateInfo()

    // calculate left starting position
    if (this.startX > 0) {
      this.state.left = this.startX
    }
    else {
      this.state.left = defaultX * QWindowCount
    }

    // calculate top starting position
    if (this.startY > 0) {
      this.state.top = this.startY
    }
    else {
      this.state.top = defaultY * QWindowCount
    }

    // calculate right and bottom starting positions
    this.state.right = this.state.left + this.width
    this.state.bottom = this.state.top + this.height

    // adjust initial user states
    if (this.value !== void 0) {
      if (this.value === true) {
        this.__setStateInfo('visible', true)
      }
      else {
        this.__setStateInfo('visible', false)
      }
    }
    if (this.embedded !== void 0) {
      if (this.embedded === true) {
        this.__setStateInfo('embedded', true)
      }
      else {
        this.__setStateInfo('embedded', false)
      }
    }
    if (this.pinned !== void 0) {
      if (this.pinned === true) {
        if (this.canDo('pinned', true)) {
          this.__setStateInfo('pinned', true)
        }
      }
      else {
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
      }
      else {
        this.__setStateInfo('maximize', false)
      }
    }
    if (this.minimize !== void 0) {
      if (this.minimize === true && this.__getStateInfo('fullscreen') !== true) {
        this.__setStateInfo('minimize', true)
      }
      else {
        this.__setStateInfo('minimize', false)
      }
    }

    // set up scroll handler
    document.addEventListener('scroll', this.__onScroll, { passive: true })
    // set up mousedown on body (so windows can deselect themselves on outside click)
    document.body.addEventListener('mousedown', this.__onMouseDownBody, { passive: false })
  },

  computed: {
    isVisible () {
      return this.__getStateInfo('visible')
    },
    isEmbedded () {
      return this.__getStateInfo('embedded')
    },
    isFloating () {
      return this.__getStateInfo('embedded') !== true
    },
    isPinned () {
      return this.__getStateInfo('pinned')
    },
    isFullscreen () {
      return this.__getStateInfo('fullscreen')
    },
    isMaximized () {
      return this.__getStateInfo('maximize')
    },
    isMinimized () {
      return this.__getStateInfo('minimize')
    },

    isDisabled () {
      return this.disabled === true
    },

    isEnabled () {
      return this.isDisabled === false
    },

    isDragging () {
      return this.state.dragging === true
    },

    isSelected () {
      return this.selected === true
    },

    canDrag () {
      return this.isVisible === true &&
        this.isEmbedded !== true &&
        this.isPinned !== true &&
        this.isFullscreen !== true &&
        this.isMaximized !== true &&
        this.isMinimized !== true
    },

    hasStateInfo () {
      return Object.keys(this.stateInfo).length > 0
    },

    __computedVisibility () {
      return this.isVisible === true ? 'visible' : 'hidden'
    },

    computedToolbarHeight () {
      return this.headless === true ? 0 : this.dense === true ? 28 : 40
    },

    computedLeft () {
      return this.state.left
    },

    computedTop () {
      return this.state.top
    },

    computedRight () {
      return this.state.right
    },

    computedBottom () {
      return this.state.bottom
    },

    computedHeight () {
      return this.computedBottom - this.computedTop
    },

    computedWidth () {
      return this.computedRight - this.computedLeft
    },

    computedScrollX () {
      return this.computedLeft + (this.scrollWithWindow === false ? this.scrollX : 0)
    },

    computedScrollY () {
      return this.computedTop + (this.scrollWithWindow === false ? this.scrollY : 0)
    },

    __computedZIndex () {
      let extra = 0
      if (this.isDragging) extra = 100
      return this.zIndex + extra
    },

    computedPosition () {
      return {
        left: this.state.left,
        top: this.state.top,
        width: this.computedWidth,
        height: this.computedHeight,
        scrollX: this.computedScrollX,
        scrollY: this.computedScrollY
      }
    },

    computedActions () {
      // sort and pick ones that are visible based on user selection and state
      const actions = []
      if (this.actions.includes('embedded') && (this.canDo('embedded', true) || this.canDo('embedded', false))) {
        actions.push('embedded')
      }
      if (this.actions.includes('pin') && (this.canDo('pinned', true) || this.canDo('pinned', false))) {
        actions.push('pinned')
      }
      if (this.actions.includes('fullscreen') && (this.canDo('fullscreen', true) || this.canDo('fullscreen', false))) {
        actions.push('fullscreen')
      }
      if (this.actions.includes('maximize') && (this.canDo('maximize', true) || this.canDo('maximize', false))) {
        actions.push('maximize')
      }
      // if (this.actions.includes('minimize') && (this.canDo('minimize', true) || this.canDo('minimize', false))) {
      //   actions.push('maximize')
      // }
      if (this.actions.includes('close') && this.canDo('close', true)) {
        actions.push('visible')
      }

      return actions
    },

    computedMenuData () {
      // get stateInfo for each menu item
      const menuData = []
      this.computedActions.map(key => {
        if (this.stateInfo[key]) {
          menuData.push({ ...this.stateInfo[key], key: key })
        }
      })
      return menuData
    },

    __computedSortedLayers () {
      const sortedLayers = []
      const keys = Object.keys(layers)
      for (let index = 0; index < keys.length; ++index) {
        sortedLayers.push(layers[keys[index]])
      }
      function sort (a, b) {
        return a.zIndex > b.zIndex
      }
      sortedLayers.sort(sort)

      return sortedLayers
    },

    __style () {
      let style
      if (this.isMinimized === true) {
        style = {
          position: 'relative',
          visibility: this.__computedVisibility,
          height: this.computedToolbarHeight + 'px',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: this.color,
          backgroundColor: this.backgroundColor,
          minWidth: '100px'
        }
      }
      else if (this.isEmbedded === true) {
        style = {
          position: 'relative',
          visibility: this.__computedVisibility,
          borderWidth: this.borderWidth,
          borderStyle: this.borderStyle,
          width: '100%',
          height: '100%'
        }
      }
      else {
        const top = this.state.top + (this.scrollWithWindow !== true ? this.scrollY : 0)
        const left = this.state.left + (this.scrollWithWindow !== true ? this.scrollX : 0)
        style = {
          position: 'absolute',
          display: 'inline-block',
          borderWidth: this.borderWidth,
          borderStyle: this.borderStyle,
          padding: 0,
          visibility: this.__computedVisibility,
          minWidth: '90px',
          minHeight: '50px',
          top: top + 'px',
          left: left + 'px',
          zIndex: this.__computedZIndex
        }
        if (this.isMaximized) {
          style.width = '100%'
          style.height = '100%'
        }
        else {
          style.width = this.computedWidth + 'px'
          style.height = this.computedHeight + 'px'
        }
      }

      if (this.contentStyle) {
        const type = Object.prototype.toString.call(this.contentStyle)
        if (type === '[object Object]') {
          style = { ...style, ...this.contentStyle }
        }
        else if ((type === '[object Array]')) {
          this.contentStyle.forEach(item => {
            style = { ...style, ...item }
          })
        }
        else if (typeof this.contentStyle === 'string') {
          const items = this.contentStyle.split(';')
          items.forEach(item => {
            const props = item.split(':')
            style[props[0].trim()] = props[1].trim()
          })
        }
      }

      return style
    },

    __tbStaticClass () {
      const staticClass = 'q-window__titlebar' +
        (this.hideToolbarDivider !== true ? ' q-window__titlebar--divider' : '') +
        (this.dense === true ? ' q-window__titlebar--dense' : '') +
        (this.isEmbedded !== true && this.isMinimized !== true ? ' absolute' : '') +
        (this.isDragging === true ? ' q-window__touch-action' : '') +
        ' row justify-between items-center'
      return staticClass
    },

    __tbStyle () {
      const titleHeight = `${this.computedToolbarHeight}px`
      let style = { height: titleHeight }

      if (this.titlebarStyle) {
        if (typeof this.titlebarStyle === 'object') {
          style = Object.assign(this.titlebarStyle, style)
        }
        else if (typeof this.titlebarStyle === 'string') {
          style = this.titlebarStyle + '; height:' + titleHeight
        }
        else if (Array.isArray(this.titlebarStyle)) {
          style = this.titlebarStyle
          style.push({ height: titleHeight })
        }
      }
      return style
    },

    __bodyStyle () {
      if (this.isEmbedded === true) {
        return {
          height: (this.height - this.computedToolbarHeight) + 'px'
        }
      }
      if (this.isFullscreen === true) {
        return {
          position: 'fixed',
          height: `calc(100% - ${this.computedToolbarHeight}px`,
          top: this.computedToolbarHeight + 'px'
        }
      }
      return {
        position: 'absolute',
        top: this.computedToolbarHeight + 'px',
        height: this.computedHeight - this.computedToolbarHeight - 2 + 'px'
      }
    },

    __classes () {
      return '' +
        (this.isEnabled === true ? ' q-focusable q-hoverable' : ' disabled') +
        (this.isFloating === true && this.isFullscreen !== true ? ' q-window__floating' : '') +
        (this.isFullscreen === true ? ' q-window__fullscreen' : '') +
        (this.isSelected === true && this.isEmbedded !== true && this.isFullscreen !== true ? ' q-window__selected' : '') +
        (this.isDragging === true ? ' q-window__dragging q-window__touch-action' : '')
    }
  },

  watch: {
    value (val) {
      this.stateInfo.visible.state = val
    },
    iconSet: {
      handler () {
        this.__updateStateInfo()
      },
      deep: true
    },
    selected (val) {
      if (this.autoPin === true) {
        if (val === true) {
          this.unpin()
        }
        else {
          this.pin()
        }
      }
      this.$emit('selected', this.selected)
    },
    'stateInfo.visible.state' (val) {
      this.$emit('input', val)
    },
    'stateInfo.embedded.state' (val) {
      if (val !== true) {
        this.__createPortal()
        this.$nextTick(() => {
          this.__showPortal()
          this.$forceUpdate()
        })
      }
      else {
        this.__hidePortal()
        this.$nextTick(() => {
          this.__destroyPortal()
          this.$forceUpdate()
        })
      }
    },
    'stateInfo.maximize.state' (val, oldVal) {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        this.__restorePositionAndState()
      }
    },
    'stateInfo.minimize.state' (val, oldVal) {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        this.__restorePositionAndState()
      }
    },
    'stateInfo.fullscreen.state' (val, oldVal) {
      if (oldVal === void 0) {
        return
      }
      if (val === true) {
        this.__savePositionAndState()
        this.zIndex = maxZIndex
      }
      else {
        this.__restorePositionAndState()
        this.fullscreenInitiated = val
      }
      this.$emit('fullscreen', val)
    },
    '$q.fullscreen.isActive' (val) {
      if (this.fullscreenInitiated === true) {
        this.__setStateInfo('fullscreen', val)
      }
    },
    '$q.screen.height' (val) {
      if (this.isFullscreen === true) {
        this.state.bottom = val
      }
    },
    '$q.screen.width' (val) {
      if (this.isFullscreen === true) {
        this.state.right = val
      }
    }
  },

  methods: {
    // ------------------------------
    // public methods
    // ------------------------------

    // show the component
    show () {
      if (this.canDo('visible', true)) {
        this.__setStateInfo('visible', true)
        this.$emit('input', true)
        return true
      }
      return false
    },

    // hide the component
    hide () {
      if (this.canDo('visible', false)) {
        this.__setStateInfo('visible', false)
        this.$emit('input', false)
        return true
      }
      return false
    },

    // embedded
    lock () {
      if (this.canDo('embedded', true)) {
        this.__setStateInfo('embedded', true)
        this.$emit('embedded', true)
        return true
      }
      return false
    },

    // floating
    unlock () {
      if (this.canDo('embedded', false)) {
        this.__setStateInfo('embedded', false)
        this.$emit('embedded', false)
        return true
      }
      return false
    },

    // pinned (can't move or re-size)
    pin () {
      if (this.canDo('pinned', true)) {
        this.__setStateInfo('pinned', true)
        this.$emit('pinned', true)
        return true
      }
      return false
    },

    // move and resize available, if not embedded
    unpin () {
      if (this.canDo('pinned', false)) {
        this.__setStateInfo('pinned', false)
        this.$emit('pinned', false)
        return true
      }
      return false
    },

    maximize () {
      if (this.canDo('maximize', true)) {
        this.bringToFront()
        this.__savePositionAndState()
        this.__setFullWindowPosition()

        this.__setStateInfo('embedded', false)
        this.$nextTick(() => {
          this.__setStateInfo('maximize', true)
          this.$emit('maximize', true)
        })
        return true
      }
      return false
    },

    minimize () {
      if (this.canDo('minimize', true)) {
        this.__savePositionAndState()
        this.__setMinimizePosition()

        this.__setStateInfo('embedded', true)
        this.__setStateInfo('minimize', true)
        this.$emit('minimize', true)
        return true
      }
      return false
    },

    restore () {
      if (this.__getStateInfo('visible') !== true) {
        // not allowed
        return
      }
      if (this.__getStateInfo('maximize') === true) {
        this.__setStateInfo('maximize', false)
        this.$emit('maximize', false)
      }
      else if (this.__getStateInfo('minimize') === true) {
        this.__setStateInfo('minimize', false)
        this.$emit('minimize', false)
      }
    },

    // go into fullscreen mode
    fullscreenEnter () {
      if (this.canDo('fullscreen', true)) {
        this.fullscreenInitiated = true
        this.$q.fullscreen.request()
        return true
      }
      return false
    },

    // leave fullscreen mode
    fullscreenLeave () {
      if (this.canDo('fullscreen', false)) {
        this.$q.fullscreen.exit()
        return true
      }
      return false
    },

    // toggle fullscreen mode
    toggleFullscreen () {
      if (this.__getStateInfo('visible') !== true) {
        // not allowed
        return
      }
      this.$q.fullscreen.isActive ? this.fullscreenLeave() : this.fullscreenEnter()
    },

    // bring this window to the front
    bringToFront () {
      const layers = this.__computedSortedLayers
      for (let index = 0; index < layers.length; ++index) {
        const layer = layers[index]
        layer.window.zIndex = startingZIndex + index
      }
      // this window gets highest zIndex
      this.zIndex = startingZIndex + layers.length
    },

    // send this window to the back
    sendToBack () {
      const layers = this.__computedSortedLayers
      for (let index = 0; index < layers.length; ++index) {
        const layer = layers[index]
        layer.window.zIndex = startingZIndex + index + 1
      }
      this.zIndex = startingZIndex
    },

    centerWindow () {
      const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      const startX = w / 2 - this.computedWidth / 2
      const startY = h / 2 - this.computedHeight / 2
      this.setXY(startX, startY)
    },

    setX (x) {
      const w = this.computedWidth
      this.state.left = x
      this.state.right = this.state.left + w
    },

    setY (y) {
      const h = this.computedHeight
      this.state.top = y
      this.state.bottom = this.state.top + h
    },

    setXY (x, y) {
      this.setX(x)
      this.setY(y)
    },

    setWidth (width) {
      this.state.right = this.state.left + width
    },

    setHeight (height) {
      this.state.bottom = this.state.top + height
    },

    // function that returns true/false if
    // passed in mode/state can be done
    // where state = [true = 'on', false = 'off']
    canDo (mode, state) {
      switch (mode) {
        case 'visible':
          if (state === true) {
            if (this.__getStateInfo('visible') !== true) {
              return true
            }
          }
          else {
            if (this.__getStateInfo('visible') === true) {
              return true
            }
          }
          return false

        case 'embedded':
          if (state === true) {
            if (this.__getStateInfo('embedded') !== true &&
              this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          else {
            if (this.__getStateInfo('embedded') === true &&
            this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'pinned':
          if (state === true) {
            if (this.__getStateInfo('pinned') !== true &&
              this.__getStateInfo('embedded') !== true &&
              this.__getStateInfo('maximize') !== true &&
              this.__getStateInfo('minimize') !== true &&
              this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          else {
            if (this.__getStateInfo('pinned') === true &&
              this.__getStateInfo('embedded') !== true &&
              this.__getStateInfo('maximize') !== true &&
              this.__getStateInfo('minimize') !== true &&
              this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'maximize':
          if (state === true) {
            if (this.__getStateInfo('maximize') !== true &&
              this.__getStateInfo('embedded') !== true &&
              this.__getStateInfo('minimize') !== true &&
              this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          else {
            if (this.__getStateInfo('maximize') === true &&
              this.__getStateInfo('embedded') !== true &&
              this.__getStateInfo('minimize') !== true &&
              this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'minimize':
          if (state === true) {
            if (this.__getStateInfo('minimize') !== true &&
              this.__getStateInfo('embedded') !== true &&
              this.__getStateInfo('maximize') !== true &&
              this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          else {
            if (this.__getStateInfo('minimize') === true &&
              this.__getStateInfo('embedded') !== true &&
              this.__getStateInfo('maximize') !== true &&
              this.__getStateInfo('fullscreen') !== true) {
              return true
            }
          }
          return false
        case 'fullscreen':
          if (state === true) {
            if (this.__getStateInfo('fullscreen') !== true &&
            this.__getStateInfo('embedded') !== true) {
              return true
            }
          }
          else {
            if (this.__getStateInfo('fullscreen') === true &&
              this.__getStateInfo('embedded') !== true) {
              return true
            }
          }
          return false
        case 'close':
          if (state === true) {
            if (this.__getStateInfo('embedded') !== true) {
              return true
            }
          }
          else {
            return true
          }
          return false
      }
      console.error(`QWindow unknown mode: ${mode}`)
    },

    // ------------------------------
    // private methods
    // ------------------------------

    __canResize (resizeHandle) {
      if (this.noResize === true) return false
      const missing = this.handles.filter(handle => !this.resizable.includes(handle))
      return missing.includes(resizeHandle) !== true
    },

    __updateStateInfo () {
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
    },

    __setStateInfo (id, val) {
      if (id in this.stateInfo) {
        this.stateInfo[id].state = val
        return true
      }
      return false
    },

    __getStateInfo (id) {
      if (id in this.stateInfo) {
        return this.stateInfo[id].state
      }
      return false
    },

    __setFullWindowPosition () {
      this.state.top = 0
      this.state.left = 0
      this.state.bottom = this.$q.screen.height
      this.state.right = this.$q.screen.width
      this.$nextTick(() => {
        this.$emit('position', this.computedPosition)
      })
    },

    __setMinimizePosition () {
      const elements = document.getElementsByClassName('q-notifications__list--bottom')
      if (elements.length > 0) {
        elements[0].appendChild(this.$el)
      }
    },

    __savePositionAndState () {
      this.restoreState.top = this.state.top
      this.restoreState.left = this.state.left
      this.restoreState.bottom = this.state.bottom
      this.restoreState.right = this.state.right
      this.restoreState.zIndex = this.__computedZIndex
      this.restoreState.pinned = this.__getStateInfo('pinned')
      this.restoreState.embedded = this.__getStateInfo('embedded')
      this.restoreState.maximize = this.__getStateInfo('maximize')
      this.restoreState.minimize = this.__getStateInfo('minimize')
    },

    __restorePositionAndState () {
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
    },

    __addClass (el, name) {
      const arr = el.className.split(' ')
      // make sure it's not already there
      if (arr.indexOf(name) === -1) {
        arr.push(name)
        el.className = arr.join(' ')
      }
    },

    __removeClass (el, name) {
      const arr = el.className.split(' ')
      const index = arr.indexOf(name)
      if (index !== -1) {
        arr.splice(index, 1)
        el.className = arr.join(' ')
      }
    },

    __onScroll (e) {
      if (window !== void 0) {
        this.scrollY = window.pageYOffset
        this.scrollX = window.pageXOffset
        if (this.isFloating === true) {
          this.$nextTick(() => {
            this.$emit('position', this.computedPosition)
          })
        }
      }
    },

    // mousedown for document.body
    __onMouseDownBody (e) {
      if (this.isEmbedded) {
        this.state.shouldDrag = this.state.dragging = false
        return
      }

      // we need to make sure if user clicks on grippers
      // that the window does not become deselected
      const gripperSize = 10

      // const oldSelected = this.selected
      const x = getMousePosition(e, 'x')
      const y = getMousePosition(e, 'y')
      let left, top, width, height

      // embedded
      if (this.$el && this.$el.offsetParent) {
        // determine if mousedown is within the bounds of this component
        left = this.$el.offsetParent.offsetLeft + this.$el.offsetLeft
        top = this.$el.offsetParent.offsetTop + this.$el.offsetTop
        width = this.$el.offsetWidth
        height = this.$el.offsetHeight
      }
      else {
        // not embedded
        if (this.isEmbedded === false) {
          const position = this.computedPosition
          left = position.scrollX
          top = position.scrollY
          width = position.width
          height = position.height
        }
      }
      if (width <= 0 || height <= 0) return
      if (this.noResize !== true) {
        left -= gripperSize
        top -= gripperSize
        width += (gripperSize * 2)
        height += (gripperSize * 2)
      }
      if (x >= left && x < left + width && y >= top && y < top + height) {
        this.selected = true
      }
      else {
        this.selected = false
      }
    },

    // mousedown for element
    __onMouseDown (e, resizeHandle) {
      this.__removeEventListeners(resizeHandle)

      if (e.touches === void 0 && e.buttons !== 1) {
        return
      }

      this.resizeHandle = resizeHandle
      this.selected = true

      if (this.isFloating && this.selected === true) {
        this.bringToFront()
      }

      this.mousePos.x = getMousePosition(e, 'x')
      this.mousePos.y = getMousePosition(e, 'y')

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
    },

    __addEventListeners () {
      document.body.addEventListener('mousemove', this.__onMouseMove, { capture: true })
      document.body.addEventListener('mouseup', this.__onMouseUp, { capture: true })
      document.body.addEventListener('keyup', this.__onKeyUp, { capture: true })
    },

    __removeEventListeners () {
      document.body.removeEventListener('mousemove', this.__onMouseMove, { capture: true })
      document.body.removeEventListener('mouseup', this.__onMouseUp, { capture: true })
      document.body.removeEventListener('keyup', this.__onKeyUp, { capture: true })
    },

    __onKeyUp (e) {
      // if ESC key
      if (e.keycode === 27 && this.isDragging() === true) {
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
    },

    __onMouseMove (e, resizeHandle) {
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
        }
        else {
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
          }
          else {
            this.state.top = mouseY - window.pageYOffset - this.shiftY
            this.state.left = mouseX - window.pageXOffset - this.shiftX
          }
          this.state.bottom = this.state.top + this.tmpHeight
          this.state.right = this.state.left + this.tmpWidth
          break
      }

      stopAndPrevent(e)
    },

    __onMouseUp (e) {
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
    },

    __onTouchMove (e, resizeHandle) {
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
    },

    __onTouchStart (e, resizeHandle) {
      stopAndPrevent(e)
      this.__onMouseDown(e, resizeHandle)
    },

    __onTouchEnd (e, resizeHandle) {
      stopAndPrevent(e)
      this.resizeHandle = resizeHandle
      this.__onMouseUp(e)
    },

    __renderMoreItem (h, stateInfo) {
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
    },

    __renderMoreItems (h, menuData) {
      return menuData.map(stateInfo => this.__renderMoreItem(h, stateInfo))
    },

    __renderMoreMenu (h, menuData) {
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
    },

    __renderMoreButton (h, menuData) {
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
    },

    __renderTitle (h) {
      return h('div', {
        staticClass: 'q-window__title col ellipsis'
      }, this.title)
    },

    __renderTitlebar (h, menuData) {
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
    },

    // grippers can visibly be seen
    __renderGripper (h, resizeHandle) {
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
    },

    // resize handles are for when there are no grippers
    __renderResizeHandle (h, resizeHandle, actionsWidth) {
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
    },

    __renderGrippers (h) {
      if (this.hideGrippers === true) {
        return ''
      }
      return this.handles.map(resizeHandle => this.__renderGripper(h, resizeHandle))
    },

    __renderResizeHandles (h) {
      if (this.hideGrippers !== true) {
        return ''
      }
      return this.handles.map(resizeHandle => this.__renderResizeHandle(h, resizeHandle))
    },

    __renderBody (h) {
      const defaultScopedSlot = this.$scopedSlots.default
      const defaultSlot = this.$slots.default
      return h('div', {
        staticClass: 'q-window__body row',
        style: this.__bodyStyle
      }, [
        defaultSlot || defaultScopedSlot ? defaultScopedSlot({ zIndex: this.zIndex }) : '',
        (this.headless === true && this.canDrag === true) &&
          this.__renderResizeHandle(h, 'titlebar', this.noMenu ? 0 : 44) // width of more button

      ])
    },

    __render (h) {
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
    },

    __createPortal () {
      const obj = {
        name: 'QWindowPortal',
        parent: this,

        inheritAttrs: false,

        render: h => this.__render(h),

        components: this.$options.components,
        directives: this.$options.directives
      }

      this.__portal = new Vue(obj).$mount()
    },

    __destroyPortal () {
      if (this.__portal) {
        this.__portal.$destroy()
        this.__portal.$el.remove()
        this.__portal = void 0
      }
    },

    __showPortal () {
      if (this.__portal !== void 0 && this.__portal.showing !== true) {
        const app = document.getElementById('q-app')
        if (app) {
          app.appendChild(this.__portal.$el)
        }
        else {
          document.body.appendChild(this.__portal.$el)
        }
        this.__portal.showing = true
      }
    },

    __hidePortal () {
      if (this.__portal !== void 0 && this.__portal.showing === true) {
        this.__portal.$el.remove()
        this.__portal.showing = false
      }
    }
  },

  render (h) {
    if (this.__portal === void 0) {
      return this.__render(h)
    }
    return ''
  }
}
