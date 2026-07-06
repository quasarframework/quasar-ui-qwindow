import { computed, ref } from 'vue'
import type { Ref } from 'vue'

export type QWindowAction = string

export const ACTION_HIDDEN = 'hidden'
export const ACTION_VISIBLE = 'visible'
export const ACTION_EMBEDDED = 'embedded'
export const ACTION_FULLSCREEN = 'fullscreen'
export const ACTION_PINNED = 'pinned'
export const ACTION_MAXIMIZE = 'maximize'
export const ACTION_MINIMIZE = 'minimize'
export const ACTION_CLOSE = 'close'

type ActionStateItem = {
  state: boolean
}

type ActionStateMap = Record<string, ActionStateItem>
type EmitFn = (event: any, ...args: any[]) => void

function createInitialActionState(): ActionStateMap {
  return {
    [ACTION_VISIBLE]: {
      state: true,
    },
    [ACTION_EMBEDDED]: {
      state: true,
    },
    [ACTION_PINNED]: {
      state: false,
    },
    [ACTION_FULLSCREEN]: {
      state: false,
    },
    [ACTION_MAXIMIZE]: {
      state: false,
    },
    [ACTION_MINIMIZE]: {
      state: false,
    },
  }
}

export default function useWindowState(emit: EmitFn) {
  const actionState = ref<ActionStateMap>(createInitialActionState())

  const isVisible = computed(() => getActionState(ACTION_VISIBLE))
  const isEmbedded = computed(() => getActionState(ACTION_EMBEDDED))
  const isPinned = computed(() => getActionState(ACTION_PINNED))
  const isFullscreen = computed(() => getActionState(ACTION_FULLSCREEN))
  const isMaximized = computed(() => getActionState(ACTION_MAXIMIZE))
  const isMinimized = computed(() => getActionState(ACTION_MINIMIZE))
  const computedVisibility = computed(() => {
    return isVisible.value === true ? ACTION_VISIBLE : ACTION_HIDDEN
  })

  function checkActionState(mode: QWindowAction, state: boolean) {
    let allowed = false
    switch (mode) {
      case ACTION_VISIBLE:
        allowed = state === true ? isVisible.value !== true : isVisible.value === true
        break
      case ACTION_EMBEDDED:
        allowed =
          state === true
            ? isEmbedded.value !== true && isFullscreen.value !== true
            : isEmbedded.value === true && isFullscreen.value !== true
        break
      case ACTION_PINNED:
        allowed =
          state === true
            ? isPinned.value !== true &&
              isEmbedded.value !== true &&
              isMaximized.value !== true &&
              isMinimized.value !== true &&
              isFullscreen.value !== true
            : isPinned.value === true &&
              isEmbedded.value !== true &&
              isMaximized.value !== true &&
              isMinimized.value !== true &&
              isFullscreen.value !== true
        break
      case ACTION_MAXIMIZE:
        allowed =
          state === true
            ? isMinimized.value !== true &&
              isEmbedded.value !== true &&
              isMaximized.value !== true &&
              isFullscreen.value !== true
            : isMaximized.value === true &&
              isEmbedded.value !== true &&
              isMinimized.value !== true &&
              isFullscreen.value !== true
        break
      case ACTION_FULLSCREEN:
        allowed =
          state === true
            ? isFullscreen.value !== true && isEmbedded.value !== true
            : isFullscreen.value === true && isEmbedded.value !== true
        break
      case ACTION_CLOSE:
        allowed = state === true ? isEmbedded.value !== true : true
        break
      default:
        throw Error(`Unknown action type ${mode}`)
    }
    return allowed
  }

  function getActionState(name: QWindowAction) {
    const item = actionState.value[name]
    return item?.state === true
  }

  function setActionState(id: QWindowAction, val: boolean) {
    const item = actionState.value[id]
    if (item !== void 0) {
      const changed = item.state !== val
      item.state = val
      if (changed === true) {
        emitActionState(id, val)
      }
      return true
    }
    return false
  }

  function syncActionState(id: QWindowAction, val: boolean | undefined) {
    const item = actionState.value[id]
    if (item !== void 0) {
      const nextValue = val === true
      const changed = item.state !== nextValue
      item.state = nextValue
      return changed
    }
    return false
  }

  function emitVisibilityLifecycle(val: boolean) {
    emit(val === true ? 'show' : 'hide')
  }

  function emitActionState(id: QWindowAction, val: boolean) {
    switch (id) {
      case ACTION_VISIBLE:
        emit('update:modelValue', val)
        emit('input', val)
        emitVisibilityLifecycle(val)
        break
      case ACTION_EMBEDDED:
        emit('embedded', val)
        emit('update:embedded', val)
        break
      case ACTION_PINNED:
        emit('pinned', val)
        emit('update:pinned', val)
        break
      case ACTION_FULLSCREEN:
        emit('fullscreen', val)
        emit('update:fullscreen', val)
        break
      case ACTION_MAXIMIZE:
        emit('maximize', val)
        emit('update:maximized', val)
        break
      case ACTION_MINIMIZE:
        emit('minimize', val)
        emit('update:minimized', val)
        break
    }
  }

  function getAvailableActions(actions: string[]): QWindowAction[] {
    const availableActions: QWindowAction[] = []
    if (
      actions.includes(ACTION_EMBEDDED) &&
      (checkActionState(ACTION_EMBEDDED, true) || checkActionState(ACTION_EMBEDDED, false))
    ) {
      availableActions.push(ACTION_EMBEDDED)
    }
    if (
      actions.includes(ACTION_PINNED) &&
      (checkActionState(ACTION_PINNED, true) || checkActionState(ACTION_PINNED, false))
    ) {
      availableActions.push(ACTION_PINNED)
    }
    if (
      actions.includes(ACTION_FULLSCREEN) &&
      (checkActionState(ACTION_FULLSCREEN, true) || checkActionState(ACTION_FULLSCREEN, false))
    ) {
      availableActions.push(ACTION_FULLSCREEN)
    }
    if (
      actions.includes(ACTION_MAXIMIZE) &&
      (checkActionState(ACTION_MAXIMIZE, true) || checkActionState(ACTION_MAXIMIZE, false))
    ) {
      availableActions.push(ACTION_MAXIMIZE)
    }
    if (
      actions.includes(ACTION_MINIMIZE) &&
      (checkActionState(ACTION_MINIMIZE, true) || checkActionState(ACTION_MINIMIZE, false))
    ) {
      availableActions.push(ACTION_MINIMIZE)
    }
    if (actions.includes(ACTION_CLOSE) && checkActionState(ACTION_CLOSE, true)) {
      availableActions.push(ACTION_VISIBLE)
    }

    return availableActions
  }

  return {
    actionState: actionState as Ref<ActionStateMap>,
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
  }
}
