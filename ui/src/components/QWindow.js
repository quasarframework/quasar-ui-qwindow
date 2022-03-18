import {
  h,
  defineComponent,
  computed,
  onMounted,
  ref,
  nextTick,
  Teleport,
  watch
} from 'vue'

import {
  ClosePopup,
  Scroll,
  useQuasar,
  AppFullscreen
} from 'quasar'
import useStyle from "./composables/useStyle";
import useResize from "./composables/useResize";
import useToolbar from "./composables/useToolbar";
import useBody from "./composables/useBody";
import { prevent, stopAndPrevent } from 'quasar/src/utils/event'


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

const ACTION_HIDDEN = 'hidden'
const ACTION_VISIBLE = 'visible'
const ACTION_EMBEDDED = 'embedded'
const ACTION_FULLSCREEN = 'fullscreen'
const ACTION_PINNED = 'pinned'
const ACTION_MAXIMIZE = 'maximize'
const ACTION_MINIMIZE = 'minimize'
const ACTION_CLOSE = 'close'
export const MENU_ITEM_SEPARATOR = 'separator'

export default defineComponent({
  name: 'QWindow',
  directives: {
    ClosePopup,
    Scroll
  },
  props: {
    modelValue: Boolean,
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
    color: {
      type: String,
      default: '#000000'
    },
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
      default: () => ([ ACTION_PINNED, ACTION_EMBEDDED, ACTION_CLOSE ]),
      validator: (v) => v.some(action => [
        ACTION_PINNED,
        ACTION_EMBEDDED,
        ACTION_MINIMIZE,
        ACTION_MAXIMIZE,
        ACTION_CLOSE,
        ACTION_FULLSCREEN ].includes(action))
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
    const iconSetTemplate = ref({
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
      },
      minimize: {
        on: {
          icon: 'arrow_downward',
          label: 'Minimize'
        },
        off: {
          icon: 'restore',
          label: 'Restore'
        }
      },
    })

    const actionItems = ref({

      visible: {
        state: true,
        on: {
          label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.label !== void 0 ? this.iconSet.visible.on.label : iconSetTemplate.value.visible.on.label,
          icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.icon !== void 0 ? this.iconSet.visible.on.icon : iconSetTemplate.value.visible.on.icon,
          func: show
        },
        off: {
          label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.label !== void 0 ? this.iconSet.visible.off.label : iconSetTemplate.value.visible.off.label,
          icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.icon !== void 0 ? this.iconSet.visible.off.icon : iconSetTemplate.value.visible.off.icon,
          func: hide
        }
      },
      embedded: {
        state: true,
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
        state: false,
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
      fullscreen: {
        state: false,
        on: {
          label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.label !== void 0 ? props.iconSet.fullscreen.on.label : iconSetTemplate.value.fullscreen.on.label,
          icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.icon !== void 0 ? props.iconSet.fullscreen.on.icon : iconSetTemplate.value.fullscreen.on.icon,
          func: fullscreenEnter
        },
        off: {
          label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.label !== void 0 ? props.iconSet.fullscreen.off.label : iconSetTemplate.value.fullscreen.off.label,
          icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.icon !== void 0 ? props.iconSet.fullscreen.off.icon : iconSetTemplate.value.fullscreen.off.icon,
          func: fullscreenLeave
        }
      },
      maximize: {
        state: false,
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
      minimize: {
        state: false,
        on: {
          label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.label !== void 0 ? props.iconSet.minimize.on.label : iconSetTemplate.value.minimize.on.label,
          icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.icon !== void 0 ? props.iconSet.minimize.on.icon : iconSetTemplate.value.minimize.on.icon,
          func: minimize

        },
        off: {
          label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.label !== void 0 ? props.iconSet.minimize.off.label : iconSetTemplate.value.minimize.off.label,
          icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.icon !== void 0 ? props.iconSet.minimize.off.icon : iconSetTemplate.value.minimize.off.icon,
          func: maximize
        }
      }
    })

    const shiftX = ref(0)
    const shiftY = ref(0)
    const mousePos = ref({
      x: 0, y: 0
    })
    const statesTmp = ref({
      tmpTop: 0,
      tmpLeft: 0,
      tmpRight: 0,
      tmpBottom: 0,
      tmpHeight: 0,
      tmpWidth: 0
    })


    const states = ref({
      top: 150,
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
    QWindowCount = QWindowCount + 1
    const $q = useQuasar()
    const windowRef = ref(null)
    const zIndex = ref(4000)
    const scrollX = ref(0)
    const scrollY = ref(0)
    const selected = ref(false)
    const resizeHandle = ref()
    const fullscreenInitiated = ref(false)

    const { removeClass, addClass } = useStyle()

    function show() {
      if (checkActionState(ACTION_VISIBLE, true)) {
        setActionState(ACTION_VISIBLE, true)
        return true
      }
      return false
    }


    // hide the component
    function hide() {
      if (checkActionState(ACTION_VISIBLE, false)) {
        setActionState(ACTION_VISIBLE, false)
        return true
      }
      return false
    }

    // embedded
    function lock() {
      if (checkActionState(ACTION_EMBEDDED, true)) {
        setActionState(ACTION_EMBEDDED, true)
        return true
      }
      return false
    }

    // floating
    function unlock() {
      if (checkActionState(ACTION_EMBEDDED, false)) {
        setActionState(ACTION_EMBEDDED, false)
        return true
      }
      return false
    }

    // pinned (can't move or re-size)
    function pin() {
      if (checkActionState(ACTION_PINNED, true)) {
        setActionState(ACTION_PINNED, true)
        return true
      }
      return false
    }


    // move and resize available, if not embedded
    function unpin() {
      if (checkActionState(ACTION_PINNED, false)) {
        setActionState(ACTION_PINNED, false)
        return true
      }
      return false
    }

    function maximize() {
      if (checkActionState(ACTION_MAXIMIZE, true)) {
        //thisbringToFront()
        savePositionAndState()
        setFullWindowPosition()


        setActionState(ACTION_EMBEDDED, false)
        nextTick(() => {
          setActionState(ACTION_MAXIMIZE, true)
        })
        return true
      }
      return false
    }

    function minimize() {
      if (checkActionState(ACTION_MINIMIZE, true)) {
        savePositionAndState()
        setMinimizePosition()

        setActionState(ACTION_EMBEDDED, true)
        setActionState(ACTION_MINIMIZE, true)
        return true
      }
      return false
    }

    function restore() {
      if (isActionActive(ACTION_VISIBLE) !== true) {
        // not allowed
        return

      }
      if (isActionActive(ACTION_MAXIMIZE) === true) {
        setActionState(ACTION_MAXIMIZE, false)
      } else if (isActionActive(ACTION_MINIMIZE) === true) {
        setActionState(ACTION_MINIMIZE, false)
      }
    }

    // go into fullscreen mode


    // toggle fullscreen mode
    function toggleFullscreen() {
      if (isActionActive(ACTION_VISIBLE) !== true) {
        // not allowed
        return
      }
      AppFullscreen.isActive ? fullscreenLeave() : fullscreenEnter()
    }

    function fullscreenEnter() {
      if (checkActionState(ACTION_FULLSCREEN, true)) {
        fullscreenInitiated.value = true
        AppFullscreen.request(windowRef.value)
        return true
      }
      return false
    }

    // leave fullscreen mode
    function fullscreenLeave() {
      if (checkActionState(ACTION_FULLSCREEN, false)) {
        AppFullscreen.exit()
        return true
      }
      return false
    }


    function checkActionState(mode, state) {
      let allowed = false
      switch (mode) {
        case ACTION_VISIBLE:
          if (state) {
            if (isActionActive(ACTION_VISIBLE) !== true) {
              allowed = true
            }
          } else {
            if (isActionActive(ACTION_VISIBLE) === true) {
              allowed = true
            }
          }
          break
        case ACTION_EMBEDDED:
          if (state) {
            if (isActionActive(ACTION_EMBEDDED) !== true
              && isActionActive(ACTION_FULLSCREEN) !== true) {
              allowed = true
            }
          } else {
            if (isActionActive(ACTION_EMBEDDED) === true
              && isActionActive(ACTION_FULLSCREEN) !== true) {
              allowed = true
            }
          }
          break
        case ACTION_PINNED:
          if (state) {
            if (isActionActive(ACTION_PINNED) !== true
              && isActionActive(ACTION_EMBEDDED) !== true
              && isActionActive(ACTION_MAXIMIZE) !== true
              && isActionActive(ACTION_MINIMIZE) !== true
              && isActionActive(ACTION_FULLSCREEN) !== true) {
              allowed = true
            }
          } else {
            if (isActionActive(ACTION_PINNED) === true
              && isActionActive(ACTION_EMBEDDED) !== true
              && isActionActive(ACTION_MAXIMIZE) !== true
              && isActionActive(ACTION_MINIMIZE) !== true
              && isActionActive(ACTION_FULLSCREEN) !== true) {
              allowed = true
            }
          }
          break
        case ACTION_MAXIMIZE:
          if (state) {
            if (isActionActive(ACTION_MINIMIZE) !== true
              && isActionActive(ACTION_EMBEDDED) !== true
              && isActionActive(ACTION_MAXIMIZE) !== true
              && isActionActive(ACTION_FULLSCREEN) !== true) {
              allowed = true
            }
          } else {
            if (isActionActive(ACTION_MAXIMIZE) === true
              && isActionActive(ACTION_EMBEDDED) !== true
              && isActionActive(ACTION_MINIMIZE) !== true
              && isActionActive(ACTION_FULLSCREEN) !== true) {
              allowed = true
            }
          }
          break
        case ACTION_FULLSCREEN:
          if (state === true) {
            if (isActionActive(ACTION_FULLSCREEN) !== true
              && isActionActive(ACTION_EMBEDDED) !== true) {
              allowed = true
            }
          } else {
            if (isActionActive(ACTION_FULLSCREEN) === true
              && isActionActive(ACTION_EMBEDDED) !== true) {
              allowed = true
            }
          }
          break
        case ACTION_CLOSE:
          if (state === true) {
            if (isActionActive(ACTION_EMBEDDED) !== true) {
              allowed = true
            }
          } else {
            allowed = true
          }
          break
        default:
          throw Error(`Unknown action type ${ mode }`)
      }
      return allowed
    }

    //
    function isActionActive(name) {
      if (name in actionItems.value) {
        return actionItems.value[ name ].state
      }
      return false
    }

    //
    function setActionState(id, val) {
      if (id in actionItems.value) {
        actionItems.value[ id ].state = val
        return true
      }
      return false
    }

    //
    //
    // onMounted(() => {
    //
    //   // calculate left starting position
    //   if (props.startX > 0) {
    //     states.value.left = props.startX
    //   } else {
    //     state.left = defaultX * QWindowCount
    //   }
    //   //
    //   // calculate top starting position
    //   if (props.startY > 0) {
    //     states.value.top = props.startY
    //   } else {
    //     states.value.top = defaultY * QWindowCount
    //   }
    //
    //   // calculate right and bottom starting positions
    //   states.value.right = states.value.left + props.width
    //   states.value.bottom = states.value.top + props.height
    //
    //
    //   document.addEventListener('scroll', onScroll, { passive: true })
    //
    // })


    function onScroll(e) {
      if (window !== void 0) {
        scrollY.value = window.scrollY
        scrollX.value = window.scrollX
      }
    }


    function canBeSelected(x, y) {
      // const sortedLayers = this.__computedSortedLayers
      // const sortedLayers = sortedLayers()
      // for (let index = sortedLayers.length - 1; index >= 0; --index) {
      //   if (sortedLayers[index].__portal !== void 0) {
      //     if (isPointInRect(x, y, sortedLayers[index].__portal.$el)) {
      //       if (sortedLayers[index].id === this.id) {
      //         return true
      //       }
      //       else {
      //         return false
      //       }
      //     }
      //   }
      // }
      // return false
    }

    //
    function setFullWindowPosition() {
      states.value.top = 0
      states.value.left = 0
      states.value.bottom = $q.screen.height
      states.value.right = $q.screen.width
    }

    //
    function setMinimizePosition() {
      const elements = document.getElementsByClassName('q-notifications__list--bottom')
      //if (elements.length > 0) {
      //  elements[0].appendChild(this.$el)
      //}
    }

    // //// MOUSE ACTIONS
    function addEventListeners() {
      document.body.addEventListener('mousemove', onMouseMove, { capture: true })
      document.body.addEventListener('mouseup', onMouseUp, { capture: true })
      document.body.addEventListener('keyup', onKeyUp, { capture: true })
    }

    function removeEventListeners() {
      document.body.removeEventListener('mousemove', onMouseMove, { capture: true })
      document.body.removeEventListener('mouseup', onMouseUp, { capture: true })
      document.body.removeEventListener('keyup', onKeyUp, { capture: true })
    }

    function onMouseMove(evt, rh) {

      if (states.value.shouldDrag !== true || (evt.touches === void 0 && evt.buttons !== 1)) {
        removeEventListeners()
        return
      }

      const mouseX = getMousePosition(evt, 'x')
      const mouseY = getMousePosition(evt, 'y')

      // wait 3 pixel move to initiate drag
      if (states.value.dragging !== true) {
        if (Math.abs(mousePos.value.x - mouseX) >= 3 || Math.abs(mousePos.value.y - mouseY) >= 3) {
          states.value.dragging = true
        } else {
          return
        }
      }

      switch (rh || resizeHandle.value) {
        case 'top':
          states.value.top = mouseY - window.scrollY - shiftY.value
          if (computedHeight.value < states.value.minHeight) {
            states.value.top = statesTmp.value.tmpBottom - states.value.minHeight
          }
          break
        case 'left':
          states.value.left = mouseX - window.scrollX - shiftX.value
          if (computedWidth.value < states.value.minWidth) {
            states.value.left = statesTmp.value.tmpRight - states.value.minWidth
          }
          break
        case 'right':
          states.value.right = mouseX - window.scrollX
          if (computedWidth.value < states.value.minWidth) {
            states.value.right = statesTmp.value.tmpLeft - states.value.minWidth
          }
          break
        case 'bottom':
          states.value.bottom = mouseY - window.scrollY
          if (computedHeight.value < states.value.minHeight) {
            states.value.bottom = statesTmp.value.tmpTop - states.value.minHeight
          }
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
          if (props.scrollWithWindow) {
            states.value.top = mouseY - shiftY.value
            states.value.left = mouseX - shiftX.value
          } else {
            states.value.top = mouseY - window.scrollY - shiftY.value
            states.value.left = mouseX - window.scrollX - shiftX.value
          }

          states.value.bottom = states.value.top - statesTmp.value.tmpHeight
          states.value.right = states.value.left - statesTmp.value.tmpWidth
          break
      }
      stopAndPrevent(evt)
    }

    function onMouseDown(evt, rh) {
      removeEventListeners()

      selected.value = false
      if (evt.touches === void 0 && evt.buttons !== 1) {
        return
      }

      if (isEmbedded.value === true) {
        states.value.shouldDrag = states.value.dragging = false
        return

      }

      const x = getMousePosition(evt, 'x')
      const y = getMousePosition(evt, 'y')

      //selected.value = canBeSelected(x - scrollX.value, y - scrollY.value)
      //if (!selected.valu) {
      //  return
      //}

      //bringToFront()

      resizeHandle.value = rh

      mousePos.value.x = x
      mousePos.value.y = y

      const rect = windowRef.value.getBoundingClientRect()
      shiftX.value = getMouseShift(evt, rect, 'x')
      shiftY.value = getMouseShift(evt, rect, 'y')

      statesTmp.value.tmpTop = states.value.top
      statesTmp.value.tmpLeft = states.value.left
      statesTmp.value.tmpRight = states.value.right
      statesTmp.value.tmpBottom = states.value.bottom
      statesTmp.value.tmpHeight = states.value.bottom - states.value.top
      statesTmp.value.tmpWidth = states.value.right - states.value.left

      states.value.shouldDrag = true

      addEventListeners()
      if (e.touches !== void 0) {
        addClass(document.body, 'q-window__touch-action')
      }
      prevent(evt)
    }

    // mousedown for document.body
    function onMouseDownBody(e) {
      if (isEmbedded.value) {
        states.value.shouldDrag = states.value.dragging = false
        return
      }

      // if dragging, already selected
      if (states.value.dragging !== true) {
        const x = getMousePosition(e, 'x')
        const y = getMousePosition(e, 'y')

        selected.value = canBeSelected(x - scrollX.value, y - scrollY.value)
        if (selected.value) {
          //bringToFront()
        }
      }
    }

    function onMouseUp(e) {
      if (states.value.dragging === true) {
        prevent(e)
        removeEventListeners()
        if (e.touches !== void 0) {
          removeClass(document.body, 'q-window__touch-action')
        }
        states.value.shouldDrag = states.value.dragging = false

      }
    }

    function onKeyUp(e) {
      // if ESC key
      if (e.keyCode === 27 && isDragging.value === true) {
        prevent(e)
        removeEventListeners()
        states.value.shouldDrag = states.value.dragging = false
        states.value.top = statesTmp.value.tmpTop
        states.value.left = statesTmp.value.tmpLeft
        states.value.right = statesTmp.value.tmpRight
        states.value.bottom = statesTmp.value.tmpBottom
      }
    }

    function onTouchMove(e, resizeHandle) {
      stopAndPrevent(e)
      resizeHandle.value = resizeHandle
      onMouseMove(e)
    }

    function onTouchStart(e, resizeHandle) {
      stopAndPrevent(e)
      onMouseDown(e, resizeHandle)
    }

    function onTouchEnd(e, resizeHandle) {
      stopAndPrevent(e)
      resizeHandle.value = resizeHandle
      onMouseUp(e)
    }

    const savePositionAndState = () => {
      restoreState.value.top = states.value.top
      restoreState.value.left = states.value.left
      restoreState.value.bottom = states.value.bottom
      restoreState.value.right = states.value.right

      restoreState.value.zIndex = computedZIndex.value

      restoreState.value.pinned = isActionActive(ACTION_PINNED)
      restoreState.value.embedded = isActionActive(ACTION_EMBEDDED)
      restoreState.value.maximize = isActionActive(ACTION_MAXIMIZE)
      restoreState.value.minimize = isActionActive(ACTION_MINIMIZE)

      console.log(`Save Position: ${ restoreState.value }`)

    }

    const restorePositionAndState = () => {
      states.value.top = restoreState.value.top
      states.value.left = restoreState.value.left
      states.value.bottom = restoreState.value.bottom
      states.value.right = restoreState.value.right
      zIndex.value = restoreState.value.zIndex

      setActionState(ACTION_PINNED, restoreState.value.pinned)
      setActionState(ACTION_EMBEDDED, restoreState.value.embedded)
      setActionState(ACTION_MAXIMIZE, restoreState.value.maximize)
      setActionState(ACTION_MINIMIZE, restoreState.value.minimize)

      console.log(`Save Position: ${ states.value }`)
    }

    watch(() => actionItems.value.maximize.state, (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        restorePositionAndState()
      }
    })

    watch(() => actionItems.value.minimize.state, (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        restorePositionAndState()
      }
    })

    watch(() => actionItems.value.fullscreen.state, (val, oldVal) => {
      if (oldVal === void 0) {
        return
      }
      if (val === true) {
        savePositionAndState()
        zIndex.value = maxZIndex
      } else {
        restorePositionAndState()
        fullscreenInitiated.value = val
      }
    })

    watch(() => AppFullscreen.isActive, (val, oldVal) => {
      if (fullscreenInitiated.value === true) {
        setActionState(ACTION_FULLSCREEN, val)
      }
    })

    watch(() => $q.screen.height, (val, oldVal) => {
      if (isFullscreen.value === true) {
        states.value.bottom = val
      }
    })
    watch(() => $q.screen.width, (val, oldVal) => {
      if (isFullscreen.value === true) {
        states.value.right = val
      }
    })
    const isVisible = computed(() => {
      return isActionActive(ACTION_VISIBLE)
    })

    const isEmbedded = computed(() => {
      return isActionActive(ACTION_EMBEDDED)
    })

    const isFloating = computed(() => {
      return isActionActive(ACTION_EMBEDDED) !== true
    })

    const isPinned = computed(() => {
      return isActionActive(ACTION_PINNED)
    })

    const isFullscreen = computed(() => {
      return isActionActive(ACTION_FULLSCREEN)
    })

    const isMaximized = computed(() => {
      return isActionActive(ACTION_MAXIMIZE)
    })

    const isMinimized = computed(() => {
      return isActionActive(ACTION_MINIMIZE)
    })

    const isDisabled = computed(() => {
      return props.disabled === true
    })

    const isEnabled = computed(() => {
      return isDisabled.value === false
    })

    const isDragging = computed(() => {
      return states.value.dragging === true
    })

    const isSelected = computed(() => {
      return selected.value === true
    })

    const canDrag = () => {
      return isVisible.value === true
        && isEmbedded.value !== true
        && isPinned.value !== true
        && isFullscreen.value !== true
        && isMaximized.value !== true
        && isMinimized.value !== true
    }

    const hasStateInfo = computed(() => {
      return Object.keys(actionItems.value).length > 0
    })


    const computedVisibility = computed(() => {
      return isVisible.value === true ? ACTION_VISIBLE : ACTION_HIDDEN
    })

    const computedToolbarHeight = computed(() => {
      return props.headless === true ? 0 : props.dense === true ? 28 : 40
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
      return computedLeft.value + (props.scrollWithWindow === false ? scrollX.value : 0)
    })

    const computedScrollY = computed(() => {
      return computedTop.value + (props.scrollWithWindow === false ? scrollY.value : 0)
    })

    const computedZIndex = computed(() => {
      let extra = 0
      if (isDragging.value) extra = 100
      return zIndex.value + extra
    })

    const computedActions = computed(() => {
      // sort and pick ones that are visible based on user selection and state
      const actions = []
      if (props.actions.includes(ACTION_EMBEDDED) && (checkActionState(ACTION_EMBEDDED, true) || checkActionState(ACTION_EMBEDDED, false))) {
        actions.push(ACTION_EMBEDDED)
      }
      if (props.actions.includes(ACTION_PINNED) && (checkActionState(ACTION_PINNED, true) || checkActionState(ACTION_PINNED, false))) {
        actions.push(ACTION_PINNED)
      }
      if (props.actions.includes(ACTION_FULLSCREEN) && (checkActionState(ACTION_FULLSCREEN, true) || checkActionState(ACTION_FULLSCREEN, false))) {
        actions.push(ACTION_FULLSCREEN)
      }
      if (props.actions.includes(ACTION_MAXIMIZE) && (checkActionState(ACTION_MAXIMIZE, true) || checkActionState(ACTION_MAXIMIZE, false))) {
        actions.push(ACTION_MAXIMIZE)
      }
      if (props.actions.includes(ACTION_MINIMIZE) && (checkActionState(ACTION_MINIMIZE, true) || checkActionState(ACTION_MINIMIZE, false))) {
        actions.push(ACTION_MINIMIZE)
      }
      if (props.actions.includes(ACTION_CLOSE) && checkActionState(ACTION_CLOSE, true)) {
        actions.push(ACTION_VISIBLE)
      }

      return actions
    })


    const computedMenuData = computed(() => {
      // get stateInfo for each menu item
      const menuData = []
      computedActions.value.map(key => {
        if (actionItems.value[ key ]) {
          menuData.push({ ...actionItems.value[ key ], key: key })
        }
      })
      return menuData
    })


    const __style = computed(() => {
      let style
      if (isMinimized.value === true) {
        style = {
          position: 'relative',
          visibility: computedVisibility.value,
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
          visibility: computedVisibility.value,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          width: '100%',
          height: '100%'
        }
      } else {
        const top = states.value.top + (props.scrollWithWindow !== true ? scrollY.value : 0)
        const left = states.value.left + (props.scrollWithWindow !== true ? scrollX.value : 0)
        console.log(top)
        console.log(left)
        style = {
          position: 'absolute',
          display: 'inline-block',
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          padding: 0,
          visibility: computedVisibility.value,
          minWidth: '90px',
          minHeight: '50px',
          top: top + 'px',
          left: left + 'px',
          zIndex: computedZIndex.value
        }


        if (isMaximized.value === true) {
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


    const __classes = computed(() => {
      return ''
        + (isEnabled.value === true ? ' q-focusable q-hoverable' : ' disabled')
        + (isEmbedded.value !== true && isFullscreen.value !== true ? ' q-window__floating' : '')
        + (isFullscreen.value === true ? ' q-window__fullscreen' : '')
        + (isSelected.value === true && isEmbedded.value !== true && isFullscreen.value !== true ? ' q-window__selected' : '')
        + (isDragging.value === true ? ' q-window__dragging q-window__touch-action' : '');
    })
//
    const {
      renderGrippers,
      renderResizeHandles,
      renderResizeHandle
    } = useResize(props, slots, computedHeight, computedToolbarHeight, zIndex, canDrag, computedWidth, onMouseDown, onTouchStart, onTouchMove, onTouchEnd)

    const {
      renderTitleBar
    } = useToolbar(props, slots, computedZIndex, canDrag, isDragging, isEmbedded, isMinimized, computedMenuData, renderResizeHandle)

    const {
      renderBody
    } = useBody(props, slots, computedHeight, computedToolbarHeight, zIndex, canDrag, isEmbedded, isFullscreen)


    function renderWindow() {
      return h('div', {
        class: [ 'q-window', __classes.value, props.contentClass ],
        style: __style.value,
        to: '#q-app',
        disabled: props.modelValue,
        ref: windowRef,
      }, [
        (canDrag() === true) && [...renderResizeHandles()],
        (canDrag() === true) && [...renderGrippers()],
        renderTitleBar(),
        isMinimized.value !== true && renderBody()
      ])
    }

    function render() {
      return h(Teleport, {
          to: '#q-app',
          disabled: isEmbedded.value
        },
        [
          renderWindow()
        ]
      )
    }

    return () => render()
  }
})


