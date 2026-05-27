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
} from "vue";
import type { ComponentInternalInstance } from "vue";

import { ClosePopup, Scroll, useQuasar, AppFullscreen } from "quasar";
import useStyle from "./composables/useStyle";
import useResize from "./composables/useResize";
import useToolbar from "./composables/useToolbar";
import useBody from "./composables/useBody";

type PointerLikeEvent = MouseEvent | TouchEvent;
type QWindowAction = string;

type ActionItem = {
  state: boolean;
  on: {
    label: string;
    icon: string;
    func: () => boolean | void;
  };
  off: {
    label: string;
    icon: string;
    func: () => boolean | void;
  };
};

type ActionStateMap = Record<string, ActionItem>;
type WindowStyle = Record<string, string | number | undefined>;
type QWindowPosition = {
  height: number;
  left: number;
  scrollX: number;
  scrollY: number;
  top: number;
  width: number;
};

function toNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function prevent(e: Event): void {
  e.preventDefault();
}

function stopAndPrevent(e: Event): void {
  e.stopPropagation();
  e.preventDefault();
}

function getWindow(): Window | undefined {
  return typeof window === "undefined" ? undefined : window;
}

function getDocument(): Document | undefined {
  return typeof document === "undefined" ? undefined : document;
}

// the starting zIndex for floating windows
const startingZIndex = 4000;

// maxZIndex is for fullscreen
// 6000 is $z-fullscreen and $z-menu
const maxZIndex = 6000 - 100;

// number of windows registered globally
let QWindowCount = 0;

// default starting position
// relative to viewport for floating
// relative to document for scroll-with-window
const defaultX = 20;
const defaultY = 20;

function getTouchPoint(e: TouchEvent): Touch | undefined {
  return e.touches[0] ?? e.changedTouches[0] ?? e.targetTouches[0];
}

const getMousePosition = function (e: PointerLikeEvent, type = "x") {
  if ("touches" in e) {
    const touch = getTouchPoint(e);
    if (touch === void 0) {
      return 0;
    }

    if (type === "x") {
      return touch.pageX;
    }
    return touch.pageY;
  } else {
    if (type === "x") {
      return e.pageX;
    }
    return e.pageY;
  }
};
const getMouseShift = function (e: PointerLikeEvent, rect: DOMRect, type = "x") {
  if ("touches" in e) {
    const touch = getTouchPoint(e);
    if (touch === void 0) {
      return 0;
    }

    if (type === "x") {
      return touch.clientX - rect.left;
    }
    return touch.clientY - rect.top;
  } else {
    if (type === "x") {
      return e.clientX - rect.left;
    }
    return e.clientY - rect.top;
  }
};

const ACTION_HIDDEN = "hidden";
const ACTION_VISIBLE = "visible";
const ACTION_EMBEDDED = "embedded";
const ACTION_FULLSCREEN = "fullscreen";
const ACTION_PINNED = "pinned";
const ACTION_MAXIMIZE = "maximize";
const ACTION_MINIMIZE = "minimize";
const ACTION_CLOSE = "close";
export const MENU_ITEM_SEPARATOR = "separator";

export default defineComponent({
  name: "QWindow",
  directives: {
    ClosePopup,
    Scroll,
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
        "top",
        "left",
        "right",
        "bottom",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
    },
    scrollWithWindow: {
      type: Boolean,
      default: false,
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
      default: "#000000",
    },
    backgroundColor: {
      type: String,
    },
    gripperBorderColor: {
      type: String,
    },
    gripperBackgroundColor: {
      type: String,
    },
    borderWidth: {
      type: String,
      default: "1px",
    },
    borderStyle: {
      type: String,
      default: "solid",
    },

    startX: [Number, String],
    startY: [Number, String],
    width: {
      type: [Number, String],
      default: 400,
    },
    height: {
      type: [Number, String],
      default: 400,
    },
    actions: {
      type: Array,
      default: () => [ACTION_PINNED, ACTION_EMBEDDED, ACTION_CLOSE],
      validator: (v: unknown) =>
        Array.isArray(v) &&
        v.some(
          (action: unknown) =>
            typeof action === "string" &&
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
    menuFunc: Function,
    titlebarStyle: [String, Object, Array],
    titlebarClass: [String, Object, Array],
    contentClass: [String, Object, Array],
    contentStyle: [String, Object, Array],
  },

  emits: [
    "selected",
    "input",
    "update:modelValue",
    "fullscreen",
    "embedded",
    "pinned",
    "maximize",
    "minimize",
    "position",
    "canceled",
    "beforeDrag",
    "afterDrag",
    "show",
    "hide",
  ],
  setup(props, { slots, emit }) {
    const iconSetTemplate = ref({
      visible: {
        on: {
          icon: "close",
          label: "Show",
        },
        off: {
          icon: "close",
          label: "Hide",
        },
      },
      embedded: {
        on: {
          icon: "lock_outline",
          label: "Embed",
        },
        off: {
          icon: "lock_open",
          label: "Float",
        },
      },
      pinned: {
        on: {
          icon: "location_searching",
          label: "Pin",
        },
        off: {
          icon: "gps_fixed",
          label: "Unpin",
        },
      },
      maximize: {
        on: {
          icon: "arrow_upward",
          label: "Maximize",
        },
        off: {
          icon: "restore",
          label: "Restore",
        },
      },
      fullscreen: {
        on: {
          icon: "fullscreen",
          label: "Enter fullscreen",
        },
        off: {
          icon: "fullscreen_exit",
          label: "Leave fullscreen",
        },
      },
      minimize: {
        on: {
          icon: "arrow_downward",
          label: "Minimize",
        },
        off: {
          icon: "restore",
          label: "Restore",
        },
      },
    });

    const actionItems = ref<ActionStateMap>({
      visible: {
        state: true,
        on: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.visible !== void 0 &&
            props.iconSet.visible.on !== void 0 &&
            props.iconSet.visible.on.label !== void 0
              ? props.iconSet.visible.on.label
              : iconSetTemplate.value.visible.on.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.visible !== void 0 &&
            props.iconSet.visible.on !== void 0 &&
            props.iconSet.visible.on.icon !== void 0
              ? props.iconSet.visible.on.icon
              : iconSetTemplate.value.visible.on.icon,
          func: show,
        },
        off: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.visible !== void 0 &&
            props.iconSet.visible.off !== void 0 &&
            props.iconSet.visible.off.label !== void 0
              ? props.iconSet.visible.off.label
              : iconSetTemplate.value.visible.off.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.visible !== void 0 &&
            props.iconSet.visible.off !== void 0 &&
            props.iconSet.visible.off.icon !== void 0
              ? props.iconSet.visible.off.icon
              : iconSetTemplate.value.visible.off.icon,
          func: hide,
        },
      },
      embedded: {
        state: true,
        on: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.embedded !== void 0 &&
            props.iconSet.embedded.on !== void 0 &&
            props.iconSet.embedded.on.label !== void 0
              ? props.iconSet.embedded.on.label
              : iconSetTemplate.value.embedded.on.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.embedded !== void 0 &&
            props.iconSet.embedded.on !== void 0 &&
            props.iconSet.embedded.on.icon !== void 0
              ? props.iconSet.embedded.on.icon
              : iconSetTemplate.value.embedded.on.icon,
          func: lock,
        },
        off: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.embedded !== void 0 &&
            props.iconSet.embedded.off !== void 0 &&
            props.iconSet.embedded.off.label !== void 0
              ? props.iconSet.embedded.off.label
              : iconSetTemplate.value.embedded.off.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.embedded !== void 0 &&
            props.iconSet.embedded.off !== void 0 &&
            props.iconSet.embedded.off.icon !== void 0
              ? props.iconSet.embedded.off.icon
              : iconSetTemplate.value.embedded.off.icon,
          func: unlock,
        },
      },
      pinned: {
        state: false,
        on: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.pinned !== void 0 &&
            props.iconSet.pinned.on !== void 0 &&
            props.iconSet.pinned.on.label !== void 0
              ? props.iconSet.pinned.on.label
              : iconSetTemplate.value.pinned.on.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.pinned !== void 0 &&
            props.iconSet.pinned.on !== void 0 &&
            props.iconSet.pinned.on.icon !== void 0
              ? props.iconSet.pinned.on.icon
              : iconSetTemplate.value.pinned.on.icon,
          func: pin,
        },
        off: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.pinned !== void 0 &&
            props.iconSet.pinned.off !== void 0 &&
            props.iconSet.pinned.off.label !== void 0
              ? props.iconSet.pinned.off.label
              : iconSetTemplate.value.pinned.off.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.pinned !== void 0 &&
            props.iconSet.pinned.off !== void 0 &&
            props.iconSet.pinned.off.icon !== void 0
              ? props.iconSet.pinned.off.icon
              : iconSetTemplate.value.pinned.off.icon,
          func: unpin,
        },
      },
      fullscreen: {
        state: false,
        on: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.fullscreen !== void 0 &&
            props.iconSet.fullscreen.on !== void 0 &&
            props.iconSet.fullscreen.on.label !== void 0
              ? props.iconSet.fullscreen.on.label
              : iconSetTemplate.value.fullscreen.on.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.fullscreen !== void 0 &&
            props.iconSet.fullscreen.on !== void 0 &&
            props.iconSet.fullscreen.on.icon !== void 0
              ? props.iconSet.fullscreen.on.icon
              : iconSetTemplate.value.fullscreen.on.icon,
          func: fullscreenEnter,
        },
        off: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.fullscreen !== void 0 &&
            props.iconSet.fullscreen.off !== void 0 &&
            props.iconSet.fullscreen.off.label !== void 0
              ? props.iconSet.fullscreen.off.label
              : iconSetTemplate.value.fullscreen.off.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.fullscreen !== void 0 &&
            props.iconSet.fullscreen.off !== void 0 &&
            props.iconSet.fullscreen.off.icon !== void 0
              ? props.iconSet.fullscreen.off.icon
              : iconSetTemplate.value.fullscreen.off.icon,
          func: fullscreenLeave,
        },
      },
      maximize: {
        state: false,
        on: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.maximize !== void 0 &&
            props.iconSet.maximize.on !== void 0 &&
            props.iconSet.maximize.on.label !== void 0
              ? props.iconSet.maximize.on.label
              : iconSetTemplate.value.maximize.on.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.maximize !== void 0 &&
            props.iconSet.maximize.on !== void 0 &&
            props.iconSet.maximize.on.icon !== void 0
              ? props.iconSet.maximize.on.icon
              : iconSetTemplate.value.maximize.on.icon,
          func: maximize,
        },
        off: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.maximize !== void 0 &&
            props.iconSet.maximize.off !== void 0 &&
            props.iconSet.maximize.off.label !== void 0
              ? props.iconSet.maximize.off.label
              : iconSetTemplate.value.maximize.off.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.maximize !== void 0 &&
            props.iconSet.maximize.off !== void 0 &&
            props.iconSet.maximize.off.icon !== void 0
              ? props.iconSet.maximize.off.icon
              : iconSetTemplate.value.maximize.off.icon,
          func: restore,
        },
      },
      minimize: {
        state: false,
        on: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.minimize !== void 0 &&
            props.iconSet.minimize.on !== void 0 &&
            props.iconSet.minimize.on.label !== void 0
              ? props.iconSet.minimize.on.label
              : iconSetTemplate.value.minimize.on.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.minimize !== void 0 &&
            props.iconSet.minimize.on !== void 0 &&
            props.iconSet.minimize.on.icon !== void 0
              ? props.iconSet.minimize.on.icon
              : iconSetTemplate.value.minimize.on.icon,
          func: minimize,
        },
        off: {
          label:
            props.iconSet !== void 0 &&
            props.iconSet.minimize !== void 0 &&
            props.iconSet.minimize.off !== void 0 &&
            props.iconSet.minimize.off.label !== void 0
              ? props.iconSet.minimize.off.label
              : iconSetTemplate.value.minimize.off.label,
          icon:
            props.iconSet !== void 0 &&
            props.iconSet.minimize !== void 0 &&
            props.iconSet.minimize.off !== void 0 &&
            props.iconSet.minimize.off.icon !== void 0
              ? props.iconSet.minimize.off.icon
              : iconSetTemplate.value.minimize.off.icon,
          func: maximize,
        },
      },
    });

    const shiftX = ref(0);
    const shiftY = ref(0);
    const mousePos = ref({
      x: 0,
      y: 0,
    });
    const statesTmp = ref({
      tmpTop: 0,
      tmpLeft: 0,
      tmpRight: 0,
      tmpBottom: 0,
      tmpHeight: 0,
      tmpWidth: 0,
    });

    const states = ref({
      top: 150,
      left: 10,
      bottom: 400,
      right: 400,
      minHeight: 100,
      minWidth: 100,
      shouldDrag: false,
      dragging: false,
    });

    const restoreState = ref({
      top: 10,
      left: 10,
      bottom: 400,
      right: 400,
      zIndex: startingZIndex,
      pinned: false,
      embedded: false,
      maximize: false,
      minimize: false,
    });
    QWindowCount = QWindowCount + 1;
    const $q = useQuasar();
    const windowRef = ref<HTMLElement | null>(null);
    const zIndex = ref(startingZIndex);
    const scrollX = ref(0);
    const scrollY = ref(0);
    const selected = ref(false);
    const resizeHandle = ref<string>();
    const fullscreenInitiated = ref(false);
    const teleportTarget = ref("#q-app");

    const { removeClass, addClass } = useStyle();
    const instance = getCurrentInstance() as ComponentInternalInstance | null;
    const _this = instance?.proxy;

    onMounted(() => {
      const startX = toNumber(props.startX, defaultX * QWindowCount);
      const startY = toNumber(props.startY, defaultY * QWindowCount);
      const width = toNumber(props.width, 400);
      const height = toNumber(props.height, 400);

      // calculate left starting position
      if (startX > 0) {
        states.value.left = startX;
      } else {
        states.value.left = defaultX * QWindowCount;
      }
      //
      // calculate top starting position
      if (startY > 0) {
        states.value.top = startY;
      } else {
        states.value.top = defaultY * QWindowCount;
      }

      // calculate right and bottom starting positions
      states.value.right = states.value.left + width;
      states.value.bottom = states.value.top + height;

      if (props.modelValue !== void 0) {
        if (props.modelValue === true) {
          syncActionState(ACTION_VISIBLE, true);
        } else {
          syncActionState(ACTION_VISIBLE, false);
        }
      }
      if (props.embedded !== void 0) {
        if (props.embedded === true) {
          syncActionState(ACTION_EMBEDDED, true);
        } else {
          syncActionState(ACTION_EMBEDDED, false);
        }
      }
      if (props.pinned !== void 0) {
        if (props.pinned === true) {
          if (checkActionState(ACTION_PINNED, true)) {
            syncActionState(ACTION_PINNED, true);
          }
        } else {
          if (checkActionState(ACTION_PINNED, false)) {
            syncActionState(ACTION_PINNED, false);
          }
        }
      }
      if (props.fullscreen !== void 0) {
        if (props.fullscreen === true) {
          fullscreenEnter();
        }
      }
      if (props.maximized !== void 0) {
        if (props.maximized === true && getActionState(ACTION_VISIBLE) !== true) {
          syncActionState(ACTION_MAXIMIZE, true);
        } else {
          syncActionState(ACTION_MAXIMIZE, false);
        }
      }
      if (props.minimized !== void 0) {
        if (props.minimized === true && getActionState(ACTION_FULLSCREEN) !== true) {
          syncActionState(ACTION_MINIMIZE, true);
        } else {
          syncActionState(ACTION_MINIMIZE, false);
        }
      }

      const doc = getDocument();
      if (doc !== void 0) {
        teleportTarget.value = doc.querySelector("#q-app") === null ? "body" : "#q-app";
        doc.addEventListener("scroll", onScroll, { passive: true });
        doc.body.addEventListener("mousedown", onMouseDownBody, { passive: false });
      }
    });

    onBeforeUnmount(() => {
      const doc = getDocument();
      if (doc !== void 0) {
        doc.removeEventListener("scroll", onScroll);
        doc.body.removeEventListener("mousedown", onMouseDownBody);
        removeClass(doc.body, "q-window__touch-action");
      }

      removeEventListeners();
    });

    function show() {
      if (checkActionState(ACTION_VISIBLE, true)) {
        setActionState(ACTION_VISIBLE, true);
        return true;
      }
      return false;
    }

    // hide the component
    function hide() {
      if (checkActionState(ACTION_VISIBLE, false)) {
        setActionState(ACTION_VISIBLE, false);
        return true;
      }
      return false;
    }

    // embedded
    function lock() {
      if (checkActionState(ACTION_EMBEDDED, true)) {
        setActionState(ACTION_EMBEDDED, true);
        return true;
      }
      return false;
    }

    // floating
    function unlock() {
      if (checkActionState(ACTION_EMBEDDED, false)) {
        setActionState(ACTION_EMBEDDED, false);
        return true;
      }
      return false;
    }

    // pinned (can't move or re-size)
    function pin() {
      if (checkActionState(ACTION_PINNED, true)) {
        setActionState(ACTION_PINNED, true);
        return true;
      }
      return false;
    }

    // move and resize available, if not embedded
    function unpin() {
      if (checkActionState(ACTION_PINNED, false)) {
        setActionState(ACTION_PINNED, false);
        return true;
      }
      return false;
    }

    function maximize() {
      if (checkActionState(ACTION_MAXIMIZE, true)) {
        //thisbringToFront()
        savePositionAndState();
        setFullWindowPosition();

        setActionState(ACTION_EMBEDDED, false);
        setActionState(ACTION_MAXIMIZE, true);
        return true;
      }
      return false;
    }

    function minimize() {
      if (checkActionState(ACTION_MINIMIZE, true)) {
        savePositionAndState();
        setMinimizePosition();

        setActionState(ACTION_EMBEDDED, true);
        setActionState(ACTION_MINIMIZE, true);
        return true;
      }
      return false;
    }

    function restore() {
      if (getActionState(ACTION_VISIBLE) !== true) {
        // not allowed
        return;
      }
      if (getActionState(ACTION_MAXIMIZE) === true) {
        setActionState(ACTION_MAXIMIZE, false);
      } else if (getActionState(ACTION_MINIMIZE) === true) {
        setActionState(ACTION_MINIMIZE, false);
      }
    }

    function fullscreenEnter() {
      if (checkActionState(ACTION_FULLSCREEN, true)) {
        fullscreenInitiated.value = true;
        AppFullscreen.request(windowRef.value ?? undefined);
        return true;
      }
      return false;
    }

    // leave fullscreen mode
    function fullscreenLeave() {
      if (checkActionState(ACTION_FULLSCREEN, false)) {
        AppFullscreen.exit();
        return true;
      }
      return false;
    }

    function checkActionState(mode: QWindowAction, state: boolean) {
      let allowed = false;
      switch (mode) {
        case ACTION_VISIBLE:
          if (state) {
            if (getActionState(ACTION_VISIBLE) !== true) {
              allowed = true;
            }
          } else {
            if (getActionState(ACTION_VISIBLE) === true) {
              allowed = true;
            }
          }
          break;
        case ACTION_EMBEDDED:
          if (state) {
            if (
              getActionState(ACTION_EMBEDDED) !== true &&
              getActionState(ACTION_FULLSCREEN) !== true
            ) {
              allowed = true;
            }
          } else {
            if (
              getActionState(ACTION_EMBEDDED) === true &&
              getActionState(ACTION_FULLSCREEN) !== true
            ) {
              allowed = true;
            }
          }
          break;
        case ACTION_PINNED:
          if (state) {
            if (
              getActionState(ACTION_PINNED) !== true &&
              getActionState(ACTION_EMBEDDED) !== true &&
              getActionState(ACTION_MAXIMIZE) !== true &&
              getActionState(ACTION_MINIMIZE) !== true &&
              getActionState(ACTION_FULLSCREEN) !== true
            ) {
              allowed = true;
            }
          } else {
            if (
              getActionState(ACTION_PINNED) === true &&
              getActionState(ACTION_EMBEDDED) !== true &&
              getActionState(ACTION_MAXIMIZE) !== true &&
              getActionState(ACTION_MINIMIZE) !== true &&
              getActionState(ACTION_FULLSCREEN) !== true
            ) {
              allowed = true;
            }
          }
          break;
        case ACTION_MAXIMIZE:
          if (state) {
            if (
              getActionState(ACTION_MINIMIZE) !== true &&
              getActionState(ACTION_EMBEDDED) !== true &&
              getActionState(ACTION_MAXIMIZE) !== true &&
              getActionState(ACTION_FULLSCREEN) !== true
            ) {
              allowed = true;
            }
          } else {
            if (
              getActionState(ACTION_MAXIMIZE) === true &&
              getActionState(ACTION_EMBEDDED) !== true &&
              getActionState(ACTION_MINIMIZE) !== true &&
              getActionState(ACTION_FULLSCREEN) !== true
            ) {
              allowed = true;
            }
          }
          break;
        case ACTION_FULLSCREEN:
          if (state === true) {
            if (
              getActionState(ACTION_FULLSCREEN) !== true &&
              getActionState(ACTION_EMBEDDED) !== true
            ) {
              allowed = true;
            }
          } else {
            if (
              getActionState(ACTION_FULLSCREEN) === true &&
              getActionState(ACTION_EMBEDDED) !== true
            ) {
              allowed = true;
            }
          }
          break;
        case ACTION_CLOSE:
          if (state === true) {
            if (getActionState(ACTION_EMBEDDED) !== true) {
              allowed = true;
            }
          } else {
            allowed = true;
          }
          break;
        default:
          throw Error(`Unknown action type ${mode}`);
      }
      return allowed;
    }

    //
    function getActionState(name: QWindowAction) {
      const item = actionItems.value[name];
      if (item !== void 0) {
        return item.state;
      }
      return false;
    }

    //
    function setActionState(id: QWindowAction, val: boolean) {
      const item = actionItems.value[id];
      if (item !== void 0) {
        const changed = item.state !== val;
        item.state = val;
        if (changed === true) {
          emitActionState(id, val);
        }
        return true;
      }
      return false;
    }

    function syncActionState(id: QWindowAction, val: boolean) {
      const item = actionItems.value[id];
      if (item !== void 0) {
        const changed = item.state !== val;
        item.state = val;
        return changed;
      }
      return false;
    }

    function emitVisibilityLifecycle(val: boolean) {
      emit(val === true ? "show" : "hide");
    }

    function emitActionState(id: QWindowAction, val: boolean) {
      switch (id) {
        case ACTION_VISIBLE:
          emit("update:modelValue", val);
          emit("input", val);
          emitVisibilityLifecycle(val);
          break;
        case ACTION_EMBEDDED:
          emit("embedded", val);
          break;
        case ACTION_PINNED:
          emit("pinned", val);
          break;
        case ACTION_FULLSCREEN:
          emit("fullscreen", val);
          break;
        case ACTION_MAXIMIZE:
          emit("maximize", val);
          break;
        case ACTION_MINIMIZE:
          emit("minimize", val);
          break;
      }
    }

    function emitPosition() {
      emit("position", computedPosition.value);
    }

    watch(
      () => props.modelValue,
      (val) => {
        if (syncActionState(ACTION_VISIBLE, val) === true) {
          emitVisibilityLifecycle(val);
        }
      },
    );

    watch(selected, (val) => {
      if (props.autoPin === true) {
        if (val === true) {
          pin();
        } else {
          unpin();
        }
      }

      emit("selected", val);
    });

    function onScroll() {
      const win = getWindow();
      if (win !== void 0) {
        scrollY.value = win.scrollY;
        scrollX.value = win.scrollX;
      }
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
      return true;
    }

    //
    function setFullWindowPosition() {
      states.value.top = 0;
      states.value.left = 0;
      states.value.bottom = $q.screen.height;
      states.value.right = $q.screen.width;
    }

    //
    function setMinimizePosition() {
      // Reserved for future docked minimization placement.
    }

    // //// MOUSE ACTIONS
    function addEventListeners() {
      const doc = getDocument();
      if (doc === void 0) {
        return;
      }

      doc.body.addEventListener("mousemove", onMouseMove, { capture: true });
      doc.body.addEventListener("mouseup", onMouseUp, { capture: true });
      doc.body.addEventListener("keyup", onKeyUp, { capture: true });
    }

    function removeEventListeners() {
      const doc = getDocument();
      if (doc === void 0) {
        return;
      }

      doc.body.removeEventListener("mousemove", onMouseMove, { capture: true });
      doc.body.removeEventListener("mouseup", onMouseUp, { capture: true });
      doc.body.removeEventListener("keyup", onKeyUp, { capture: true });
    }

    function onMouseMove(evt: PointerLikeEvent, rh?: string) {
      if (states.value.shouldDrag !== true || (!("touches" in evt) && evt.buttons !== 1)) {
        removeEventListeners();
        return;
      }

      const mouseX = getMousePosition(evt, "x");
      const mouseY = getMousePosition(evt, "y");
      const win = getWindow();

      // wait 3 pixel move to initiate drag
      if (states.value.dragging !== true) {
        if (Math.abs(mousePos.value.x - mouseX) >= 3 || Math.abs(mousePos.value.y - mouseY) >= 3) {
          states.value.dragging = true;
          emit("beforeDrag", evt);
        } else {
          return;
        }
      }

      switch (rh || resizeHandle.value) {
        case "top":
          states.value.top = mouseY - (win?.scrollY ?? 0) - shiftY.value;
          nextTick(() => {
            if (computedHeight.value < states.value.minHeight) {
              states.value.top = statesTmp.value.tmpBottom - states.value.minHeight;
            }
          });
          break;
        case "left":
          states.value.left = mouseX - (win?.pageXOffset ?? 0) - shiftX.value;
          nextTick(() => {
            if (computedWidth.value < states.value.minWidth) {
              states.value.left = statesTmp.value.tmpRight - states.value.minWidth;
            }
          });
          break;
        case "right":
          states.value.right = mouseX - (win?.pageXOffset ?? 0);
          nextTick(() => {
            if (computedWidth.value < states.value.minWidth) {
              states.value.right = statesTmp.value.tmpLeft + states.value.minWidth;
            }
          });
          break;
        case "bottom":
          states.value.bottom = mouseY - (win?.scrollY ?? 0);
          nextTick(() => {
            if (computedHeight.value < states.value.minHeight) {
              states.value.bottom = statesTmp.value.tmpTop + states.value.minHeight;
            }
          });
          break;
        case "top-left":
          onMouseMove(evt, "top");
          onMouseMove(evt, "left");
          break;
        case "top-right":
          onMouseMove(evt, "top");
          onMouseMove(evt, "right");
          break;
        case "bottom-left":
          onMouseMove(evt, "bottom");
          onMouseMove(evt, "left");
          break;
        case "bottom-right":
          onMouseMove(evt, "bottom");
          onMouseMove(evt, "right");
          break;
        case "titlebar":
          if (props.scrollWithWindow === true) {
            states.value.top = mouseY - shiftY.value;
            states.value.left = mouseX - shiftX.value;
          } else {
            states.value.top = mouseY - (win?.pageYOffset ?? 0) - shiftY.value;
            states.value.left = mouseX - (win?.pageXOffset ?? 0) - shiftX.value;
          }

          states.value.bottom = states.value.top + statesTmp.value.tmpHeight;
          states.value.right = states.value.left + statesTmp.value.tmpWidth;
          break;
      }
      stopAndPrevent(evt);
    }

    function onMouseDown(evt: PointerLikeEvent, rh?: string) {
      removeEventListeners();
      selected.value = false;
      if (!("touches" in evt) && evt.buttons !== 1) {
        return;
      }

      if (isEmbedded.value === true) {
        states.value.shouldDrag = states.value.dragging = false;
        return;
      }

      const x = getMousePosition(evt, "x");
      const y = getMousePosition(evt, "y");

      selected.value = canBeSelected(x - scrollX.value, y - scrollY.value);
      if (selected.value !== true) {
        return;
      }

      //bringToFront()

      resizeHandle.value = rh;

      mousePos.value.x = x;
      mousePos.value.y = y;

      if (windowRef.value === null) {
        return;
      }

      const rect = windowRef.value.getBoundingClientRect();
      shiftX.value = getMouseShift(evt, rect, "x");
      shiftY.value = getMouseShift(evt, rect, "y");

      statesTmp.value.tmpTop = states.value.top;
      statesTmp.value.tmpLeft = states.value.left;
      statesTmp.value.tmpRight = states.value.right;
      statesTmp.value.tmpBottom = states.value.bottom;
      statesTmp.value.tmpHeight = statesTmp.value.tmpBottom - statesTmp.value.tmpTop;
      statesTmp.value.tmpWidth = statesTmp.value.tmpRight - statesTmp.value.tmpLeft;

      states.value.shouldDrag = true;

      addEventListeners();
      if ("touches" in evt) {
        const doc = getDocument();
        if (doc !== void 0) {
          addClass(doc.body, "q-window__touch-action");
        }
      }
      prevent(evt);
    }

    // mousedown for document.body
    function onMouseDownBody(e: MouseEvent) {
      if (isEmbedded.value) {
        states.value.shouldDrag = states.value.dragging = false;
        return;
      }

      // if dragging, already selected
      if (states.value.dragging !== true) {
        const x = getMousePosition(e, "x");
        const y = getMousePosition(e, "y");

        selected.value = canBeSelected(x - scrollX.value, y - scrollY.value);
        if (selected.value) {
          //bringToFront()
        }
      }
    }

    function onMouseUp(e: MouseEvent | TouchEvent) {
      if (states.value.dragging === true) {
        prevent(e);
        removeEventListeners();
        if ("touches" in e) {
          const doc = getDocument();
          if (doc !== void 0) {
            removeClass(doc.body, "q-window__touch-action");
          }
        }
        states.value.shouldDrag = states.value.dragging = false;
        emit("afterDrag", e);
        emitPosition();
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      // if ESC key
      if (e.keyCode === 27 && isDragging.value === true) {
        prevent(e);
        removeEventListeners();
        states.value.shouldDrag = states.value.dragging = false;
        states.value.top = statesTmp.value.tmpTop;
        states.value.left = statesTmp.value.tmpLeft;
        states.value.right = statesTmp.value.tmpRight;
        states.value.bottom = statesTmp.value.tmpBottom;
        nextTick(() => {
          emit("canceled", computedPosition.value);
        });
      }
    }

    function onTouchMove(e: TouchEvent, handle: string) {
      stopAndPrevent(e);
      resizeHandle.value = handle;
      onMouseMove(e);
    }

    function onTouchStart(e: TouchEvent, handle: string) {
      stopAndPrevent(e);
      onMouseDown(e, handle);
    }

    function onTouchEnd(e: TouchEvent, handle: string) {
      stopAndPrevent(e);
      resizeHandle.value = handle;
      onMouseUp(e);
    }

    const savePositionAndState = () => {
      restoreState.value.top = states.value.top;
      restoreState.value.left = states.value.left;
      restoreState.value.bottom = states.value.bottom;
      restoreState.value.right = states.value.right;

      restoreState.value.zIndex = computedZIndex.value;

      restoreState.value.pinned = getActionState(ACTION_PINNED);
      restoreState.value.embedded = getActionState(ACTION_EMBEDDED);
      restoreState.value.maximize = getActionState(ACTION_MAXIMIZE);
      restoreState.value.minimize = getActionState(ACTION_MINIMIZE);
    };

    const restorePositionAndState = () => {
      states.value.top = restoreState.value.top;
      states.value.left = restoreState.value.left;
      states.value.bottom = restoreState.value.bottom;
      states.value.right = restoreState.value.right;
      zIndex.value = restoreState.value.zIndex;

      setActionState(ACTION_PINNED, restoreState.value.pinned);
      setActionState(ACTION_EMBEDDED, restoreState.value.embedded);
      setActionState(ACTION_MAXIMIZE, restoreState.value.maximize);
      setActionState(ACTION_MINIMIZE, restoreState.value.minimize);
    };

    watch(
      () => getActionState(ACTION_MAXIMIZE),
      (val, oldVal) => {
        if (oldVal === void 0) {
          // during initialization
          return;
        }
        if (val === false) {
          restorePositionAndState();
          nextTick(emitPosition);
        }
      },
    );

    watch(
      () => getActionState(ACTION_MINIMIZE),
      (val, oldVal) => {
        if (oldVal === void 0) {
          // during initialization
          return;
        }
        if (val === false) {
          restorePositionAndState();
          nextTick(emitPosition);
        }
      },
    );

    watch(
      () => getActionState(ACTION_FULLSCREEN),
      (val, oldVal) => {
        if (oldVal === void 0) {
          return;
        }
        if (val === true) {
          savePositionAndState();
          zIndex.value = maxZIndex;
        } else {
          restorePositionAndState();
          fullscreenInitiated.value = val;
          nextTick(emitPosition);
        }
      },
    );

    watch(
      () => AppFullscreen.isActive,
      (val) => {
        if (fullscreenInitiated.value === true) {
          setActionState(ACTION_FULLSCREEN, val);
        }
      },
    );

    watch(
      () => $q.screen.height,
      (val) => {
        if (isFullscreen.value === true) {
          states.value.bottom = val;
          nextTick(emitPosition);
        }
      },
    );
    watch(
      () => $q.screen.width,
      (val) => {
        if (isFullscreen.value === true) {
          states.value.right = val;
          nextTick(emitPosition);
        }
      },
    );
    const isVisible = computed(() => {
      return getActionState(ACTION_VISIBLE);
    });

    const isEmbedded = computed(() => {
      return getActionState(ACTION_EMBEDDED);
    });

    const isPinned = computed(() => {
      return getActionState(ACTION_PINNED);
    });

    const isFullscreen = computed(() => {
      return getActionState(ACTION_FULLSCREEN);
    });

    const isMaximized = computed(() => {
      return getActionState(ACTION_MAXIMIZE);
    });

    const isMinimized = computed(() => {
      return getActionState(ACTION_MINIMIZE);
    });

    const isDisabled = computed(() => {
      return props.disabled === true;
    });

    const isEnabled = computed(() => {
      return isDisabled.value === false;
    });

    const isDragging = computed(() => {
      return states.value.dragging === true;
    });

    const isSelected = computed(() => {
      return selected.value === true;
    });

    const canDrag = () => {
      return (
        isVisible.value === true &&
        isEmbedded.value !== true &&
        isPinned.value !== true &&
        isFullscreen.value !== true &&
        isMaximized.value !== true &&
        isMinimized.value !== true
      );
    };

    const computedVisibility = computed(() => {
      return isVisible.value === true ? ACTION_VISIBLE : ACTION_HIDDEN;
    });

    const computedToolbarHeight = computed(() => {
      return props.headless === true ? 0 : props.dense === true ? 28 : 40;
    });

    const computedLeft = computed(() => {
      return states.value.left;
    });

    const computedTop = computed(() => {
      return states.value.top;
    });

    const computedRight = computed(() => {
      return states.value.right;
    });

    const computedBottom = computed(() => {
      return states.value.bottom;
    });

    const computedHeight = computed(() => {
      const height = computedBottom.value - computedTop.value;
      return height;
    });

    const computedWidth = computed(() => {
      const width = computedRight.value - computedLeft.value;
      return width;
    });

    const computedScrollX = computed(() => {
      return computedLeft.value + (props.scrollWithWindow !== true ? scrollX.value : 0);
    });

    const computedScrollY = computed(() => {
      return computedTop.value + (props.scrollWithWindow !== true ? scrollY.value : 0);
    });

    const computedPosition = computed<QWindowPosition>(() => {
      return {
        height: computedHeight.value,
        left: computedLeft.value,
        scrollX: computedScrollX.value,
        scrollY: computedScrollY.value,
        top: computedTop.value,
        width: computedWidth.value,
      };
    });

    const computedZIndex = computed(() => {
      let extra = 0;
      if (isDragging.value) extra = 100;
      return zIndex.value + extra;
    });

    const computedActions = computed(() => {
      // sort and pick ones that are visible based on user selection and state
      const actions: QWindowAction[] = [];
      if (
        props.actions.includes(ACTION_EMBEDDED) &&
        (checkActionState(ACTION_EMBEDDED, true) || checkActionState(ACTION_EMBEDDED, false))
      ) {
        actions.push(ACTION_EMBEDDED);
      }
      if (
        props.actions.includes(ACTION_PINNED) &&
        (checkActionState(ACTION_PINNED, true) || checkActionState(ACTION_PINNED, false))
      ) {
        actions.push(ACTION_PINNED);
      }
      if (
        props.actions.includes(ACTION_FULLSCREEN) &&
        (checkActionState(ACTION_FULLSCREEN, true) || checkActionState(ACTION_FULLSCREEN, false))
      ) {
        actions.push(ACTION_FULLSCREEN);
      }
      if (
        props.actions.includes(ACTION_MAXIMIZE) &&
        (checkActionState(ACTION_MAXIMIZE, true) || checkActionState(ACTION_MAXIMIZE, false))
      ) {
        actions.push(ACTION_MAXIMIZE);
      }
      if (
        props.actions.includes(ACTION_MINIMIZE) &&
        (checkActionState(ACTION_MINIMIZE, true) || checkActionState(ACTION_MINIMIZE, false))
      ) {
        actions.push(ACTION_MINIMIZE);
      }
      if (props.actions.includes(ACTION_CLOSE) && checkActionState(ACTION_CLOSE, true)) {
        actions.push(ACTION_VISIBLE);
      }

      return actions;
    });

    const computedMenuData = computed(() => {
      // get stateInfo for each menu item
      const menuData: Array<ActionItem & { key: string }> = [];
      computedActions.value.map((key) => {
        if (actionItems.value[key]) {
          menuData.push({ ...actionItems.value[key], key: key });
        }
      });
      return menuData;
    });

    const __style = computed(() => {
      let style: WindowStyle;
      if (isMinimized.value === true) {
        style = {
          position: "relative",
          visibility: computedVisibility.value,
          height: computedToolbarHeight.value + "px",
          borderWidth: "1px",
          borderStyle: "solid",
          color: props.color,
          backgroundColor: props.backgroundColor,
          minWidth: "100px",
        };
      } else if (isEmbedded.value === true) {
        style = {
          position: "relative",
          visibility: computedVisibility.value,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          width: "100%",
          height: "100%",
        };
      } else {
        const top = states.value.top + (props.scrollWithWindow !== true ? scrollY.value : 0);
        const left = states.value.left + (props.scrollWithWindow !== true ? scrollX.value : 0);

        style = {
          position: "absolute",
          display: "inline-block",
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          padding: 0,
          visibility: computedVisibility.value,
          minWidth: "90px",
          minHeight: "50px",
          top: top + "px",
          left: left + "px",
          zIndex: computedZIndex.value,
        };
        if (isMaximized.value) {
          style.width = "100%";
          style.height = "100%";
        } else {
          style.width = computedWidth.value + "px";
          style.height = computedHeight.value + "px";
        }
      }

      if (props.contentStyle) {
        const type = Object.prototype.toString.call(props.contentStyle);
        if (type === "[object Object]") {
          style = {
            ...style,
            ...(props.contentStyle as Record<string, string | number | undefined>),
          };
        } else if (type === "[object Array]") {
          (props.contentStyle as Array<Record<string, string | number | undefined>>).forEach(
            (item) => {
              style = { ...style, ...item };
            },
          );
        } else if (typeof props.contentStyle === "string") {
          const items = props.contentStyle.split(";");
          items.forEach((item) => {
            const [key, value] = item.split(":");
            if (key !== void 0 && value !== void 0) {
              style[key.trim()] = value.trim();
            }
          });
        }
      }
      return style;
    });

    const __classes = computed(() => {
      return (
        "" +
        (isEnabled.value === true ? " q-focusable q-hoverable" : " disabled") +
        (isEmbedded.value !== true && isFullscreen.value !== true ? " q-window__floating" : "") +
        (isFullscreen.value === true ? " q-window__fullscreen" : "") +
        (isSelected.value === true && isEmbedded.value !== true && isFullscreen.value !== true
          ? " q-window__selected"
          : "") +
        (isDragging.value === true ? " q-window__dragging q-window__touch-action" : "")
      );
    });
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
    );

    const { renderTitleBar } = useToolbar(
      props,
      slots,
      computedZIndex,
      canDrag,
      isDragging,
      isEmbedded,
      isMinimized,
      computedMenuData,
      renderResizeHandle,
    );

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
    );

    function renderWindow() {
      const r = h(
        "div",
        {
          class: ["q-window", __classes.value, props.contentClass],
          style: __style.value,
          ref: windowRef,
        },
        [
          canDrag() === true && [...renderResizeHandles()],
          canDrag() === true && [...renderGrippers()],
          renderTitleBar(),
          isMinimized.value !== true && renderBody(),
        ],
      );
      return r;
    }

    function render() {
      return h(
        Teleport,
        {
          to: teleportTarget.value,
          disabled: isEmbedded.value || getDocument() === void 0,
        },
        [renderWindow()],
      );
    }

    return () => render();
  },
});
