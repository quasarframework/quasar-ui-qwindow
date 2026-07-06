import {
  h,
  defineComponent,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  nextTick,
  Teleport,
  watch,
  getCurrentInstance,
  type PropType,
  type SlotsType,
} from 'vue'
import type { ComponentInternalInstance } from 'vue'

import { ClosePopup, Scroll, useQuasar, AppFullscreen } from 'quasar'
import useStyle from './composables/useStyle'
import useResize from './composables/useResize'
import useToolbar from './composables/useToolbar'
import useBody from './composables/useBody'
import useWindowGeometry from './composables/useWindowGeometry'
import useWindowInteraction from './composables/useWindowInteraction'
import useWindowRestoreState from './composables/useWindowRestoreState'
import useWindowStack from './composables/useWindowStack'
import useWindowState, {
  ACTION_CLOSE,
  ACTION_EMBEDDED,
  ACTION_FULLSCREEN,
  ACTION_MAXIMIZE,
  ACTION_MINIMIZE,
  ACTION_PINNED,
  ACTION_VISIBLE,
  type QWindowAction,
} from './composables/useWindowState'

type SlotProps<T> = { scope: T }
type QWindowActionMenuItemState = Omit<QWindowActionMenuItem, 'key'>

export interface QWindowActionMenuState {
  /**
   * Menu item label.
   */
  label: string
  /**
   * Quasar icon name.
   */
  icon: string
  /**
   * Function called when the menu item is selected.
   */
  func: () => boolean | void
}

export interface QWindowActionMenuItem {
  /**
   * Action key for the menu item.
   */
  key: string
  /**
   * Current action state.
   */
  state: boolean
  /**
   * Menu data used when the action is enabled.
   */
  on: QWindowActionMenuState
  /**
   * Menu data used when the action is disabled.
   */
  off: QWindowActionMenuState
}

export interface QWindowDefaultSlotScope {
  /**
   * Current z-index for the window body content.
   */
  zIndex: number
}

export interface QWindowTitlebarSlotScope {
  /**
   * Menu items generated for the current action state.
   */
  menuData: QWindowActionMenuItem[]
}

type WindowStyle = Record<string, string | number | undefined>

export interface QWindowPosition {
  /**
   * Current window height.
   */
  height: number
  /**
   * Current window left position.
   */
  left: number
  /**
   * Current horizontal scroll offset used for floating placement.
   */
  scrollX: number
  /**
   * Current vertical scroll offset used for floating placement.
   */
  scrollY: number
  /**
   * Current window top position.
   */
  top: number
  /**
   * Current window width.
   */
  width: number
}

export interface QWindowSlots {
  /**
   * Window body content.
   */
  default?: SlotProps<QWindowDefaultSlotScope>
  /**
   * Custom title bar content.
   */
  titlebar?: SlotProps<QWindowTitlebarSlotScope>
}

function getWindow(): Window | undefined {
  return typeof window === 'undefined' ? undefined : window
}

function getDocument(): Document | undefined {
  return typeof document === 'undefined' ? undefined : document
}

// the starting zIndex for floating windows
const startingZIndex = 4000

// maxZIndex is for fullscreen
// 6000 is $z-fullscreen and $z-menu
const maxZIndex = 6000 - 100

// number of windows registered globally
let QWindowCount = 0

// default starting position
// relative to viewport for floating
// relative to document for scroll-with-window
const defaultX = 20
const defaultY = 20

export const MENU_ITEM_SEPARATOR = 'separator'

const defaultIconSet = {
  [ACTION_VISIBLE]: {
    on: {
      icon: 'close',
      label: 'Show',
    },
    off: {
      icon: 'close',
      label: 'Hide',
    },
  },
  [ACTION_EMBEDDED]: {
    on: {
      icon: 'lock_outline',
      label: 'Embed',
    },
    off: {
      icon: 'lock_open',
      label: 'Float',
    },
  },
  [ACTION_PINNED]: {
    on: {
      icon: 'push_pin',
      label: 'Pin',
    },
    off: {
      icon: 'open_with',
      label: 'Unpin',
    },
  },
  [ACTION_MAXIMIZE]: {
    on: {
      icon: 'arrow_upward',
      label: 'Maximize',
    },
    off: {
      icon: 'restore',
      label: 'Restore',
    },
  },
  [ACTION_FULLSCREEN]: {
    on: {
      icon: 'fullscreen',
      label: 'Enter fullscreen',
    },
    off: {
      icon: 'fullscreen_exit',
      label: 'Leave fullscreen',
    },
  },
  [ACTION_MINIMIZE]: {
    on: {
      icon: 'arrow_downward',
      label: 'Minimize',
    },
    off: {
      icon: 'restore',
      label: 'Restore',
    },
  },
}

export default defineComponent({
  name: 'QWindow',
  directives: {
    ClosePopup,
    Scroll,
  },
  slots: Object as SlotsType<QWindowSlots>,
  props: {
    /**
     * `v-model`; controls visibility of the window.
     *
     * @category model
     */
    modelValue: Boolean,
    /**
     * Text shown in the title bar.
     *
     * @category titlebar
     */
    title: String,
    /**
     * Uses a shorter title bar.
     *
     * @category titlebar
     */
    dense: Boolean,
    /**
     * Renders the window in place instead of floating it through Teleport.
     *
     * @category state
     */
    embedded: Boolean,
    /**
     * Prevents the floating window from moving or resizing.
     *
     * @category state
     */
    pinned: Boolean,
    /**
     * Starts the window in fullscreen mode.
     *
     * @category state
     */
    fullscreen: Boolean,
    /**
     * Starts the window maximized.
     *
     * @category state
     */
    maximized: Boolean,
    /**
     * Starts the window minimized.
     *
     * @category state
     */
    minimized: Boolean,
    /**
     * Hides the title bar actions menu.
     *
     * @category titlebar
     */
    noMenu: Boolean,
    /**
     * Icon used by the built-in title bar actions menu button.
     *
     * @category titlebar
     * @default "more_vert"
     * @example menu-icon="more_horiz"
     */
    menuIcon: {
      type: String,
      default: 'more_vert',
    },
    /**
     * Disables dragging by the title bar.
     *
     * @category behavior
     */
    noMove: Boolean,
    /**
     * Disables resize handles.
     *
     * @category behavior
     */
    noResize: Boolean,
    /**
     * List of resize handles to enable.
     *
     * @category behavior
     * @tsType string[]
     * @example :resizable="['top', 'right', 'bottom', 'left']"
     */
    resizable: {
      type: Array as PropType<string[]>,
      default: () => [
        'top',
        'left',
        'right',
        'bottom',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ],
    },
    /**
     * Keeps the floating position tied to document scroll.
     *
     * @category behavior
     */
    scrollWithWindow: {
      type: Boolean,
      default: false,
    },
    /**
     * Automatically pins the window when its state requires it.
     *
     * @category behavior
     */
    autoPin: Boolean,

    /**
     * Puts the window into a disabled visual state.
     *
     * @category state
     */
    disabled: Boolean,
    /**
     * Accessible label for the window shell. Falls back to `title` when omitted.
     *
     * @category accessibility
     */
    ariaLabel: String,
    /**
     * ARIA role applied to the window shell.
     *
     * @category accessibility
     * @default "region"
     * @values region | dialog | complementary | application
     */
    ariaRole: {
      type: String,
      default: 'region',
    },
    /**
     * Hides the divider under the title bar.
     *
     * @category titlebar
     */
    hideToolbarDivider: Boolean,
    /**
     * Hides visible resize grippers and uses invisible resize handles.
     *
     * @category appearance
     */
    hideGrippers: Boolean,
    /**
     * Rounds visible resize grippers.
     *
     * @category appearance
     */
    roundGrippers: Boolean,
    /**
     * Hides the title bar.
     *
     * @category titlebar
     */
    headless: Boolean,
    /**
     * Overrides the menu action labels and icons.
     *
     * @category titlebar
     */
    iconSet: Object,
    /**
     * CSS text color for the window.
     *
     * @category appearance
     */
    color: {
      type: String,
      default: '#000000',
    },
    /**
     * CSS background color for the window.
     *
     * @category appearance
     */
    backgroundColor: {
      type: String,
    },
    /**
     * CSS border color for resize grippers.
     *
     * @category appearance
     */
    gripperBorderColor: {
      type: String,
    },
    /**
     * CSS background color for resize grippers.
     *
     * @category appearance
     */
    gripperBackgroundColor: {
      type: String,
    },
    /**
     * CSS border width for the window.
     *
     * @category appearance
     */
    borderWidth: {
      type: String,
      default: '1px',
    },
    /**
     * CSS border style for the window.
     *
     * @category appearance
     */
    borderStyle: {
      type: String,
      default: 'solid',
    },

    /**
     * Initial left position for floating windows.
     *
     * @category position
     */
    startX: [Number, String],
    /**
     * Initial top position for floating windows.
     *
     * @category position
     */
    startY: [Number, String],
    /**
     * Initial window width.
     *
     * @category position
     */
    width: {
      type: [Number, String],
      default: 400,
    },
    /**
     * Initial window height.
     *
     * @category position
     */
    height: {
      type: [Number, String],
      default: 400,
    },
    /**
     * Menu actions shown in the title bar.
     *
     * @category titlebar
     * @tsType string[]
     * @values pinned | embedded | minimize | maximize | close | fullscreen
     * @example :actions="['pinned', 'fullscreen', 'close']"
     */
    actions: {
      type: Array as PropType<string[]>,
      default: () => [ACTION_PINNED, ACTION_EMBEDDED, ACTION_CLOSE],
      validator: (v: unknown) =>
        Array.isArray(v) &&
        v.some(
          (action: unknown) =>
            typeof action === 'string' &&
            [
              ACTION_PINNED,
              ACTION_EMBEDDED,
              ACTION_MINIMIZE,
              ACTION_MAXIMIZE,
              ACTION_CLOSE,
              ACTION_FULLSCREEN,
            ].includes(action),
        ),
    },
    /**
     * Receives and may mutate the generated menu item list before rendering.
     *
     * @category titlebar
     * @tsType (menuData: QWindowActionMenuItem[]) => void
     */
    menuFunc: Function as PropType<(menuData: QWindowActionMenuItem[]) => void>,
    /**
     * Style applied to the title bar.
     *
     * @category titlebar
     */
    titlebarStyle: [String, Object, Array],
    /**
     * Class applied to the title bar.
     *
     * @category titlebar
     */
    titlebarClass: [String, Object, Array],
    /**
     * Class applied to the outer window.
     *
     * @category appearance
     */
    contentClass: [String, Object, Array],
    /**
     * Style applied to the outer window.
     *
     * @category appearance
     */
    contentStyle: [String, Object, Array],
  },

  emits: [
    /**
     * Emitted when selected state changes.
     *
     * @param value New selected state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'selected',
    /**
     * Legacy visible-state event kept for compatibility.
     *
     * @param value New visible state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'input',
    /**
     * Emitted when the visible state changes.
     *
     * @param value New visible state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'update:modelValue',
    /**
     * Emitted when fullscreen state changes.
     *
     * @param value New fullscreen state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'fullscreen',
    /**
     * Emitted when fullscreen state changes for `v-model:fullscreen`.
     *
     * @param value New fullscreen state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'update:fullscreen',
    /**
     * Emitted when embedded mode changes.
     *
     * @param value New embedded state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'embedded',
    /**
     * Emitted when embedded mode changes for `v-model:embedded`.
     *
     * @param value New embedded state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'update:embedded',
    /**
     * Emitted when pinned mode changes.
     *
     * @param value New pinned state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'pinned',
    /**
     * Emitted when pinned mode changes for `v-model:pinned`.
     *
     * @param value New pinned state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'update:pinned',
    /**
     * Emitted when maximized state changes.
     *
     * @param value New maximized state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'maximize',
    /**
     * Emitted when maximized state changes for `v-model:maximized`.
     *
     * @param value New maximized state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'update:maximized',
    /**
     * Emitted when minimized state changes.
     *
     * @param value New minimized state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'minimize',
    /**
     * Emitted when minimized state changes for `v-model:minimized`.
     *
     * @param value New minimized state.
     * @param-type value Boolean
     * @param-ts-type value boolean
     */
    'update:minimized',
    /**
     * Emitted after the window moves, resizes, or restores position.
     *
     * @param position Window position payload with left, top, width, height, scrollX, and scrollY.
     * @param-type position Object
     * @param-ts-type position QWindowPosition
     */
    'position',
    /**
     * Emitted when an active drag or resize interaction is canceled.
     *
     * @param position Restored window position payload.
     * @param-type position Object
     * @param-ts-type position QWindowPosition
     */
    'canceled',
    /**
     * Emitted before a drag or resize interaction starts.
     *
     * @param evt Pointer event that started the drag.
     * @param-type evt Event
     * @param-ts-type evt MouseEvent | TouchEvent
     */
    'beforeDrag',
    /**
     * Emitted after a drag or resize interaction finishes.
     *
     * @param evt Pointer event that finished the drag.
     * @param-type evt Event
     * @param-ts-type evt MouseEvent | TouchEvent
     */
    'afterDrag',
    /**
     * Emitted when the window becomes visible.
     */
    'show',
    /**
     * Emitted when the window becomes hidden.
     */
    'hide',
  ],
  setup(props, { slots, emit, expose }) {
    const {
      checkActionState,
      computedVisibility,
      emitVisibilityLifecycle,
      getActionState,
      getAvailableActions,
      isEmbedded,
      isFullscreen,
      isMaximized,
      isMinimized,
      isPinned,
      isVisible,
      setActionState,
      syncActionState,
    } = useWindowState(emit)

    function getIconSetValue(
      action: keyof typeof defaultIconSet,
      mode: 'on' | 'off',
      field: 'label' | 'icon',
    ) {
      const customIconSet = props.iconSet as
        | Record<string, Partial<Record<'on' | 'off', Partial<Record<'label' | 'icon', string>>>>>
        | undefined

      return customIconSet?.[action]?.[mode]?.[field] ?? defaultIconSet[action][mode][field]
    }

    function createActionMenuItem(
      action: keyof typeof defaultIconSet,
      state: boolean,
      onFunc: () => boolean | void,
      offFunc: () => boolean | void,
    ): QWindowActionMenuItemState {
      return {
        state,
        on: {
          label: getIconSetValue(action, 'on', 'label'),
          icon: getIconSetValue(action, 'on', 'icon'),
          func: onFunc,
        },
        off: {
          label: getIconSetValue(action, 'off', 'label'),
          icon: getIconSetValue(action, 'off', 'icon'),
          func: offFunc,
        },
      }
    }

    const actionItems = computed<Record<string, QWindowActionMenuItemState>>(() => ({
      [ACTION_VISIBLE]: createActionMenuItem(ACTION_VISIBLE, isVisible.value, show, hide),
      [ACTION_EMBEDDED]: createActionMenuItem(ACTION_EMBEDDED, isEmbedded.value, lock, unlock),
      [ACTION_PINNED]: createActionMenuItem(ACTION_PINNED, isPinned.value, pin, unpin),
      [ACTION_FULLSCREEN]: createActionMenuItem(
        ACTION_FULLSCREEN,
        isFullscreen.value,
        fullscreenEnter,
        fullscreenLeave,
      ),
      [ACTION_MAXIMIZE]: createActionMenuItem(
        ACTION_MAXIMIZE,
        isMaximized.value,
        maximize,
        restore,
      ),
      [ACTION_MINIMIZE]: createActionMenuItem(
        ACTION_MINIMIZE,
        isMinimized.value,
        minimize,
        restore,
      ),
    }))

    const {
      computedHeight,
      computedPosition,
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
    } = useWindowGeometry(props)

    QWindowCount = QWindowCount + 1
    const $q = useQuasar()
    const windowRef = ref<HTMLElement | null>(null)
    const { bringToFront, clearSelected, selected, setSelected, setZIndex, zIndex } =
      useWindowStack(startingZIndex)
    const { fullscreenRestoreState, restorePositionAndState, savePositionAndState } =
      useWindowRestoreState({
        states,
        startingZIndex,
        getZIndex: () => computedZIndex.value,
        setZIndex,
        getActionState,
        setActionState,
      })
    const resizeHandle = ref<string>()
    const fullscreenInitiated = ref(false)
    const teleportTarget = ref('#q-app')

    const { removeClass, addClass } = useStyle()
    const instance = getCurrentInstance() as ComponentInternalInstance | null
    const _this = instance?.proxy

    onMounted(() => {
      // Initialize before first visible positioning so windows opened on scrolled pages do not
      // wait for a scroll event before aligning with the viewport.
      onScroll()
      initializePosition(QWindowCount, defaultX, defaultY)

      if (props.modelValue !== void 0) {
        if (props.modelValue === true) {
          syncActionState(ACTION_VISIBLE, true)
        } else {
          syncActionState(ACTION_VISIBLE, false)
        }
      }
      if (props.embedded !== void 0) {
        if (props.embedded === true) {
          syncActionState(ACTION_EMBEDDED, true)
        } else {
          syncActionState(ACTION_EMBEDDED, false)
        }
      }
      if (props.pinned !== void 0) {
        if (props.pinned === true) {
          if (checkActionState(ACTION_PINNED, true)) {
            syncActionState(ACTION_PINNED, true)
          }
        } else {
          if (checkActionState(ACTION_PINNED, false)) {
            syncActionState(ACTION_PINNED, false)
          }
        }
      }
      if (props.fullscreen !== void 0) {
        if (props.fullscreen === true) {
          fullscreenEnter()
        }
      }
      if (props.maximized !== void 0) {
        if (props.maximized === true && getActionState(ACTION_VISIBLE) !== true) {
          syncActionState(ACTION_MAXIMIZE, true)
        } else {
          syncActionState(ACTION_MAXIMIZE, false)
        }
      }
      if (props.minimized !== void 0) {
        if (props.minimized === true && getActionState(ACTION_FULLSCREEN) !== true) {
          syncActionState(ACTION_MINIMIZE, true)
        } else {
          syncActionState(ACTION_MINIMIZE, false)
        }
      }

      const doc = getDocument()
      if (doc !== void 0) {
        teleportTarget.value = doc.querySelector('#q-app') === null ? 'body' : '#q-app'
        doc.addEventListener('scroll', onScroll, { passive: true })
        doc.body.addEventListener('mousedown', onMouseDownBody, { passive: false })
      }
    })

    onBeforeUnmount(() => {
      const doc = getDocument()
      if (doc !== void 0) {
        doc.removeEventListener('scroll', onScroll)
        doc.body.removeEventListener('mousedown', onMouseDownBody)
        removeClass(doc.body, 'q-window__touch-action')
      }

      removeEventListeners()
    })

    /**
     * Shows the window.
     *
     * @returns True when the window visibility changed.
     * @example windowRef.value?.show()
     */
    function show(): boolean {
      if (checkActionState(ACTION_VISIBLE, true)) {
        setActionState(ACTION_VISIBLE, true)
        return true
      }
      return false
    }

    /**
     * Hides the window.
     *
     * @returns True when the window visibility changed.
     * @example windowRef.value?.hide()
     */
    function hide(): boolean {
      if (checkActionState(ACTION_VISIBLE, false)) {
        setActionState(ACTION_VISIBLE, false)
        return true
      }
      return false
    }

    // embedded
    function lock(): boolean {
      if (checkActionState(ACTION_EMBEDDED, true)) {
        setActionState(ACTION_EMBEDDED, true)
        return true
      }
      return false
    }

    // floating
    function unlock(): boolean {
      if (checkActionState(ACTION_EMBEDDED, false)) {
        setActionState(ACTION_EMBEDDED, false)
        return true
      }
      return false
    }

    /**
     * Embeds the window back into the page layout.
     *
     * @returns True when embedded mode changed.
     * @example windowRef.value?.embed()
     */
    function embed(): boolean {
      return lock()
    }

    /**
     * Floats the window through Teleport so it can move and resize.
     *
     * @returns True when embedded mode changed.
     * @example windowRef.value?.float()
     */
    function float(): boolean {
      return unlock()
    }

    /**
     * Toggles between embedded and floating modes.
     *
     * @returns True when embedded mode changed.
     * @example windowRef.value?.toggleEmbedded()
     */
    function toggleEmbedded(): boolean {
      return getActionState(ACTION_EMBEDDED) === true ? float() : embed()
    }

    // pinned (can't move or re-size)
    /**
     * Pins the window so it cannot move or resize.
     *
     * @returns True when pinned mode changed.
     * @example windowRef.value?.pin()
     */
    function pin(): boolean {
      if (checkActionState(ACTION_PINNED, true)) {
        setActionState(ACTION_PINNED, true)
        return true
      }
      return false
    }

    // move and resize available, if not embedded
    /**
     * Unpins the window so it can move and resize again.
     *
     * @returns True when pinned mode changed.
     * @example windowRef.value?.unpin()
     */
    function unpin(): boolean {
      if (checkActionState(ACTION_PINNED, false)) {
        setActionState(ACTION_PINNED, false)
        return true
      }
      return false
    }

    /**
     * Toggles pinned mode.
     *
     * @returns True when pinned mode changed.
     * @example windowRef.value?.togglePinned()
     */
    function togglePinned(): boolean {
      return getActionState(ACTION_PINNED) === true ? unpin() : pin()
    }

    /**
     * Maximizes the window.
     *
     * @returns True when maximized mode changed.
     * @example windowRef.value?.maximize()
     */
    function maximize(): boolean {
      if (checkActionState(ACTION_MAXIMIZE, true)) {
        bringToFront()
        savePositionAndState()
        setFullWindowPosition($q.screen.width, $q.screen.height)

        setActionState(ACTION_EMBEDDED, false)
        setActionState(ACTION_MAXIMIZE, true)
        return true
      }
      return false
    }

    /**
     * Minimizes the window.
     *
     * @returns True when minimized mode changed.
     * @example windowRef.value?.minimize()
     */
    function minimize(): boolean {
      if (checkActionState(ACTION_MINIMIZE, true)) {
        savePositionAndState()
        setMinimizePosition()

        setActionState(ACTION_EMBEDDED, true)
        setActionState(ACTION_MINIMIZE, true)
        return true
      }
      return false
    }

    /**
     * Restores a maximized or minimized window.
     *
     * @returns True when the window restored from maximized or minimized mode.
     * @example windowRef.value?.restore()
     */
    function restore(): boolean {
      if (getActionState(ACTION_VISIBLE) !== true) {
        // not allowed
        return false
      }
      if (getActionState(ACTION_MAXIMIZE) === true) {
        setActionState(ACTION_MAXIMIZE, false)
        return true
      } else if (getActionState(ACTION_MINIMIZE) === true) {
        setActionState(ACTION_MINIMIZE, false)
        return true
      }
      return false
    }

    /**
     * Toggles maximized mode.
     *
     * @returns True when maximized mode changed.
     * @example windowRef.value?.toggleMaximized()
     */
    function toggleMaximized(): boolean {
      return getActionState(ACTION_MAXIMIZE) === true ? restore() : maximize()
    }

    /**
     * Toggles minimized mode.
     *
     * @returns True when minimized mode changed.
     * @example windowRef.value?.toggleMinimized()
     */
    function toggleMinimized(): boolean {
      return getActionState(ACTION_MINIMIZE) === true ? restore() : minimize()
    }

    /**
     * Requests browser fullscreen for the window.
     *
     * @returns True when fullscreen mode was requested.
     * @example windowRef.value?.enterFullscreen()
     */
    function enterFullscreen(): boolean {
      return fullscreenEnter()
    }

    /**
     * Leaves browser fullscreen for the window.
     *
     * @returns True when fullscreen exit was requested.
     * @example windowRef.value?.leaveFullscreen()
     */
    function leaveFullscreen(): boolean {
      return fullscreenLeave()
    }

    /**
     * Toggles browser fullscreen mode.
     *
     * @returns True when fullscreen mode changed or was requested.
     * @example windowRef.value?.toggleFullscreen()
     */
    function toggleFullscreen(): boolean {
      return getActionState(ACTION_FULLSCREEN) === true ? leaveFullscreen() : enterFullscreen()
    }

    /**
     * Returns the current window position and dimensions.
     *
     * @returns Current window position and dimensions.
     * @example const position = windowRef.value?.getPosition()
     */
    function getPosition(): QWindowPosition {
      return { ...computedPosition.value }
    }

    function fullscreenEnter(): boolean {
      if (checkActionState(ACTION_FULLSCREEN, true)) {
        fullscreenInitiated.value = true
        AppFullscreen.request(windowRef.value ?? undefined)
        return true
      }
      return false
    }

    // leave fullscreen mode
    function fullscreenLeave(): boolean {
      if (checkActionState(ACTION_FULLSCREEN, false)) {
        AppFullscreen.exit()
        return true
      }
      return false
    }

    function emitPosition() {
      emit('position', computedPosition.value)
    }

    watch(
      () => props.modelValue,
      (val) => {
        if (syncActionState(ACTION_VISIBLE, val) === true) {
          emitVisibilityLifecycle(val)
        }
      },
    )

    watch(
      () => props.embedded,
      (val) => {
        if (val === true) {
          embed()
        } else {
          float()
        }
      },
    )

    watch(
      () => props.pinned,
      (val) => {
        if (val === true) {
          pin()
        } else {
          unpin()
        }
      },
    )

    watch(
      () => props.fullscreen,
      (val) => {
        if (val === true) {
          enterFullscreen()
        } else {
          leaveFullscreen()
        }
      },
    )

    watch(
      () => props.maximized,
      (val) => {
        if (val === true) {
          maximize()
        } else if (getActionState(ACTION_MAXIMIZE) === true) {
          restore()
        }
      },
    )

    watch(
      () => props.minimized,
      (val) => {
        if (val === true) {
          minimize()
        } else if (getActionState(ACTION_MINIMIZE) === true) {
          restore()
        }
      },
    )

    watch(selected, (val) => {
      if (props.autoPin === true) {
        if (val === true) {
          pin()
        } else {
          unpin()
        }
      }

      emit('selected', val)
    })

    function onScroll() {
      updateScroll(getWindow())
    }

    function canBeSelected(_x: number, _y: number): boolean {
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
      return true
    }

    function selectWindow(x: number, y: number): boolean {
      const canSelect = canBeSelected(x, y)
      setSelected(canSelect)
      if (canSelect === true) {
        bringToFront()
      }
      return canSelect
    }

    watch(
      () => getActionState(ACTION_MAXIMIZE),
      (val, oldVal) => {
        if (oldVal === void 0) {
          // during initialization
          return
        }
        if (val === false) {
          restorePositionAndState()
          nextTick(emitPosition)
        }
      },
    )

    watch(
      () => getActionState(ACTION_MINIMIZE),
      (val, oldVal) => {
        if (oldVal === void 0) {
          // during initialization
          return
        }
        if (val === false) {
          restorePositionAndState()
          nextTick(emitPosition)
        }
      },
    )

    watch(
      () => getActionState(ACTION_FULLSCREEN),
      (val, oldVal) => {
        if (oldVal === void 0) {
          return
        }
        if (val === true) {
          savePositionAndState(fullscreenRestoreState.value)
          setZIndex(maxZIndex)
        } else {
          restorePositionAndState(fullscreenRestoreState.value)
          fullscreenInitiated.value = val
          nextTick(emitPosition)
        }
      },
    )

    watch(
      () => AppFullscreen.isActive,
      (val) => {
        if (fullscreenInitiated.value === true) {
          setActionState(ACTION_FULLSCREEN, val)
        }
      },
    )

    watch(
      () => $q.screen.height,
      (val) => {
        if (isFullscreen.value === true) {
          states.value.bottom = val
          nextTick(emitPosition)
        }
      },
    )
    watch(
      () => $q.screen.width,
      (val) => {
        if (isFullscreen.value === true) {
          states.value.right = val
          nextTick(emitPosition)
        }
      },
    )
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
      return (
        isVisible.value === true &&
        isEmbedded.value !== true &&
        isPinned.value !== true &&
        isFullscreen.value !== true &&
        isMaximized.value !== true &&
        isMinimized.value !== true
      )
    }

    const {
      onMouseDown,
      onMouseDownBody,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      removeEventListeners,
    } = useWindowInteraction({
      addClass,
      clearSelected,
      computedHeight,
      computedPosition,
      computedWidth,
      emitAfterDrag: (evt) => emit('afterDrag', evt),
      emitBeforeDrag: (evt) => emit('beforeDrag', evt),
      emitCanceled: (position) => emit('canceled', position),
      emitPosition,
      isEmbedded,
      isDragging,
      mousePos,
      props,
      removeClass,
      resizeHandle,
      scrollX,
      scrollY,
      selectWindow,
      shiftX,
      shiftY,
      states,
      statesTmp,
      windowRef,
    })

    function onTitlebarDoubleClick(evt: MouseEvent) {
      const target = evt.target

      if (isTitlebarInteractiveTarget(target) === true) {
        return
      }

      if (
        isVisible.value === true &&
        isEmbedded.value !== true &&
        isFullscreen.value !== true &&
        isMinimized.value !== true
      ) {
        toggleMaximized()
      }
    }

    function isTitlebarInteractiveTarget(target: EventTarget | null) {
      return (
        target instanceof HTMLElement &&
        target.closest('a, button, input, select, textarea, [role="button"]') !== null
      )
    }

    function onTitlebarMouseDown(evt: MouseEvent) {
      if (isTitlebarInteractiveTarget(evt.target) !== true) {
        onMouseDown(evt, 'titlebar')
      }
    }

    function onTitlebarTouchStart(evt: TouchEvent) {
      if (isTitlebarInteractiveTarget(evt.target) !== true) {
        onTouchStart(evt, 'titlebar')
      }
    }

    function onWindowKeydown(evt: KeyboardEvent) {
      if (evt.defaultPrevented === true || evt.key !== 'Escape') {
        return
      }

      if (isFullscreen.value === true) {
        leaveFullscreen()
        evt.preventDefault()
      } else if (isMaximized.value === true || isMinimized.value === true) {
        restore()
        evt.preventDefault()
      }
    }

    const computedToolbarHeight = computed(() => {
      return props.headless === true ? 0 : props.dense === true ? 28 : 40
    })

    const computedZIndex = computed(() => {
      let extra = 0
      if (isDragging.value) extra = 100
      return zIndex.value + extra
    })

    const computedActions = computed<QWindowAction[]>(() => getAvailableActions(props.actions))

    const computedMenuData = computed(() => {
      // get stateInfo for each menu item
      const menuData: QWindowActionMenuItem[] = []
      computedActions.value.map((key) => {
        if (actionItems.value[key]) {
          menuData.push({ ...actionItems.value[key], key: key })
        }
      })
      return menuData
    })

    const __style = computed(() => {
      let style: WindowStyle
      if (isMinimized.value === true) {
        style = {
          position: 'relative',
          visibility: computedVisibility.value,
          height: computedToolbarHeight.value + 'px',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: props.color,
          backgroundColor: props.backgroundColor,
          minWidth: '100px',
        }
      } else if (isEmbedded.value === true) {
        style = {
          position: 'relative',
          visibility: computedVisibility.value,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          width: '100%',
          height: '100%',
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
          visibility: computedVisibility.value,
          minWidth: '90px',
          minHeight: '50px',
          top: top + 'px',
          left: left + 'px',
          zIndex: computedZIndex.value,
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
          style = {
            ...style,
            ...(props.contentStyle as Record<string, string | number | undefined>),
          }
        } else if (type === '[object Array]') {
          ;(props.contentStyle as Array<Record<string, string | number | undefined>>).forEach(
            (item) => {
              style = { ...style, ...item }
            },
          )
        } else if (typeof props.contentStyle === 'string') {
          const items = props.contentStyle.split(';')
          items.forEach((item) => {
            const [key, value] = item.split(':')
            if (key !== void 0 && value !== void 0) {
              style[key.trim()] = value.trim()
            }
          })
        }
      }
      return style
    })

    const __classes = computed(() => {
      return (
        '' +
        (isEnabled.value === true ? ' q-focusable q-hoverable' : ' disabled') +
        (isEmbedded.value !== true && isFullscreen.value !== true ? ' q-window__floating' : '') +
        (isFullscreen.value === true ? ' q-window__fullscreen' : '') +
        (isSelected.value === true && isEmbedded.value !== true && isFullscreen.value !== true
          ? ' q-window__selected'
          : '') +
        (isDragging.value === true ? ' q-window__dragging q-window__touch-action' : '')
      )
    })
    //
    const { renderGrippers, renderResizeHandles, renderResizeHandle } = useResize(
      props,
      slots,
      computedHeight,
      computedToolbarHeight,
      zIndex,
      canDrag,
      computedWidth,
      onMouseDown,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    )

    const { renderTitleBar } = useToolbar(
      props,
      slots,
      computedZIndex,
      canDrag,
      isDragging,
      isEmbedded,
      isMinimized,
      computedMenuData,
      onTitlebarDoubleClick,
      onTitlebarMouseDown,
      onTitlebarTouchStart,
    )

    // expose public methods
    expose({
      show,
      hide,
      embed,
      float,
      toggleEmbedded,
      pin,
      unpin,
      togglePinned,
      maximize,
      minimize,
      restore,
      toggleMaximized,
      toggleMinimized,
      enterFullscreen,
      leaveFullscreen,
      toggleFullscreen,
      getPosition,
    })

    const { renderBody } = useBody(
      props,
      slots,
      computedHeight,
      computedToolbarHeight,
      zIndex,
      canDrag,
      isEmbedded,
      isFullscreen,
      renderResizeHandle,
    )

    function renderWindow() {
      const r = h(
        'div',
        {
          class: ['q-window', __classes.value, props.contentClass],
          style: __style.value,
          ref: windowRef,
          role: props.ariaRole,
          tabindex: isEnabled.value === true ? 0 : -1,
          'aria-label': props.ariaLabel ?? props.title ?? 'QWindow',
          'aria-disabled': isEnabled.value === true ? void 0 : 'true',
          onKeydown: onWindowKeydown,
        },
        [
          canDrag() === true && [...renderResizeHandles()],
          canDrag() === true && [...renderGrippers()],
          renderTitleBar(),
          isMinimized.value !== true && renderBody(),
        ],
      )
      return r
    }

    function render() {
      return h(
        Teleport,
        {
          to: teleportTarget.value,
          disabled: isEmbedded.value || getDocument() === void 0,
        },
        [renderWindow()],
      )
    }

    return () => render()
  },
})
