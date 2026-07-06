import { ref } from 'vue'
import type { Ref } from 'vue'

import { ACTION_EMBEDDED, ACTION_MAXIMIZE, ACTION_MINIMIZE, ACTION_PINNED } from './useWindowState'

type GeometryState = {
  top: number
  left: number
  bottom: number
  right: number
}

type RestoreActionState = {
  pinned: boolean
  embedded: boolean
  maximize: boolean
  minimize: boolean
}

export type QWindowRestoreState = GeometryState &
  RestoreActionState & {
    zIndex: number
  }

type UseWindowRestoreStateOptions = {
  states: Ref<GeometryState>
  startingZIndex: number
  getZIndex: () => number
  setZIndex: (value: number) => void
  getActionState: (action: string) => boolean
  setActionState: (action: string, value: boolean) => boolean
}

export function createWindowRestoreState(startingZIndex: number): QWindowRestoreState {
  return {
    top: 10,
    left: 10,
    bottom: 400,
    right: 400,
    zIndex: startingZIndex,
    pinned: false,
    embedded: false,
    maximize: false,
    minimize: false,
  }
}

export default function useWindowRestoreState({
  states,
  startingZIndex,
  getZIndex,
  setZIndex,
  getActionState,
  setActionState,
}: UseWindowRestoreStateOptions) {
  const restoreState = ref(createWindowRestoreState(startingZIndex))
  const fullscreenRestoreState = ref(createWindowRestoreState(startingZIndex))

  function savePositionAndState(target: QWindowRestoreState = restoreState.value): void {
    target.top = states.value.top
    target.left = states.value.left
    target.bottom = states.value.bottom
    target.right = states.value.right

    target.zIndex = getZIndex()

    target.pinned = getActionState(ACTION_PINNED)
    target.embedded = getActionState(ACTION_EMBEDDED)
    target.maximize = getActionState(ACTION_MAXIMIZE)
    target.minimize = getActionState(ACTION_MINIMIZE)
  }

  function restorePositionAndState(source: QWindowRestoreState = restoreState.value): void {
    states.value.top = source.top
    states.value.left = source.left
    states.value.bottom = source.bottom
    states.value.right = source.right
    setZIndex(source.zIndex)

    setActionState(ACTION_PINNED, source.pinned)
    setActionState(ACTION_EMBEDDED, source.embedded)
    setActionState(ACTION_MAXIMIZE, source.maximize)
    setActionState(ACTION_MINIMIZE, source.minimize)
  }

  return {
    fullscreenRestoreState,
    restoreState,
    restorePositionAndState,
    savePositionAndState,
  }
}
