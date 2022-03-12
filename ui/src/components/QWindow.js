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
          icon: MENU_ITEM_CLOSE,
          label: 'Show'
        },
        off: {
          icon: MENU_ITEM_CLOSE,
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
          icon: MENU_ITEM_FULLSCREEN,
          label: 'Enter fullscreen'
        },
        off: {
          icon: 'fullscreen_exit',
          label: 'Leave fullscreen'
        }
      }
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
    const $q = useQuasar()
   const windowRef = ref()
    onMounted(() => {
      // calculate left starting position
      if (props.startX > 0) {
        states.value.left = props.startX
      }
      else {
        state.left = defaultX * QWindowCount
      }

      // calculate top starting position
      if (props.startY > 0) {
        states.value.top = props.startY
      }
      else {
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
            menu: [],
            floating: {
              state: false
            },
            visible: {
              state: true,
              on: {
                label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.label !== void 0 ? this.iconSet.visible.on.label : iconSetTemplate.value.visible.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.on !== void 0 && props.iconSet.visible.on.icon !== void 0 ? this.iconSet.visible.on.icon : iconSetTemplate.value.visible.on.icon,
                action: 'SHOW'
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.label !== void 0 ? this.iconSet.visible.off.label : iconSetTemplate.value.visible.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.visible !== void 0 && props.iconSet.visible.off !== void 0 && props.iconSet.visible.off.icon !== void 0 ? this.iconSet.visible.off.icon : iconSetTemplate.value.visible.off.icon,
                action: 'HIDE'
              }
            },
            embedded: {
              state: true,
              on: {
                action: 'LOCK',
                label: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.on !== void 0 && props.iconSet.embedded.on.label !== void 0 ? props.iconSet.embedded.on.label : iconSetTemplate.value.embedded.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.on !== void 0 && props.iconSet.embedded.on.icon !== void 0 ? props.iconSet.embedded.on.icon : iconSetTemplate.value.embedded.on.icon,
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.off !== void 0 && props.iconSet.embedded.off.label !== void 0 ? props.iconSet.embedded.off.label : iconSetTemplate.value.embedded.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.embedded !== void 0 && props.iconSet.embedded.off !== void 0 && props.iconSet.embedded.off.icon !== void 0 ? props.iconSet.embedded.off.icon : iconSetTemplate.value.embedded.off.icon,
                action: 'UNLOCK',
              }
            },
            pinned: {
              state: false,
              on: {
                label: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.on !== void 0 && props.iconSet.pinned.on.label !== void 0 ? props.iconSet.pinned.on.label : iconSetTemplate.value.pinned.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.on !== void 0 && props.iconSet.pinned.on.icon !== void 0 ? props.iconSet.pinned.on.icon : iconSetTemplate.value.pinned.on.icon,
                action: 'PIN',
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.off !== void 0 && props.iconSet.pinned.off.label !== void 0 ? props.iconSet.pinned.off.label : iconSetTemplate.value.pinned.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.pinned !== void 0 && props.iconSet.pinned.off !== void 0 && props.iconSet.pinned.off.icon !== void 0 ? props.iconSet.pinned.off.icon : iconSetTemplate.value.pinned.off.icon,
                action: 'UNPIN',
              }
            },
            fullscreen: {
              state: false,
              on: {
                label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.label !== void 0 ? props.iconSet.fullscreen.on.label : iconSetTemplate.value.fullscreen.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.on !== void 0 && props.iconSet.fullscreen.on.icon !== void 0 ? props.iconSet.fullscreen.on.icon : iconSetTemplate.value.fullscreen.on.icon,
                action: 'FULLSCREEN_ENTER'
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.label !== void 0 ? props.iconSet.fullscreen.off.label : iconSetTemplate.value.fullscreen.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.fullscreen !== void 0 && props.iconSet.fullscreen.off !== void 0 && props.iconSet.fullscreen.off.icon !== void 0 ? props.iconSet.fullscreen.off.icon : iconSetTemplate.value.fullscreen.off.icon,
                action: 'FULLSCREEN_LEAVE'
              }
            },
            maximized: {
              state: false,
              on: {
                label: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.on !== void 0 && props.iconSet.maximize.on.label !== void 0 ? props.iconSet.maximize.on.label : iconSetTemplate.value.maximize.on.label,
                icon: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.on !== void 0 && props.iconSet.maximize.on.icon !== void 0 ? props.iconSet.maximize.on.icon : iconSetTemplate.value.maximize.on.icon,
                action: 'MAXIMIZE'
              },
              off: {
                label: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.off !== void 0 && props.iconSet.maximize.off.label !== void 0 ? props.iconSet.maximize.off.label : iconSetTemplate.value.maximize.off.label,
                icon: props.iconSet !== void 0 && props.iconSet.maximize !== void 0 && props.iconSet.maximize.off !== void 0 && props.iconSet.maximize.off.icon !== void 0 ? props.iconSet.maximize.off.icon : iconSetTemplate.value.maximize.off.icon,
                action: 'RESTORE'
              }
            },
            minimized: {
              state: false,
                on: {
                //  label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.label !== void 0 ? props.iconSet.minimize.on.label : iconSetTemplate.value.minimize.on.label,
                 // icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.on !== void 0 && props.iconSet.minimize.on.icon !== void 0 ? props.iconSet.minimize.on.icon : iconSetTemplate.value.minimize.on.icon,
                  action: 'MINIMIZE'
                },
                off: {
                 // label: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.label !== void 0 ? props.iconSet.minimize.off.label : iconSetTemplate.value.minimize.off.label,
                //  icon: props.iconSet !== void 0 && props.iconSet.minimize !== void 0 && props.iconSet.minimize.off !== void 0 && props.iconSet.minimize.off.icon !== void 0 ? props.iconSet.minimize.off.icon : iconSetTemplate.value.minimize.off.icon,
                  func: 'RESTORE'
                }
            }
          }
        },
        actions: {
          menu: assign((ctx, evt) => {

            console.log(evt.value)

            evt.value.map(v => console.log(v))

            const menu = evt.value
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
            // if (props.actions.includes('minimize') && (canDo('minimize', true) || canDo('minimize', false))) {
            //   actions.push('maximize')
            // }
            if (menu.includes(MENU_ITEM_CLOSE) && checkActions(MENU_ITEM_CLOSE, true, ctx)) {
              filteredActions.push(MENU_ITEM_VISIBLE)
            }

            const menuData = []
            filteredActions.map(key => {
              if (ctx.actions[ key ]) {
                menuData.push({ ...ctx.actions[ key ], key: key })
              }
            })


            console.warn(menuData)
            return {
              menuData: menuData,
              actions: {
                ...ctx.actions,
                menu: evt.value,

              }
            }
          }),

          lock: assign((ctx, evt) => {
            console.log('lock...');
            return checkEmitAndAssign(MENU_ITEM_EMBEDDED, true, ctx)
          }),
          unlock: assign((ctx, evt) => {
            console.log('unlock...');
            return checkEmitAndAssign(MENU_ITEM_EMBEDDED, false, ctx)
          }),
          show: assign((ctx, evt) => {
            console.log('show...');
            return checkEmitAndAssign(MENU_ITEM_VISIBLE, true, ctx)
          }),
          hide: assign((ctx, evt) => {
            console.log('hide...');
            return checkEmitAndAssign(MENU_ITEM_VISIBLE, false, ctx)
          }),
          pin: assign((ctx, evt) => {
            console.log('pin...');
            return checkEmitAndAssign(MENU_ITEM_PINNED, true, ctx)
          }),
          unpin: assign((ctx, evt) => {
            console.log('unpin...');
            return checkEmitAndAssign(MENU_ITEM_PINNED, false, ctx)
          }),
          maximize: assign((ctx, evt) => {
            console.log('maximize...');
            if (checkActions(MENU_ITEM_MAXIMIZE, true, ctx)) {

              emit('maximize', true)
            }
          }),
          minimize: assign((ctx, evt) => {
            console.log('minimize...');
            // TODO
          }),
          fullscreenLeave:  assign((ctx, evt) => {
            if (checkActions(MENU_ITEM_FULLSCREEN, false, ctx)) {
              AppFullscreen.exit()
                .then(() => {
                  console.log('SUCCESSS')
                })
                .catch(err => {
                  console.error(err)
                })
            }
          }),
          fullScreenEnter:  assign(async (ctx, evt) => {
            if (checkActions(MENU_ITEM_FULLSCREEN, true, ctx)) {
              fullscreenInitiated.value = true
               AppFullscreen.request(windowRef.value)
                .then(() => {
                  console.log('SUCCESSS')
                })
                .catch(err => {
                  console.error(err)
                })
            }
          }),

          restore: assign((ctx, evt) => {
            console.log('restore...');
            if (ctx.action[ MENU_ITEM_VISIBLE ].state) {
              return ctx
            }
            if (ctx.action[ MENU_ITEM_MAXIMIZE ].state) {
              return emitAndAssign(MENU_ITEM_MAXIMIZE, false, ctx)
            } else if (ctx.action[ MENU_ITEM_MINIMIZE ].state) {
              return emitAndAssign(MENU_ITEM_MAXIMIZE, false, ctx)
            }
          }),
        },
      },
    );

    function checkEmitAndAssign(name, state, ctx) {
      if (checkActions(name, state, ctx)) {
        return emitAndAssign(name, state, ctx)
      }
    }

    function emitAndAssign(name, state, ctx) {
      emit(name, state)
      return {
        actions: {
          ...ctx.actions,
          ...ctx.actions[ name ].state = state
        }
      }
    }

    function checkActions(mode, state, ctx) {
      console.log('CHECK  ACTIONS')
      console.log(mode)
      console.log(state)
      console.log(ctx.actions)
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
            if (isActive(MENU_ITEM_MINIMIZE) === true
              && isActive(MENU_ITEM_EMBEDDED) !== true
              && isActive(MENU_ITEM_MAXIMIZE) !== true
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
          }
          else {
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

    console.log(state.value.context)
    console.log(context)


    watchEffect(() => send('UPDATE_MENU_ACTIONS', { value: props.actions }))



    watch(() => $q.fullscreen.isActive,  (val) => {
        if (fullscreenInitiated.value === true) {
          state.value.context.actions.fullscreen.state = val
        }
      })

    watch([ () =>  $q.screen.height,() => $q.screen.width ], ([ height, width ]) => {
      if(state.value.context.actions.fullscreen.state === true) {
        states.value.bottom = height
        states.value.right = width
      }
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
      return state.value.context.actions.visible.state === true ? MENU_ITEM_VISIBLE : 'hidden'
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
      if (state.value.context.actions.minimized.state === true) {
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
        if (state.value.context.actions.maximized.state) {
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
        + (state.value.context.actions.floating.state === true && state.value.context.actions.fullscreen.state !== true ? ' q-window__floating' : '')
        + (state.value.context.actions.fullscreen.state === true ? ' q-window__fullscreen' : '')
        + (isSelected.value === true && state.value.context.actions.embedded.state !== true && state.value.context.actions.fullscreen.state !== true ? ' q-window__selected' : '')
        + (isDragging.value === true ? ' q-window__dragging q-window__touch-action' : '');

      console.log(classStyle)
      return classStyle
    })



    const { renderTitleBar } = useToolbar(props, slots, state, send, __computedZIndex)
    const { renderBody } = useBody(props,slots, computedHeight,computedToolbarHeight, zIndex, state)




    function renderWinbdow() {
      // const menuData = [...computedMenuData.value]
      return h('div', {
        class: [ 'q-window', __classes.value, props.contentClass ],
        style: __style.value,
        to: '#q-app',
        disabled: props.modelValue,
        ref: windowRef
      }, [
        renderTitleBar(),
        renderBody()
      ])
    }

    function render() {
      return h(Teleport, {
        to: 'body',
        disabled: props.modelValue
      }, [renderWinbdow()])
    }


    return () => render()
  }


})


