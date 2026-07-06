import { ref } from 'vue'

let activeZIndex = 0

export default function useWindowStack(startingZIndex: number) {
  if (activeZIndex < startingZIndex) {
    activeZIndex = startingZIndex
  }

  const selected = ref(false)
  const zIndex = ref(startingZIndex)

  function bringToFront() {
    activeZIndex += 1
    zIndex.value = activeZIndex
    selected.value = true
  }

  function clearSelected() {
    selected.value = false
  }

  function setSelected(value: boolean) {
    selected.value = value
  }

  function setZIndex(value: number) {
    zIndex.value = value
    if (value > activeZIndex) {
      activeZIndex = value
    }
  }

  return {
    bringToFront,
    clearSelected,
    selected,
    setSelected,
    setZIndex,
    zIndex,
  }
}
