import Vue from 'vue'

// Styles
import './window.styl'

// Utils
import { prevent } from 'quasar/src/utils/event'
import { getVm } from 'quasar/src/utils/vm.js'
import { Colorize } from 'quasar-mixin-colorize'

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

// the starting zIndex for floating windows
const startingZIndex = 4000

// maxZIndex is for fullscreen
// 6000 is $z-fullscreen and $z-menu
const maxZIndex = 6000 - 100

let QWindowCount = 0
let defaultX = 20
let defaultY = 20
let layers = {}

export default function (ssrContext) {
  return Vue.extend({
    name: 'q-window',

    directives: {
      ClosePopup,
      Scroll
    },

    mixins: [Colorize],

    props: {
      title: String,
      visible: {
        type: Boolean,
        default: true
      },
      embedded: Boolean,
      pinned: Boolean,
      fullscreen: Boolean,
      maximized: Boolean,
      minimized: Boolean,
      scrollWithWindow: {
        type: Boolean,
        default: false
      },

      disabled: Boolean,
      dense: Boolean,
      hideToolbarDivider: Boolean,
      hideGrippers: Boolean,
      roundGrippers: Boolean,

      backgroundColor: {
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
        default: () => (['pin', 'embedded', 'close', 'fullscreen']),
        validator: (v) => v.some(action => [
          'pin',
          'embedded',
          'minimize',
          'maximize',
          'close',
          'fullscreen'].includes(action))
      },
      bringToFrontAfterDrag: Boolean,
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
        scrollX: 0,
        scrollY: 0,
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
        stateInfo: {} // filled in mounted
      }
    },

    beforeMount () {
      this.id = ++QWindowCount
      this.$set(layers, this.id, { window: this })
    },

    beforeDestroy () {
      document.removeEventListener('scroll', this.onScroll, { passive: true })
      this.__destroyPortal()
    },

    mounted () {
      // calculate left starting position
      if (this.startX) {
        this.state.left = this.startX
      } else {
        this.state.left = defaultX * QWindowCount
      }

      // calculate top starting position
      if (this.startY) {
        this.state.top = this.startY
      } else {
        this.state.top = defaultY * QWindowCount
      }

      // calculate right and bottom starting positions
      this.state.right = this.state.left + this.width
      this.state.bottom = this.state.top + this.height

      this.stateInfo = {
        visible: {
          state: true,
          on: {
            label: '',
            icon: 'close',
            func: this.show
          },
          off: {
            label: 'Close',
            icon: 'close',
            func: this.hide
          }
        },
        embedded: {
          state: true,
          on: {
            label: 'Embed',
            icon: 'lock_outline',
            func: this.lock
          },
          off: {
            label: 'Float',
            icon: 'lock_open',
            func: this.unlock
          }
        },
        pinned: {
          state: false,
          on: {
            label: 'Pin',
            icon: 'location_searching',
            func: this.pin
          },
          off: {
            label: 'Unpin',
            icon: 'gps_fixed',
            func: this.unpin
          }
        },
        maximize: {
          state: false,
          on: {
            label: 'Maximize',
            icon: 'arrow_upward',
            func: this.maximize
          },
          off: {
            label: 'Restore',
            icon: 'restore',
            func: this.restore
          }
        },
        minimize: {
          state: false,
          on: {
            label: 'Minimize',
            icon: 'arrow_downward',
            func: this.minimize
          },
          off: {
            label: 'Restore',
            icon: 'restore',
            func: this.restore
          }
        },
        fullscreen: {
          state: false,
          on: {
            label: 'Enter Fullscreen',
            icon: 'fullscreen',
            func: this.fullscreenEnter
          },
          off: {
            label: 'Exit Fullscreen',
            icon: 'fullscreen_exit',
            func: this.fullscreenLeave
          }
        }
      }

      // adjust initial user states
      if (this.visible === true) {
        this.__setStateInfo('visible', true)
      } else {
        this.__setStateInfo('visible', false)
      }
      if (this.embedded === true) {
        this.__setStateInfo('embedded', true)
      } else {
        this.__setStateInfo('embedded', false)
      }
      if (this.pinned === true) {
        if (this.canDo('pinned', true)) {
          this.__setStateInfo('pinned', true)
        }
      } else {
        if (this.canDo('pinned', false)) {
          this.__setStateInfo('pinned', false)
        }
      }
      if (this.fullscreen === true) {
        this.fullscreenEnter()
      }
      if (this.maximize === true && this.__getStateInfo('fullscreen') !== true) {
        this.__setStateInfo('maximize', true)
      } else {
        this.__setStateInfo('maximize', false)
      }
      if (this.minimize === true && this.__getStateInfo('fullscreen') !== true) {
        this.__setStateInfo('minimize', true)
      } else {
        this.__setStateInfo('minimize', false)
      }

      // set up scroll handler
      document.addEventListener('scroll', this.onScroll, { passive: true })
    },

    computed: {
      isVisible () {
        return (this.stateInfo.visible && this.stateInfo.visible.state)
      },
      isEmbedded () {
        return (this.stateInfo.embedded && this.stateInfo.embedded.state)
      },
      isPinned () {
        return (this.stateInfo.pinned && this.stateInfo.pinned.state)
      },
      isFullscreen () {
        return (this.stateInfo.fullscreen && this.stateInfo.fullscreen.state === true)
      },
      isMaximized () {
        return (this.stateInfo.maximize && this.stateInfo.maximize.state === true)
      },
      isMinimized () {
        return (this.stateInfo.minimize && this.stateInfo.minimize.state === true)
      },

      isDisabled () {
        return this.disabled === true
      },

      isDragging () {
        return this.state.dragging === true
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

      computedVisibility () {
        // TODO: when action close is initiated
        return this.visible === true ? 'visible' : 'hidden'
      },

      computedToolbarHeight () {
        return this.dense ? 28 : 40
      },

      computedHeight () {
        return this.state.bottom - this.state.top
      },

      computedWidth () {
        return this.state.right - this.state.left
      },

      computedZIndex () {
        let extra = 0
        if (this.isDragging) extra = 100
        return this.zIndex + extra
      },

      computedActions () {
        // sort and pick ones that are visible based on user selection and state
        let actions = []
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

      computedSortedLayers () {
        let sortedLayers = []
        let keys = Object.keys(layers)
        for (let index = 0; index < keys.length; ++index) {
          sortedLayers.push(layers[keys[index]])
        }
        function sort (a, b) {
          return a.zIndex > b.zIndex
        }
        sortedLayers.sort(sort)

        return sortedLayers
      },

      style () {
        let style
        if (this.isMinimized === true) {
          style = {
            position: 'relative',
            visibility: this.computedVisibility,
            height: this.computedToolbarHeight + 'px',
            borderWidth: '1px',
            borderStyle: 'solid',
            color: this.color,
            backgroundColor: this.backgroundColor,
            minWidth: '100px'
          }
        } else if (this.isEmbedded === true) {
          style = {
            position: 'relative',
            visibility: this.computedVisibility,
            borderWidth: this.borderWidth,
            borderStyle: this.borderStyle,
            width: '100%',
            height: '100%'
          }
        } else {
          let top = this.state.top + (this.scrollWithWindow === false ? this.scrollY : 0)
          let left = this.state.left + (this.scrollWithWindow === false ? this.scrollX : 0)
          style = {
            position: 'absolute',
            display: 'inline-block',
            borderWidth: this.borderWidth,
            borderStyle: this.borderStyle,
            width: this.computedWidth + 'px',
            height: this.computedHeight + 'px',
            padding: 0,
            visibility: this.computedVisibility,
            minWidth: '90px',
            minHeight: '50px',
            top: top + 'px',
            left: left + 'px',
            zIndex: this.computedZIndex
          }
        }
        return style
      },

      tbStaticClass () {
        const staticClass = 'q-window__titlebar' +
          (this.hideToolbarDivider !== true ? ' q-window__titlebar--divider' : '') +
          (this.dense === true ? ' q-window__titlebar--dense' : '') +
          (this.isEmbedded !== true && this.isMinimized !== true ? ' absolute' : '') +
          ' row justify-between items-center'
        return staticClass
      },

      tbStyle () {
        let titleHeight = `${this.computedToolbarHeight}px`
        let style = { height: titleHeight }

        if (this.titlebarStyle) {
          if (typeof this.titlebarStyle === 'object') {
            style = Object.assign(this.titlebarStyle, { height: titleHeight })
          } else if (typeof this.titlebarStyle === 'string') {
            style = this.titlebarStyle + '; height:' + titleHeight
          } if (Array.isArray(this.titlebarStyle)) {
            style = this.titlebarStyle
            style.push({ height: titleHeight })
          }
        }
        return style
      },

      bodyStyle () {
        if (this.isEmbedded) {
          return {
            height: (this.height - this.computedToolbarHeight) + 'px'
          }
        }
        return {
          position: 'absolute',
          top: this.computedToolbarHeight + 'px',
          height: this.computedHeight - this.computedToolbarHeight - 2 + 'px'
        }
      },

      classes () {
        return '' +
          (this.isDisabled !== true ? ' q-focusable q-hoverable' : ' disabled') +
          (this.isEmbedded !== true && this.isFullscreen !== true ? ' q-window__floating' : '') +
          (this.isFullscreen === true ? ' q-window__fullscreen' : '')
      }
    },

    watch: {
      'stateInfo.embedded.state' (val) {
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
        } else {
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
            } else {
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
            } else {
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
            } else {
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
            } else {
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
            } else {
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
            } else {
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
            } else {
              return true
            }
            return false
        }
        console.error(`Unknown mode: ${mode}`)
      },

      // show the component
      show () {
        if (this.canDo('visible', true)) {
          this.__setStateInfo('visible', true)
          this.$emit('visible', true)
          return true
        }
        return false
      },

      // hide the component
      hide () {
        if (this.canDo('visible', false)) {
          this.__setStateInfo('visible', false)
          this.$emit('visible', false)
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
        } else if (this.__getStateInfo('minimize') === true) {
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
        let layers = this.computedSortedLayers
        for (let index = 0; index < layers.length; ++index) {
          let layer = layers[index]
          layer.window.zIndex = startingZIndex + index
        }
        this.zIndex = startingZIndex + layers.length
      },

      // send this window to the back
      sendToBack () {
        let layers = this.computedSortedLayers
        for (let index = 0; index < layers.length; ++index) {
          let layer = layers[index]
          layer.window.zIndex = startingZIndex + index + 1
        }
        this.zIndex = startingZIndex
      },

      // ------------------------------
      // private methods
      // ------------------------------

      __disableScroll (val) {
        if (val === true) {
          // disable scrollbar
        } else {
          // enable scrollbar
        }
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
      },

      __setMinimizePosition () {
        let elements = document.getElementsByClassName('q-notifications__list--bottom')
        if (elements.length > 0) {
          elements[0].appendChild(this.$el)
        }
      },

      __savePositionAndState () {
        this.restoreState.top = this.state.top
        this.restoreState.left = this.state.left
        this.restoreState.bottom = this.state.bottom
        this.restoreState.right = this.state.right
        this.restoreState.zIndex = this.computedZIndex
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
      },

      onScroll (e) {
        this.scrollY = e.srcElement.scrollingElement.scrollTop
        this.scrollX = e.srcElement.scrollingElement.scrollLeft
      },

      // internal functions
      isFocused () {
        // const el = document.activeElement
      },

      onDrag (e, resizeHandle) {
        if (this.$q.platform.is.mobile !== true) {
          if (e.clientX === 0 || e.clientY === 0) {
            return
          }
        }

        // save existing state
        const tmpTop = this.state.top
        const tmpLeft = this.state.left
        const tmpRight = this.state.right
        const tmpBottom = this.state.bottom
        const tmpHeight = tmpBottom - tmpTop
        const tmpWidth = tmpRight - tmpLeft

        // make some short-cuts
        const parent = e.currentTarget.parentElement.parentElement
        const grandparent = e.currentTarget.parentElement.parentElement.parentElement

        switch (resizeHandle) {
          case 'top':
            if (this.$q.platform.is.mobile === true) {
              this.state.top = e.touches[0].clientY - parent.offsetTop
            } else {
              this.state.top = e.clientY - parent.offsetTop
            }
            if (this.computedHeight < this.state.minHeight) {
              this.state.top = tmpBottom - this.state.minHeight
            }
            break
          case 'left':
            if (this.$q.platform.is.mobile === true) {
              this.state.left = e.touches[0].clientX - parent.offsetLeft
            } else {
              this.state.left = e.clientX - parent.offsetLeft
            }
            if (this.computedWidth < this.state.minWidth) {
              this.state.left = tmpRight - this.state.minWidth
            }
            break
          case 'right':
            if (this.$q.platform.is.mobile === true) {
              this.state.right = e.touches[0].clientX - parent.offsetLeft
            } else {
              this.state.right = e.clientX - parent.offsetLeft
            }
            if (this.computedWidth < this.state.minWidth) {
              this.state.right = tmpLeft - this.state.minWidth
            }
            break
          case 'bottom':
            if (this.$q.platform.is.mobile === true) {
              this.state.bottom = e.touches[0].clientY - parent.offsetTop
            } else {
              this.state.bottom = e.clientY - parent.offsetTop
            }
            if (this.computedHeight < this.state.minHeight) {
              this.state.bottom = tmpTop - this.state.minHeight
            }
            break
          case 'top-left':
            this.onDrag(e, 'top')
            this.onDrag(e, 'left')
            break
          case 'top-right':
            this.onDrag(e, 'top')
            this.onDrag(e, 'right')
            break
          case 'bottom-left':
            this.onDrag(e, 'bottom')
            this.onDrag(e, 'left')
            break
          case 'bottom-right':
            this.onDrag(e, 'bottom')
            this.onDrag(e, 'right')
            break
          case 'titlebar':
            if (this.$q.platform.is.mobile === true) {
              this.state.top = e.touches[0].clientY - grandparent.offsetTop - this.mouseOffsetY
              this.state.left = e.touches[0].clientX - grandparent.offsetLeft - this.mouseOffsetX
            } else {
              this.state.top = e.clientY - grandparent.offsetTop - this.mouseOffsetY
              this.state.left = e.clientX - grandparent.offsetLeft - this.mouseOffsetX
            }
            this.state.bottom = this.state.top + tmpHeight
            this.state.right = this.state.left + tmpWidth
            break
        }
        // console.log('state:', JSON.stringify(this.state))
      },

      onTouchMove (e, resizeHandle) {
        let touchY = e.touches[0].clientY
        let touchYDelta = touchY - this.lastTouchY
        if (window.pageYOffset === 0) {
          // to supress pull-to-refresh preventDefault
          // on the overscrolling touchmove when
          // window.pageYOffset === 0
          if (touchYDelta > 0) {
            prevent(e)
          }
        }

        this.onDrag(e, resizeHandle)
      },

      onDragStart (e, resizeHandle) {
        if (this.$q.platform.is.mobile !== true) {
          // needed for desktops
          // prevent(e)
        }
        if (e.dataTransfer && e.dataTransfer.effectAllowed) {
          e.dataTransfer.effectAllowed = 'none'
        }

        if (this.$q.platform.is.mobile === true) {
          // pull-to-refresh happens when the document's
          // Y offset is zero
          this.lastTouchY = e.touches[0].clientY

          this.mouseOffsetX = e.touches[0].clientX - this.state.left
          this.mouseOffsetY = e.touches[0].clientY - this.state.top
        } else {
          this.mouseOffsetX = e.offsetX
          this.mouseOffsetY = e.offsetY
        }
        this.state.dragging = true
      },

      onTouchStart (e, resizeHandle) {
        this.onDragStart(e, resizeHandle)
      },

      onDragEnter (e, resizeHandle) {
        prevent(e)
      },

      onDragOver (e, resizeHandle) {
        // prevent(e)
      },

      onDragLeave (e, resizeHandle) {
        // prevent(e)
      },

      onDragEnd (e, resizeHandle) {
        // prevent(e)
        this.mouseOffsetX = -1
        this.mouseOffsetY = -1
        this.state.dragging = false
        this.$emit('position', {
          left: this.state.left,
          top: this.state.top,
          width: this.computedWidth,
          height: this.computedHeight
        })
        if (this.bringToFrontAfterDrag === true) {
          this.bringToFront()
        }
      },

      onTouchEnd (e, resizeHandle) {
        this.onDragEnd(e, resizeHandle)
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
              zIndex: (this.isEmbedded === true) ? void 0 : this.computedZIndex + 1
            }
          }), [
            ...this.__renderMoreItems(h, menuData)
          ])
        ])
      },

      __renderMoreButton (h, menuData) {
        return h(QBtn, {
          staticClass: 'q-window__titlebar--action-item',
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
          staticClass: 'col ellipsis'
        }, this.title)
      },

      __renderTitlebar (h, menuData) {
        const titlebarSlot = this.$scopedSlots.titlebar

        return h('div', {
          staticClass: this.tbStaticClass,
          class: this.titlebarClass,
          style: this.tbStyle,
          attrs: {
            draggable: false
          }
        }, [
          titlebarSlot === void 0 ? this.__renderTitle(h) : '',
          titlebarSlot === void 0 ? this.__renderMoreButton(h, menuData) : '',
          titlebarSlot !== void 0 ? titlebarSlot(menuData) : '',
          (this.canDrag === true) &&
            this.__renderResizeHandle(h, 'titlebar', 44) // width of more button
        ])
      },

      __renderGripper (h, resizeHandle) {
        let staticClass = 'gripper gripper-' + resizeHandle + (this.roundGrippers === true ? ' gripper-round' : '')
        return h('div', this.setBothColors(this.color, this.backgroundColor, {
          staticClass: staticClass,
          attrs: {
            draggable: this.canDrag
          },
          on: {
            drag: (e) => this.onDrag(e, resizeHandle),
            dragenter: (e) => this.onDragEnter(e, resizeHandle),
            dragstart: (e) => this.onDragStart(e, resizeHandle),
            dragover: (e) => this.onDragOver(e, resizeHandle),
            dragleave: (e) => this.onDragLeave(e, resizeHandle),
            dragend: (e) => this.onDragEnd(e, resizeHandle),
            touchstart: (e) => this.onTouchStart(e, resizeHandle),
            touchmove: (e) => this.onTouchMove(e, resizeHandle),
            touchend: (e) => this.onTouchEnd(e, resizeHandle)
          }
        }))
      },

      __renderResizeHandle (h, resizeHandle, actionsWidth) {
        let staticClass = 'q-window__resize-handle ' + 'q-window__resize-handle--' + resizeHandle
        let width = this.computedWidth
        let style = {}
        if (actionsWidth && this.canDrag === true) {
          width -= actionsWidth
          style.width = width + 'px'
        }
        return h('div', {
          staticClass: staticClass,
          style: style,
          attrs: {
            draggable: this.canDrag
          },
          on: {
            drag: (e) => this.onDrag(e, resizeHandle),
            dragenter: (e) => this.onDragEnter(e, resizeHandle),
            dragstart: (e) => this.onDragStart(e, resizeHandle),
            dragover: (e) => this.onDragOver(e, resizeHandle),
            dragleave: (e) => this.onDragLeave(e, resizeHandle),
            dragend: (e) => this.onDragEnd(e, resizeHandle),
            touchstart: (e) => this.onTouchStart(e, resizeHandle),
            touchmove: (e) => this.onTouchMove(e, resizeHandle),
            touchend: (e) => this.onTouchEnd(e, resizeHandle)
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
          style: this.bodyStyle,
          attrs: {
            draggable: false
          }
        }, [
          defaultSlot || defaultScopedSlot ? defaultScopedSlot({ zIndex: this.zIndex }) : ''
        ])
      },

      __render (h) {
        // check visibility
        if (this.isVisible !== true) {
          return ''
        }

        // get stateInfo for each menu item
        let menuData = []
        this.computedActions.map(key => {
          if (this.stateInfo[key]) {
            menuData.push({ ...this.stateInfo[key], key: key })
          }
        })

        return h('div', this.setBothColors(this.color, this.backgroundColor, {
          staticClass: 'q-window ' + this.classes,
          class: this.contentClass,
          style: this.style
        }), [
          (this.canDrag === true) && [...this.__renderResizeHandles(h)],
          (this.canDrag === true) && [...this.__renderGrippers(h)],
          this.__renderTitlebar(h, menuData),
          this.isMinimized !== true && this.__renderBody(h)
        ])
      },

      __createPortal () {
        const obj = {
          inheritAttrs: false,

          render: h => this.__render(h),

          style: this.$options.style,
          classes: this.$options.classes,
          components: this.$options.components,
          directives: this.$options.directives
        }

        this.__portal = getVm(this, obj).$mount()
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
          document.body.appendChild(this.__portal.$el)
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
  })
}
