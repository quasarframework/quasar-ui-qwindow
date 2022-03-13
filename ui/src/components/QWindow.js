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
  getCurrentInstance,
  reactive,
  Teleport,
  watchEffect
} from 'vue'

import {
  ClosePopup,
  Scroll,
  useQuasar,
  AppFullscreen
} from 'quasar'

import { useMachine } from '@xstate/vue';
import useToolbar from "./composables/useToolbar";
import useBody from "./composables/useBody";
import { qWindowMachine } from "./composables/machine";
import { assign } from "@xstate/fsm";
import useResize from "./composables/useResize";


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


const MENU_ITEM_VISIBLE = 'visible';
const MENU_ITEM_EMBEDDED = 'embedded';
const MENU_ITEM_FULLSCREEN = 'fullscreen';
const MENU_ITEM_PINNED = 'pinned';
const MENU_ITEM_MAXIMIZE = 'maximize';
const MENU_ITEM_MINIMIZE = 'minimize';
export const MENU_ITEM_SEPARATOR = 'separator';
const MENU_ITEM_CLOSE = 'close';
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

    const states = ref({
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
    QWindowCount = QWindowCount + 1
    const $q = useQuasar()
    const windowRef = ref(null)
    onMounted(() => {
      send('UPDATE_MENU_ACTIONS', { value: props.actions })
      // calculate left starting position
      if (props.startX > 0) {
        states.value.left = props.startX
      } else {
        state.left = defaultX * QWindowCount
      }

      // calculate top starting position
      if (props.startY > 0) {
        states.value.top = props.startY
      } else {
        states.value.top = defaultY * QWindowCount
      }

      // calculate right and bottom starting positions
      states.value.right = states.value.left + props.width
      states.value.bottom = states.value.top + props.height
    })


    let context;
    const { state, send, service } = useMachine(qWindowMachine, {
        context: {
          menuData: [],
          actions: {
            visible: {
              state: true,
              name: 'VISIBLE',
              on: {
                label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.label !== void 0 ? this.iconSet.visible.on.label : iconSetTemplate.value.visible.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.icon !== void 0 ? this.iconSet.visible.on.icon : iconSetTemplate.value.visible.on.icon,
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.label !== void 0 ? this.iconSet.visible.off.label : iconSetTemplate.value.visible.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.icon !== void 0 ? this.iconSet.visible.off.icon : iconSetTemplate.value.visible.off.icon,
              }
            },
            embedded: {
              state: true,
              name: 'EMBED',
              on: {
                label: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.on !== void 0 && props.iconSet.embedded.on.label !== void 0 ? props.iconSet.embedded.on.label : iconSetTemplate.value.embedded.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.on !== void 0 && props.iconSet.embedded.on.icon !== void 0 ? props.iconSet.embedded.on.icon : iconSetTemplate.value.embedded.on.icon,
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.off !== void 0 && props.iconSet.embedded.off.label !== void 0 ? props.iconSet.embedded.off.label : iconSetTemplate.value.embedded.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.off !== void 0 && props.iconSet.embedded.off.icon !== void 0 ? props.iconSet.embedded.off.icon : iconSetTemplate.value.embedded.off.icon,
              }
            },
            pinned: {
              state: false,
              name: 'PIN',
              on: {
                label: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.on !== void 0 && props.iconSet.pinned.on.label !== void 0 ? props.iconSet.pinned.on.label : iconSetTemplate.value.pinned.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.on !== void 0 && props.iconSet.pinned.on.icon !== void 0 ? props.iconSet.pinned.on.icon : iconSetTemplate.value.pinned.on.icon,
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.off !== void 0 && props.iconSet.pinned.off.label !== void 0 ? props.iconSet.pinned.off.label : iconSetTemplate.value.pinned.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.off !== void 0 && props.iconSet.pinned.off.icon !== void 0 ? props.iconSet.pinned.off.icon : iconSetTemplate.value.pinned.off.icon,
              }
            },
            fullscreen: {
              state: false,
              name: 'FULLSCREEN',
              on: {
                label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.label !== void 0 ? props.iconSet.fullscreen.on.label : iconSetTemplate.value.fullscreen.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.icon !== void 0 ? props.iconSet.fullscreen.on.icon : iconSetTemplate.value.fullscreen.on.icon,
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.label !== void 0 ? props.iconSet.fullscreen.off.label : iconSetTemplate.value.fullscreen.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.icon !== void 0 ? props.iconSet.fullscreen.off.icon : iconSetTemplate.value.fullscreen.off.icon,
              }
            },
            maximize: {
              state: false,
              name: 'MAXIMIZE',
              on: {
                label: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.on !== void 0 && props.iconSet.maximize.on.label !== void 0 ? props.iconSet.maximize.on.label : iconSetTemplate.value.maximize.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.on !== void 0 && props.iconSet.maximize.on.icon !== void 0 ? props.iconSet.maximize.on.icon : iconSetTemplate.value.maximize.on.icon,

              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.off !== void 0 && props.iconSet.maximize.off.label !== void 0 ? props.iconSet.maximize.off.label : iconSetTemplate.value.maximize.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.off !== void 0 && props.iconSet.maximize.off.icon !== void 0 ? props.iconSet.maximize.off.icon : iconSetTemplate.value.maximize.off.icon,
              }
            },
            minimize: {
              state: false,
              name: 'MINIMIZE',
              on: {
                label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.label !== void 0 ? props.iconSet.minimize.on.label : iconSetTemplate.value.minimize.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.icon !== void 0 ? props.iconSet.minimize.on.icon : iconSetTemplate.value.minimize.on.icon,

              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.label !== void 0 ? props.iconSet.minimize.off.label : iconSetTemplate.value.minimize.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.icon !== void 0 ? props.iconSet.minimize.off.icon : iconSetTemplate.value.minimize.off.icon,
              }
            }
          }
        },
        actions: {
          menu: assign((ctx, evt) => {
            console.log(props.actions)
            const menu = props.actions
            const filteredActions = []
            if (menu.includes(MENU_ITEM_EMBEDDED) && (checkActions(MENU_ITEM_EMBEDDED, true, ctx) || checkActions(MENU_ITEM_EMBEDDED, false, ctx))) {
              filteredActions.push(MENU_ITEM_EMBEDDED)
            }
            if (menu.includes('pin') && (checkActions(MENU_ITEM_PINNED, true, ctx) || checkActions(MENU_ITEM_PINNED, false, ctx))) {
              filteredActions.push(MENU_ITEM_PINNED)
            }
            if (menu.includes(MENU_ITEM_FULLSCREEN) && (checkActions(MENU_ITEM_FULLSCREEN, true, ctx) || checkActions(MENU_ITEM_FULLSCREEN, false, ctx))) {
              filteredActions.push(MENU_ITEM_FULLSCREEN)
            }
            if (menu.includes(MENU_ITEM_MAXIMIZE) && (checkActions(MENU_ITEM_MAXIMIZE, true, ctx) || checkActions(MENU_ITEM_MAXIMIZE, false, ctx))) {
              filteredActions.push(MENU_ITEM_MAXIMIZE)
            }
            if (props.actions.includes(MENU_ITEM_MINIMIZE) && (checkActions(MENU_ITEM_MINIMIZE, true) || checkActions(MENU_ITEM_MINIMIZE, false))) {
              filteredActions.push(MENU_ITEM_MINIMIZE)
            }
            if (menu.includes(MENU_ITEM_CLOSE) && checkActions(MENU_ITEM_CLOSE, true, ctx)) {
              filteredActions.push(MENU_ITEM_VISIBLE)
            }

            const menuData = []
            filteredActions.map(key => {
              if (ctx.actions[ key ]) {
                menuData.push({ ...ctx.actions[ key ], key: key })
              }
            })


            console.info(menuData)
            return {
              menuData: menuData,
              actions: {
                ...ctx.actions,
                menu: evt.value,
              }
            }
          }),
          embed: assign((ctx) => {
            if (ctx.actions.embedded.state === true) {
              return emitAndAssign(MENU_ITEM_EMBEDDED, false, ctx)
            } else {
              return emitAndAssign(MENU_ITEM_EMBEDDED, true, ctx)
            }
          }),
          visible: assign((ctx) => {
            if (ctx.actions.visible.state === true) {
              return emitAndAssign(MENU_ITEM_VISIBLE, true, ctx)
            } else {
              return emitAndAssign(MENU_ITEM_VISIBLE, false, ctx)
            }
          }),
          maximize: assign((ctx) => {
            savePositionAndState()
            setFullWindowPosition()
            return {
              actions: {
                ...ctx.actions,
                ...ctx.actions[ 'embedded' ].state = false,
                ...ctx.actions[ 'maximize' ].state = true
              }
            }
          }),
          minimize: assign((ctx, evt) => {
            savePositionAndState()

            // TODO LOGIC
            const elements = document.getElementsByClassName('q-notifications__list--bottom')
            if (elements.length > 0) {
              //elements[0].appendChild(this.$el)
            }

            return {
              actions: {
                ...ctx.actions,
                ...ctx.actions[ 'embedded' ].state = true,
                ...ctx.actions[ 'minimize' ].state = true
              }
            }
          }),
          fullscreenLeave: assign((ctx, evt) => {
            restorePositionAndState()
            return emitAndAssign(MENU_ITEM_FULLSCREEN, false, ctx)
          }),
          fullScreenEnter: assign(async (ctx, evt) => {
            fullscreenInitiated.value = true
            savePositionAndState()
            zIndex.value = maxZIndex
            return emitAndAssign(MENU_ITEM_FULLSCREEN, true, ctx)
          }),
          restore: assign((ctx, evt) => {
            if (ctx.actions[ MENU_ITEM_VISIBLE ].state) {
              return ctx
            }

            if (ctx.actions.maximize.state === true) {
              restorePositionAndState()
              return emitAndAssign(MENU_ITEM_MAXIMIZE, false, ctx)
            } else if (ctx.actions[ MENU_ITEM_MINIMIZE ].state) {
              return emitAndAssign(MENU_ITEM_MAXIMIZE, false, ctx)
            }
          }),
        },
        services: {
          openFullscreen: (context, event) => {
            return AppFullscreen.request(windowRef.value)
          },
          closeFullscreen: (context, event) => {
            return AppFullscreen.exit()
          }
        },
        guards: {
          isRestoreState: (ctx) => {
            return (ctx.actions.maximize.state === true)
          },
          isFullscreen: (ctx) => {
            return (ctx.actions.fullscreen.state === true)
          }
        }
      }
    );

    function emitAndAssign(name, state, ctx) {
      emit(name, state)
      return {
        actions: {
          ...ctx.actions,
          ...ctx.actions[ name ].state = state
        }
      }
    }

    function setFullWindowPosition() {
      states.value.top = 0
      states.value.left = 0
      states.value.bottom = $q.screen.height
      states.value.right = $q.screen.width
    }

    function checkActions(mode, state, ctx) {
      let active = false
      switch (mode) {
        case MENU_ITEM_VISIBLE:
          if (state) {
            if (isActive(MENU_ITEM_VISIBLE) !== true) {
              active = true
            }
          } else {
            if (isActive(MENU_ITEM_VISIBLE) === true) {
              active = true
            }
          }
          break
        case MENU_ITEM_EMBEDDED:
          if (state) {
            if (isActive(MENU_ITEM_EMBEDDED) !== true
              && isActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          } else {
            if (isActive(MENU_ITEM_EMBEDDED) === true
              && isActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_PINNED:
          if (state) {
            if (isActive(MENU_ITEM_PINNED) !== true
              && isActive(MENU_ITEM_EMBEDDED) !== true
              && isActive(MENU_ITEM_MAXIMIZE) !== true
              && isActive(MENU_ITEM_MINIMIZE) !== true
              && isActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          } else {
            if (isActive(MENU_ITEM_PINNED) === true
              && isActive(MENU_ITEM_EMBEDDED) !== true
              && isActive(MENU_ITEM_MAXIMIZE) !== true
              && isActive(MENU_ITEM_MINIMIZE) !== true
              && isActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_MAXIMIZE:
          if (state) {
            if (isActive(MENU_ITEM_MINIMIZE) !== true
              && isActive(MENU_ITEM_EMBEDDED) !== true
              && isActive(MENU_ITEM_MAXIMIZE) !== true
              && isActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          } else {
            if (isActive(MENU_ITEM_MAXIMIZE) === true
              && isActive(MENU_ITEM_EMBEDDED) !== true
              && isActive(MENU_ITEM_MINIMIZE) !== true
              && isActive(MENU_ITEM_FULLSCREEN) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_FULLSCREEN:
          if (state === true) {
            if (isActive(MENU_ITEM_FULLSCREEN) !== true
              && isActive(MENU_ITEM_EMBEDDED) !== true) {
              active = true
            }
          } else {
            if (isActive(MENU_ITEM_FULLSCREEN) === true
              && isActive(MENU_ITEM_EMBEDDED) !== true) {
              active = true
            }
          }
          break
        case MENU_ITEM_CLOSE:
          if (state === true) {
            if (isActive(MENU_ITEM_EMBEDDED) !== true) {
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

    function isActive(name) {
      const states = state.value.context.actions
      if (name in states) {
        return states[ name ].state
      }
      return false
    }

    service.onTransition((state) => {
      context = state.context
      console.log(state)
    })

    watch(() => $q.fullscreen.isActive, (isActive) => {
      if (isActive === false && state.value.context.actions.fullscreen.state === true) {
        send('FULLSCREEN')
      }
    })

    // TODO ?
    watch([ () => $q.screen.height, () => $q.screen.width ], ([ height, width ]) => {
      //if (state.value.context.actions.fullscreen.state === true) {
      // states.value.bottom = height
      // states.value.right = width
      // }
    })


    const savePositionAndState = () => {
      restoreState.value.top = states.value.top
      restoreState.value.left = states.value.left
      restoreState.value.bottom = states.value.bottom
      restoreState.value.right = states.value.right
      restoreState.value.zIndex = __computedZIndex.value

      restoreState.value.pinned = state.value.context.actions.pinned.state
      restoreState.value.embedded = state.value.context.actions.embedded.state
      restoreState.value.maximize = state.value.context.actions.maximize.state
      restoreState.value.minimize = state.value.context.actions.minimize.state
    }

    const restorePositionAndState = () => {
      states.value.top = restoreState.value.top
      states.value.left = restoreState.value.left
      states.value.bottom = restoreState.value.bottom
      states.value.right = restoreState.value.right
      zIndex.value = restoreState.value.zIndex
      state.value.context.actions.pinned.state = restoreState.value.pinned
      state.value.context.actions.embedded.state = restoreState.value.embedded
      state.value.context.actions.maximize.state = restoreState.value.maximize
      state.value.context.actions.minimize.state = restoreState.value.minimize
    }

    const canDrag = () => {
      return true;
      //this.isVisible === true &&
      //this.isEmbedded !== true &&
      // this.isPinned !== true &&
      // this.isFullscreen !== true &&
      // this.isMaximized !== true &&
      // this.isMinimized !== true
    }

    const zIndex = ref(4000)
    const mouseOffsetX = ref(-1) // FIXME unused ?
    const mouseOffsetY = ref(-1) // FIXME unused ?
    const mousePos = ref({ x: 0, y: 0 })
    const scrollX = ref(0)
    const scrollY = ref(0)
    const selected = ref(false)
    const fullscreenInitiated = ref(false)


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


    const __computedVisibility = computed(() => {
      return state.value.context.actions.visible.state === true ? 'visible' : 'hidden'
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

    const __computedZIndex = computed(() => {
      let extra = 0
      if (isDragging.value) extra = 100
      return zIndex.value + extra
    })

    const computedPosition = computed(() => {
      return {
        left: states.value.left,
        top: states.value.top,
        width: computedWidth.value,
        height: computedHeight.value,
        scrollX: computedScrollX.value,
        scrollY: computedScrollY.value
      }
    })

    const __style = computed(() => {
      let style
      if (state.value.context.actions.minimize.state === true) {
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
      } else if (state.value.context.actions.embedded.state === true) {
        style = {
          position: 'relative',
          visibility: __computedVisibility.value,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          width: '100%',
          height: '100%'
        }
      } else {
        const top = states.value.top + (props.scrollWithWindow !== true ? scrollY.value : 0)
        const left = states.value.left + (props.scrollWithWindow !== true ? scrollX.value : 0)
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
        if (state.value.context.actions.maximize.state) {
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
      const classStyle = ''
        + (isEnabled.value === true ? ' q-focusable q-hoverable' : ' disabled')
        + (state.value.context.actions.embedded.state !== true && state.value.context.actions.fullscreen.state !== true ? ' q-window__floating' : '')
        + (state.value.context.actions.fullscreen.state === true ? ' q-window__fullscreen' : '')
        + (isSelected.value === true && state.value.context.actions.embedded.state !== true && state.value.context.actions.fullscreen.state !== true ? ' q-window__selected' : '')
        + (isDragging.value === true ? ' q-window__dragging q-window__touch-action' : '');

      console.log(classStyle)
      return classStyle
    })


    const { renderTitleBar } = useToolbar(props, slots, state, send, __computedZIndex)
    const { renderBody } = useBody(props, slots, computedHeight, computedToolbarHeight, zIndex, state)
    const {
      renderGrippers,
      renderResizeHandles
    } = useResize(props, slots, computedHeight, computedToolbarHeight, zIndex, state, canDrag, computedWidth)

    function renderWindow() {
      return h('div', {
        class: [ 'q-window', __classes.value, props.contentClass ],
        style: __style.value,
        to: '#q-app',
        disabled: props.modelValue,
        ref: windowRef,
        refInFor: true,
        key: QWindowCount
      }, [
        (canDrag() === true) && [...renderResizeHandles()],
        (canDrag() === true) && [...renderGrippers()],
        renderTitleBar(),
        state.value.context.actions.minimize.state !== true && renderBody()
      ])
    }

    function render() {
      return h(Teleport, {
        key: QWindowCount,
        to: 'body',
        disabled: props.modelValue
      }, [renderWindow()])
    }
    return () => render()
  }
})


