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


const MENU_ITEM_VISIBLE = 'visible';
const MENU_ITEM_EMBEDDED = 'embedded';
const MENU_ITEM_FULLSCREEN = 'fullscreen';
const MENU_ITEM_PINNED = 'pinned';
const MENU_ITEM_MAXIMIZE = 'maximize';
const MENU_ITEM_MINIMIZE = 'minimize';
const MENU_ITEM_CLOSE = 'close';
export const MENU_ITEM_SEPARATOR = 'separator';

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
      default: () => ([ 'pin', MENU_ITEM_EMBEDDED, MENU_ITEM_CLOSE ]),
      validator: (v) => v.some(action => [
        'pin',
        MENU_ITEM_EMBEDDED,
        MENU_ITEM_MINIMIZE,
        MENU_ITEM_MAXIMIZE,
        MENU_ITEM_CLOSE,
        MENU_ITEM_FULLSCREEN ].includes(action))
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
    MENU_ITEM_FULLSCREEN,
    MENU_ITEM_EMBEDDED,
    MENU_ITEM_PINNED,
    MENU_ITEM_MAXIMIZE,
    MENU_ITEM_MINIMIZE,
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

    const menuActionItems = ref({

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
      x:0, y:0
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
      if (checkMenuItemState('visible', true)) {
        setMenuItemState('visible', true)
        return true
      }
      return false
    }


    // hide the component
    function hide() {
      if (checkMenuItemState('visible', false)) {
        setMenuItemState('visible', false)
        return true
      }
      return false
    }

    // embedded
    function lock() {
     if (checkMenuItemState('embedded', true)) {
       setMenuItemState('embedded', true)
       return true
     }
      return false
    }

    // floating
    function unlock() {
     if (checkMenuItemState('embedded', false)) {
       setMenuItemState('embedded', false)
       return true
     }
      return false
    }

    // pinned (can't move or re-size)
    function pin() {
      if (checkMenuItemState('pinned', true)) {
        setMenuItemState('pinned', true)
        return true
      }
      return false
    }


    // move and resize available, if not embedded
    function unpin() {
      if (checkMenuItemState('pinned', false)) {
        setMenuItemState('pinned', false)
        return true
      }
      return false
    }

    function maximize() {
      if (checkMenuItemState('maximize', true)) {
        //thisbringToFront()
        savePositionAndState()
        setFullWindowPosition()


        setMenuItemState('embedded', false)
        nextTick(() => {
          setMenuItemState('maximize', true)
        })
        return true
      }
      return false
    }

    function minimize() {
      if (checkMenuItemState('minimize', true)) {
        savePositionAndState()
        setMinimizePosition()

        setMenuItemState('embedded', true)
        setMenuItemState('minimize', true)
        return true
      }
      return false
    }

    function restore() {
      if (isMenuItemActive('visible') !== true) {
        // not allowed
        return

      }
      if (isMenuItemActive('maximize') === true) {
        setMenuItemState('maximize', false)
        this.$emit('maximize', false)
      } else if (isMenuItemActive('minimize') === true) {
        setMenuItemState('minimize', false)
      }
    }

    // go into fullscreen mode



    // toggle fullscreen mode
    function toggleFullscreen() {
      if (isMenuItemActive('visible') !== true) {
        // not allowed
        return
      }
      AppFullscreen.isActive ? fullscreenLeave() : fullscreenEnter()
    }

    function fullscreenEnter() {
      if (checkMenuItemState('fullscreen', true)) {
        fullscreenInitiated.value = true
        AppFullscreen.request(windowRef.value)
        return true
      }
      return false
    }

    // leave fullscreen mode
    function fullscreenLeave() {
      if (checkMenuItemState('fullscreen', false)) {
        AppFullscreen.exit()
        return true
      }
      return false
    }


    function checkMenuItemState(mode, state) {
      let active = false
      switch (mode) {
        case MENU_ITEM_VISIBLE:
          if (state) {
            if (isMenuItemActive(MENU_ITEM_VISIBLE) !== true) {
              active = true
            }
          } else {
            if (isMenuItemActive(MENU_ITEM_VISIBLE) === true) {
              active = true
            }
          }
          break
        case MENU_ITEM_EMBEDDED:
          console.log('EMBEDDED')
          if (state) {
            if (isMenuItemActive(MENU_ITEM_EMBEDDED) !== true
              && isMenuItemActive(MENU_ITEM_FULLSCREEN) !== true) {
              console.log('EMBEDDED')
              active = true
            }
          } else {
            if (isMenuItemActive(MENU_ITEM_EMBEDDED) === true
              && isMenuItemActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_PINNED:
          if (state) {
            if (isMenuItemActive(MENU_ITEM_PINNED) !== true
              && isMenuItemActive(MENU_ITEM_EMBEDDED) !== true
              && isMenuItemActive(MENU_ITEM_MAXIMIZE) !== true
              && isMenuItemActive(MENU_ITEM_MINIMIZE) !== true
              && isMenuItemActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          } else {
            if (isMenuItemActive(MENU_ITEM_PINNED) === true
              && isMenuItemActive(MENU_ITEM_EMBEDDED) !== true
              && isMenuItemActive(MENU_ITEM_MAXIMIZE) !== true
              && isMenuItemActive(MENU_ITEM_MINIMIZE) !== true
              && isMenuItemActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_MAXIMIZE:
          if (state) {
            if (isMenuItemActive(MENU_ITEM_MINIMIZE) !== true
              && isMenuItemActive(MENU_ITEM_EMBEDDED) !== true
              && isMenuItemActive(MENU_ITEM_MAXIMIZE) !== true
              && isMenuItemActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          } else {
            if (isMenuItemActive(MENU_ITEM_MAXIMIZE) === true
              && isMenuItemActive(MENU_ITEM_EMBEDDED) !== true
              && isMenuItemActive(MENU_ITEM_MINIMIZE) !== true
              && isMenuItemActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_FULLSCREEN:
          if (state === true) {
            if (isMenuItemActive(MENU_ITEM_FULLSCREEN) !== true
              && isMenuItemActive(MENU_ITEM_EMBEDDED) !== true) {
              active = true
            }
          } else {
            if (isMenuItemActive(MENU_ITEM_FULLSCREEN) === true
              && isMenuItemActive(MENU_ITEM_EMBEDDED) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_CLOSE:
          if (state === true) {
            if (isMenuItemActive(MENU_ITEM_EMBEDDED) !== true) {
              active = true
            }
          } else {
            active = true
          }
          break
        default:
          throw Error(`Unknown action type ${ mode }`)
      }
      return active
    }

    //
    function isMenuItemActive(name) {
      if (name in menuActionItems.value) {
        return menuActionItems.value[ name ].state
      }
      return false
    }
    //
    function setMenuItemState(id, val) {
      if (id in menuActionItems.value) {
        menuActionItems.value[ id ].state = val
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
    //
    // //// MOUSE ACTIONS
    //
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

      restoreState.value.pinned = isMenuItemActive('pinned')
      restoreState.value.embedded = isMenuItemActive('embedded')
      restoreState.value.maximize = isMenuItemActive('maximize')
      restoreState.value.minimize = isMenuItemActive('minimize')

      console.log(`Save Position: ${ restoreState.value }`)

    }

    const restorePositionAndState = () => {
      states.value.top = restoreState.value.top
      states.value.left = restoreState.value.left
      states.value.bottom = restoreState.value.bottom
      states.value.right = restoreState.value.right
      zIndex.value = restoreState.value.zIndex

      setMenuItemState('pinned', restoreState.value.pinned)
      setMenuItemState('embedded', restoreState.value.embedded)
      setMenuItemState('maximize', restoreState.value.maximize)
      setMenuItemState('minimize', restoreState.value.minimize)

      console.log(`Save Position: ${ states.value }`)
    }



    watch(() =>  menuActionItems.value.maximize.state , (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        restorePositionAndState()
      }
    })

    watch(() =>  menuActionItems.value.minimize.state , (val, oldVal) => {
      if (oldVal === void 0) {
        // during initialization
        return
      }
      if (val === false) {
        restorePositionAndState()
      }
    })

    watch(() =>  menuActionItems.value.fullscreen.state , (val, oldVal) => {
      if (oldVal === void 0) {
        return
      }
      if (val === true) {
        savePositionAndState()
        zIndex.value = maxZIndex
      }
      else {
        restorePositionAndState()
        fullscreenInitiated.value = val
      }
    })

    watch(() =>  AppFullscreen.isActive, (val, oldVal) => {
      if (fullscreenInitiated.value === true) {
        setMenuItemState('fullscreen', val)
      }
    })

    watch(() =>  $q.screen.height, (val, oldVal) => {
      if (isFullscreen.value === true) {
        states.value.bottom = val
      }
    })
    watch(() =>  $q.screen.width, (val, oldVal) => {
      if (isFullscreen.value === true) {
        states.value.right = val
      }
    })
    const isVisible = computed(() => {
      return isMenuItemActive('visible')
    })

    const isEmbedded = computed(() => {
      return isMenuItemActive('embedded')
    })

    const isFloating = computed(() => {
      return isMenuItemActive('embedded') !== true
    })

    const isPinned = computed(() => {
      return isMenuItemActive('pinned')
    })

    const isFullscreen = computed(() => {
      return isMenuItemActive('fullscreen')
    })

    const isMaximized = computed(() => {
      return isMenuItemActive('maximize')
    })

    const isMinimized = computed(() => {
      return isMenuItemActive('minimize')
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
      return Object.keys(menuActionItems).length > 0
    })


    const computedVisibility = computed(() => {
      return isVisible.value === true ? 'visible' : 'hidden'
    })
    //
    const computedToolbarHeight = computed(() => {
      return props.headless === true ? 0 : props.dense === true ? 28 : 40
    })
    //
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
    //
    const computedZIndex = computed(() => {
      let extra = 0
      if (isDragging.value) extra = 100
      return zIndex.value + extra
    })


    const  computedActions = computed(() => {
      // sort and pick ones that are visible based on user selection and state
      const actions = []
      if (props.actions.includes('embedded') && (checkMenuItemState('embedded', true) || checkMenuItemState('embedded', false))) {
        actions.push('embedded')
      }
      if (props.actions.includes('pin') && (checkMenuItemState('pinned', true) || checkMenuItemState('pinned', false))) {
        actions.push('pinned')
      }
      if (props.actions.includes('fullscreen') && (checkMenuItemState('fullscreen', true) || checkMenuItemState('fullscreen', false))) {
        actions.push('fullscreen')
      }
      if (props.actions.includes('maximize') && (checkMenuItemState('maximize', true) || checkMenuItemState('maximize', false))) {
        actions.push('maximize')
      }
      // if (this.actions.includes('minimize') && (this.canDo('minimize', true) || this.canDo('minimize', false))) {
      //   actions.push('maximize')
      // }
      if (props.actions.includes('close') && checkMenuItemState('close', true)) {
        actions.push('visible')
      }

      return actions
    })
    //
    const computedMenuData = computed( () => {
      // get stateInfo for each menu item
      const menuData = []
      computedActions.value.map(key => {
        if (menuActionItems.value[ key ]) {
          menuData.push({ ...menuActionItems.value[ key ], key: key })
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
     } = useResize(props, slots, computedHeight, computedToolbarHeight, zIndex, canDrag, computedWidth,onMouseDown,onTouchStart,onTouchMove,onTouchEnd)
    const { renderTitleBar } = useToolbar(props, slots, computedZIndex, canDrag, isDragging,   isEmbedded,isMinimized,computedMenuData, renderResizeHandle)
    const { renderBody } = useBody(props, slots, computedHeight, computedToolbarHeight, zIndex, canDrag,isEmbedded,isFullscreen)


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
      } ,
        [
         renderWindow()
        ]
      )
    }

    return () => render()
  }
})


