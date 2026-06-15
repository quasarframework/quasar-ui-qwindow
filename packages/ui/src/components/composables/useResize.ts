import { h, ref } from "vue";
import type { Ref, Slots } from "vue";

type PointerHandler = (evt: MouseEvent | TouchEvent, resizeHandle?: string) => void;
type TouchHandler = (evt: TouchEvent, resizeHandle: string) => void;

export default function useResize(
  props: Record<string, any>,
  slots: Slots,
  computedHeight: Ref<number>,
  computedToolbarHeight: Ref<number>,
  zIndex: Ref<number>,
  canDrag: () => boolean,
  computedWidth: Ref<number>,
  onMouseDown: PointerHandler,
  onTouchStart: TouchHandler,
  onTouchMove: TouchHandler,
  onTouchEnd: TouchHandler,
) {
  const handles = ref([
    "top",
    "left",
    "right",
    "bottom",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ]);

  function canResize(resizeHandle: string) {
    if (props.noResize === true) return false;
    const missing = handles.value.filter((handle) => !props.resizable.includes(handle));
    return missing.includes(resizeHandle) !== true;
  }

  function renderGripper(resizeHandle: string) {
    if (canResize(resizeHandle) === false) {
      return "";
    }

    return h("div", {
      ref: resizeHandle,
      style: {
        backgroundColor: props.gripperBackgroundColor,
        borderColor: props.gripperBorderColor,
      },
      class: `gripper gripper-${resizeHandle}${props.roundGrippers === true ? " gripper-round" : ""}`,
      onMousedown: (e: MouseEvent) => onMouseDown(e, resizeHandle),
      onTouchstart: (e: TouchEvent) => onTouchStart(e, resizeHandle),
      onTouchmove: (e: TouchEvent) => onTouchMove(e, resizeHandle),
      onTouchend: (e: TouchEvent) => onTouchEnd(e, resizeHandle),
    });
  }

  // resize handles are for when there are no grippers
  function renderResizeHandle(resizeHandle: string, actionsWidth?: number) {
    if (props.noMove && resizeHandle === "titlebar") {
      return "";
    }
    if (resizeHandle !== "titlebar" && canResize(resizeHandle) === false) {
      return "";
    }

    const style: Record<string, string> = {};
    if (actionsWidth && actionsWidth > 0 && canDrag() === true) {
      let width = computedWidth.value;
      width -= actionsWidth;
      style.width = width + "px";
    }
    return h("div", {
      ref: resizeHandle,
      class: ["q-window__resize-handle", `q-window__resize-handle--${resizeHandle}`],
      style: style,
      onMousedown: (e: MouseEvent) => onMouseDown(e, resizeHandle),
      onTouchstart: (e: TouchEvent) => onTouchStart(e, resizeHandle),
      onTouchmove: (e: TouchEvent) => onTouchMove(e, resizeHandle),
      onTouchend: (e: TouchEvent) => onTouchEnd(e, resizeHandle),
    });
  }

  function renderGrippers() {
    if (props.hideGrippers === true) {
      return "";
    }
    return handles.value.map((resizeHandle) => renderGripper(resizeHandle));
  }

  function renderResizeHandles() {
    if (props.hideGrippers !== true) {
      return "";
    }
    return handles.value.map((resizeHandle) => renderResizeHandle(resizeHandle));
  }

  return {
    renderGrippers,
    renderResizeHandles,
    renderResizeHandle,
  };
}
