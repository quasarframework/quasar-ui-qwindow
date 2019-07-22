import Vue from 'vue'

// Styles
import './window.styl'

// Utils
import { prevent } from 'quasar/src/utils/event'
import { getVm } from 'quasar/src/utils/vm.js'

import {
  QBtn,
  QMenu,
  QList,
  QItem,
  QItemSection,
  QIcon,
  QSeparator,
  ClosePopup,
  AppFullscreen
} from 'quasar'

const startingZOrder = 4000

let QWindowCount = 0
let defaultX = 20
let defaultY = 20
let layers = {}

export default function (ssrContext) {
  return Vue.extend({
    name: 'q-window',

    directives: {
      ClosePopup
    },

    props: {
      title: String,
      visible: {
        type: Boolean,
        default: true
      },
      embedded: Boolean,
      pinned: Boolean,
      fullscreen: Boolean,
      disabled: Boolean,
      tabindex: [Number, String],
      dense: Boolean,

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
      layer: [Number, String],
      actions: {
        type: Array,
        default: () => (['pin', 'close', 'fullscreen']),
        validator: (v) => v.some(action => [
          'pin',
          'embed',
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
          right: 400
        },
        zIndex: 4000,
        mouseOffsetX: -1,
        mouseOffsetY: -1,
        handles: [
          'q-window__resize-handle--top',
          'q-window__resize-handle--left',
          'q-window__resize-handle--right',
          'q-window__resize-handle--bottom',
          'q-window__resize-handle--top-left',
          'q-window__resize-handle--top-right',
          'q-window__resize-handle--bottom-left',
          'q-window__resize-handle--bottom-right'
        ],
        stateInfo: {} // filled in mounted
      }
    },

    beforeMount () {
      if (this.$q.fullscreen === void 0) {
        AppFullscreen.install(this)
      }

      this.id = ++QWindowCount
      this.$set(layers, this.id, { window: this })
    },

    beforeDestroy () {
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
          state: false,
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
        maximized: {
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
        minimized: {
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
      this.__setStateInfo('visible', this.isVisible === true)
      this.__setStateInfo('embedded', this.isEmbedded === true)
      this.__setStateInfo('pinned', this.isPinned === true)
      if (this.fullscreen) {
        this.fullscreenEnter()
      }
    },

    computed: {
      isVisible () {
        return this.visible === true || (this.stateInfo.visible && this.stateInfo.visible.state)
      },
      isEmbedded () {
        return this.embedded === true || (this.stateInfo.embedded && this.stateInfo.embedded.state)
      },
      isPinned () {
        return this.pinned === true || (this.stateInfo.pinned && this.stateInfo.pinned.state)
      },
      isFullscreen () {
        return this.fullscreen === true || (this.stateInfo.fullscreen && this.stateInfo.fullscreen.state === true)
      },
      isDisabled () {
        return this.disabled === true
      },

      isDragging () {
        return this.state.dragging === true
      },

      computedTabIndex () {
        return this.isDisabled === true ? -1 : this.tabindex || 0
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
        if (this.actions.includes('embed')) {
          actions.push('embedded')
        }
        if (this.actions.includes('pin')) {
          actions.push('pinned')
        }
        if (this.actions.includes('fullscreen')) {
          actions.push('fullscreen')
        }
        if (this.actions.includes('close')) {
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
          return a.zOrder > b.zOrder
        }
        sortedLayers.sort(sort)

        return sortedLayers
      },

      style () {
        let style
        if (this.isEmbedded) {
          style = {
            position: 'relative',
            visibility: this.computedVisibility,
            width: '100%',
            height: '100%'
          }
        } else {
          style = {
            position: 'absolute',
            display: 'inline-block',
            borderWidth: '1px',
            borderStyle: 'solid',
            color: '#787878',
            width: this.computedWidth + 'px',
            height: this.computedHeight + 'px',
            padding: 0,
            visibility: this.computedVisibility,
            minWidth: '90px',
            minHeight: '50px',
            top: this.state.top + 'px',
            left: this.state.left + 'px',
            zIndex: this.computedZIndex
          }
        }
        return style
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
            height: `calc(100% - ${this.computedToolbarHeight}px)`
          }
        }
        return {
          position: 'absolute',
          top: '40px',
          height: this.computedHeight - this.computedToolbarHeight - 2 + 'px'
        }
      },

      classes () {
        return '' +
          (this.isDisabled !== true ? ' q-focusable q-hoverable' : ' disabled')
      },

      attrs () {
        let attrs = {
          tabindex: this.computedTabIndex
        }
        return attrs
      }
    },

    watch: {
      visible (val) {
        this.__setStateInfo('visible', val === true)
      },
      embedded (val) {
        this.__setStateInfo('embedded', val === true)
      },
      pinned (val) {
        this.__setStateInfo('pinned', val === true)
      },
      'stateInfo.embedded.state' (val) {
        if (val !== true) {
          this.__createPortal()
          this.$nextTick(() => {
            this.__showPortal()
          })
        } else {
          this.__hidePortal()
          this.$nextTick(() => {
            this.__destroyPortal()
            this.$forceUpdate()
          })
        }
      },
      'stateInfo.inned.state' (val) {
        this.$forceUpdate()
      },
      '$q.fullscreen.isActive' (val) {
        this.__setStateInfo('fullscreen', val)
        this.$emit('fullscreen', val)
        if (val) {
          this.__setFullscreen()
        } else {
          this.__restoreFullscreen()
        }
      },
      '$q.screen.height' (val) {
        if (this.__getStateInfo('fullscreen') === true) {
          this.state.bottom = val - 1
        }
      },
      '$q.screen.width' (val) {
        if (this.__getStateInfo('fullscreen') === true) {
          this.state.right = val - 1
        }
      }
    },

    methods: {
      // ------------------------------
      // public methods
      // ------------------------------

      // show the component
      show () {
        this.__setStateInfo('visible', true)
        this.$emit('visible', true)
      },

      // hide the component
      hide () {
        this.__setStateInfo('visible', false)
        this.$emit('visible', false)
      },

      // embedded
      lock () {
        this.__setStateInfo('embedded', true)
        this.$emit('embedded', true)
      },

      // floating
      unlock () {
        this.__setStateInfo('embedded', false)
        this.$emit('embedded', false)
      },

      // pinned (can't move or re-size)
      pin () {
        this.__setStateInfo('pinned', true)
        this.$emit('pinned', true)
      },

      // move and resize available, if not embedded
      unpin () {
        this.__setStateInfo('pinned', false)
        this.$emit('pinned', false)
      },

      maximize () {
      },

      minimize () {
      },

      restore () {
      },

      // go into fullscreen mode
      fullscreenEnter () {
        this.$q.fullscreen.request()
      },

      // leave fullscreen mode
      fullscreenLeave () {
        this.$q.fullscreen.exit()
      },

      // toggle fullscreen mode
      toggleFullscreen () {
        this.$q.fullscreen.isActive ? this.fullscreenLeave() : this.fullscreenEnter()
      },

      // bring this window to the front
      bringToFront () {
        let layers = this.computedSortedLayers
        for (let index = 0; index < layers.length; ++index) {
          let layer = layers[index]
          layer.window.zIndex = startingZOrder + index
        }
        this.zIndex = startingZOrder + layers.length
      },

      // send this window to the back
      sendToBack () {
        let layers = this.computedSortedLayers
        for (let index = 0; index < layers.length; ++index) {
          let layer = layers[index]
          layer.window.zIndex = startingZOrder + index + 1
        }
        this.zIndex = startingZOrder
      },

      // ------------------------------
      // private methods
      // ------------------------------

      __setStateInfo (id, val) {
        this.stateInfo[id].state = val
      },

      __getStateInfo (id) {
        return this.stateInfo[id].state
      },

      __setFullscreen () {
        this.restoreState.top = this.state.top
        this.restoreState.left = this.state.left
        this.restoreState.bottom = this.state.bottom
        this.restoreState.right = this.state.right

        this.state.top = 0
        this.state.left = 0
        this.state.bottom = this.$q.screen.height - 1
        this.state.right = this.$q.screen.width - 1
      },

      __restoreFullscreen () {
        this.state.top = this.restoreState.top
        this.state.left = this.restoreState.left
        this.state.bottom = this.restoreState.bottom
        this.state.right = this.restoreState.right
      },

      // internal functions
      isFocused () {
        // const el = document.activeElement
      },

      onDrag (e, resizeHandle) {
        e.dataTransfer.effectAllowed = 'none'

        if (e.clientX === 0 || e.clientY === 0) {
          return
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
          case 'q-window__resize-handle--top':
            this.state.top = e.clientY - parent.offsetTop
            if (this.computedHeight < this.state.minHeight) {
              this.state.top = tmpBottom - this.state.minHeight
            }
            break
          case 'q-window__resize-handle--left':
            this.state.left = e.clientX - parent.offsetLeft
            if (this.computedWidth < this.state.minWidth) {
              this.state.left = tmpRight - this.state.minWidth
            }
            break
          case 'q-window__resize-handle--right':
            this.state.right = e.clientX - parent.offsetLeft
            if (this.computedWidth < this.state.minWidth) {
              this.state.right = tmpLeft - this.state.minWidth
            }
            break
          case 'q-window__resize-handle--bottom':
            this.state.bottom = e.clientY - parent.offsetTop
            if (this.computedHeight < this.state.minHeight) {
              this.state.bottom = tmpTop - this.state.minHeight
            }
            break
          case 'q-window__resize-handle--top-left':
            this.onDrag(e, 'q-window__resize-handle--top')
            this.onDrag(e, 'q-window__resize-handle--left')
            break
          case 'q-window__resize-handle--top-right':
            this.onDrag(e, 'q-window__resize-handle--top')
            this.onDrag(e, 'q-window__resize-handle--right')
            break
          case 'q-window__resize-handle--bottom-left':
            this.onDrag(e, 'q-window__resize-handle--bottom')
            this.onDrag(e, 'q-window__resize-handle--left')
            break
          case 'q-window__resize-handle--bottom-right':
            this.onDrag(e, 'q-window__resize-handle--bottom')
            this.onDrag(e, 'q-window__resize-handle--right')
            break
          case 'q-window__resize-handle--titlebar':
            this.state.top = e.clientY - grandparent.offsetTop - this.mouseOffsetY
            this.state.bottom = this.state.top + tmpHeight
            this.state.left = e.clientX - grandparent.offsetLeft - this.mouseOffsetX
            this.state.right = this.state.left + tmpWidth
            break
        }
      },

      onDragStart (e, resizeHandle) {
        this.mouseOffsetX = e.offsetX
        this.mouseOffsetY = e.offsetY
        this.state.dragging = true
      },

      onDragEnter (e, resizeHandle) {
        prevent(e)
      },

      onDragOver (e, resizeHandle) {
        prevent(e)
      },

      onDragLeave (e, resizeHandle) {
        prevent(e)
      },

      onDragEnd (e, resizeHandle) {
        prevent(e)
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
            dense: true
          },
          on: {
            click: () => (stateInfo.state ? stateInfo.off.func() : stateInfo.on.func())
          }
        }, [
          h(QItemSection, stateInfo.state ? stateInfo.off.label : stateInfo.on.label),
          h(QItemSection, {
            props: {
              avatar: true
            }
          }, [
            h(QIcon, {
              props: {
                name: stateInfo.state ? stateInfo.off.icon : stateInfo.on.icon
              }
            })
          ])
        ])
      },

      __renderMoreItems (h, menuData) {
        return menuData.map(stateInfo => this.__renderMoreItem(h, stateInfo))
      },

      __renderMoreMenu (h) {
        // this two issues happen during early render
        if (this.computedActions.length === 0) {
          return ''
        }
        let keys = Object.keys(this.stateInfo)
        if (keys.length === 0) {
          return ''
        }

        // get stateInfo for each menu item
        let menuData = []
        this.computedActions.map(key => {
          if (this.stateInfo[key]) {
            menuData.push({ ...this.stateInfo[key], key: key })
          }
        })
        // let user manipulate menu
        if (this.menuFunc) {
          this.menuFunc(menuData)
        }

        // TODO: temp code
        // menuData.splice(menuData.length - 1, 0, 'separator')

        return h(QMenu, {
          attrs: {
            zIndex: this.isEmbedded === true ? void 0 : this.computedZIndex + 1
          }
        }, [
          h(QList, {
            props: {
              highlight: true,
              dense: true
            }
          }, [
            ...this.__renderMoreItems(h, menuData)
          ])
        ])
      },

      __renderMoreButton (h) {
        return h(QBtn, {
          staticClass: 'q-window__titlebar--action-item',
          props: {
            flat: true,
            round: true,
            dense: true,
            icon: 'more_vert'
          }
        }, [
          this.__renderMoreMenu(h)
        ])
      },

      __renderTitle (h) {
        return h('div', {
          staticClass: 'col ellipsis'
        }, this.title)
      },

      __renderTitlebar (h) {
        const titlebarSlot = this.$slots.titlebar
        return h('div', {
          staticClass: 'q-window__titlebar row justify-between items-center' +
            (this.dense === true ? ' q-window__titlebar--dense' : '') +
            (this.isEmbedded !== true ? ' absolute' : ''),
          class: this.titlebarClass,
          style: this.tbStyle,
          attrs: {
            draggable: false
          }
        }, [
          titlebarSlot === void 0 ? this.__renderTitle(h) : '',
          titlebarSlot === void 0 ? this.__renderMoreButton(h) : '',
          titlebarSlot !== void 0 ? titlebarSlot : '',
          (this.isEmbedded !== true && this.isPinned !== true && this.isFullscreen !== true) && this.__renderResizeHandle(h, 'q-window__resize-handle--titlebar', 44) // width of more button
        ])
      },

      __renderResizeHandle (h, resizeHandle, actionsWidth) {
        let width = this.computedWidth
        let style = {}
        if (actionsWidth && this.isEmbedded !== true) {
          width -= actionsWidth
          style.width = width + 'px'
        }
        return h('div', {
          staticClass: 'q-window__resize-handle ' + resizeHandle,
          style: style,
          attrs: {
            draggable: this.isEmbedded !== true && this.isPinned !== true
          },
          on: {
            drag: (e) => this.onDrag(e, resizeHandle),
            dragenter: (e) => this.onDragEnter(e, resizeHandle),
            dragstart: (e) => this.onDragStart(e, resizeHandle),
            dragover: (e) => this.onDragOver(e, resizeHandle),
            dragleave: (e) => this.onDragLeave(e, resizeHandle),
            dragend: (e) => this.onDragEnd(e, resizeHandle),
            touchmove: (e) => {}
          }
        })
      },

      __renderResizeHandles (h) {
        return this.handles.map(resizeHandle => this.__renderResizeHandle(h, resizeHandle))
      },

      __renderBody (h) {
        const defaultSlot = this.$slots.default
        return h('div', {
          staticClass: 'q-window__body row',
          style: this.bodyStyle,
          attrs: {
            draggable: false
          }
        }, [
          defaultSlot
        ])
      },

      __render (h) {
        const isFocused = (document && document.activeElement === this.$el)
        console.log('isFocused:', isFocused)

        return h('div', {
          staticClass: 'q-window ' + this.classes,
          class: this.contentClass,
          style: this.style,
          attrs: this.attrs
        }, [
          (this.isEmbedded !== true && this.isPinned !== true) && [...this.__renderResizeHandles(h)],
          this.__renderTitlebar(h),
          this.__renderBody(h)
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

        if (this.__onPortalClose !== void 0) {
          obj.methods = {
            __qClosePopup: this.__onPortalClose
          }
        }

        const onCreated = this.__onPortalCreated

        if (onCreated !== void 0) {
          obj.created = function () {
            onCreated(this)
          }
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
