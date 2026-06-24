<template>
  <div class="q-pa-md q-window-native-stage column items-center justify-center">
    <q-window
      ref="windowRef"
      v-model="showing"
      v-model:embedded="embedded"
      v-model:maximized="maximized"
      v-bind="windowProps"
      no-menu
      hide-grippers
      hide-toolbar-divider
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
    >
      <template #titlebar>
        <div class="mac-titlebar row items-center no-wrap">
          <div class="mac-controls row items-center no-wrap">
            <button
              class="mac-control mac-control--close"
              type="button"
              aria-label="Embed macOS window"
              @pointerdown.stop
              @click.stop="dockWindow"
            />
            <span class="mac-control mac-control--minimize" aria-hidden="true" />
            <button
              class="mac-control mac-control--zoom"
              type="button"
              aria-label="Maximize macOS window"
              @pointerdown.stop
              @click.stop="toggleZoom"
            />
          </div>
          <div class="mac-title col text-center">Notes</div>
          <div class="mac-toolbar-spacer row justify-end">
            <button
              class="mac-titlebar-action"
              type="button"
              @pointerdown.stop
              @click.stop="toggleEmbeddedMode"
            >
              {{ embedded ? 'Float' : 'Embed' }}
            </button>
          </div>
        </div>
      </template>

      <div class="mac-window row no-wrap">
        <aside class="mac-sidebar">
          <div class="mac-sidebar-title">Favorites</div>
          <button
            v-for="item in folders"
            :key="item"
            class="mac-folder"
            :class="{ 'mac-folder--active': item === activeFolder }"
            type="button"
            @click="activeFolder = item"
          >
            {{ item }}
          </button>
        </aside>

        <section class="mac-content">
          <div class="text-caption text-blue-grey-5 q-mb-xs">{{ activeFolder }}</div>
          <h3>Project Brief</h3>
          <p>Keep floating work surfaces compact, readable, and close to the task they support.</p>
          <div class="mac-card">
            <span class="mac-card-dot" />
            Native-style chrome can still use QWindow resizing, movement, and state events.
          </div>
        </section>
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { QWindow, useQWindowResponsiveProps } from '@quasar/quasar-ui-qwindow'
import '@quasar/quasar-ui-qwindow/src/index.scss'

type WindowRef = {
  embed: () => boolean
  float: () => boolean
  restore: () => boolean
  toggleMaximized: () => boolean
}

const windowRef = ref<WindowRef | null>(null)
const showing = ref(true)
const embedded = ref(true)
const maximized = ref(false)
const activeFolder = ref('Today')
const folders = ['Today', 'Pinned', 'Archive']
const windowProps = useQWindowResponsiveProps({
  width: 720,
  height: 340,
  startX: 96,
  startY: 132,
  mobileWidth: 340,
  mobileHeight: 440,
  mobileStartX: 16,
  mobileStartY: 88,
})

async function dockWindow() {
  if (maximized.value === true) {
    windowRef.value?.restore()
    await nextTick()
  }

  windowRef.value?.embed()
}

async function toggleEmbeddedMode() {
  if (embedded.value === true) {
    windowRef.value?.float()
    return
  }

  await dockWindow()
}

async function toggleZoom() {
  if (embedded.value === true) {
    windowRef.value?.float()
    await nextTick()
  }

  windowRef.value?.toggleMaximized()
}

const windowStyle = {
  border: '1px solid rgba(15, 23, 42, 0.16)',
  borderRadius: '18px',
  overflow: 'hidden',
  boxShadow: '0 22px 60px rgba(15, 23, 42, 0.22)',
}

const titlebarStyle = {
  background: 'rgba(246, 248, 251, 0.92)',
  color: '#111827',
  borderTopLeftRadius: '18px',
  borderTopRightRadius: '18px',
}
</script>

<style lang="scss" scoped>
.q-window-native-stage {
  min-height: 460px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc 48%, #eef2ff);
}

.mac-titlebar {
  width: 100%;
  height: 100%;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
}

.mac-controls {
  gap: 8px;
  width: 76px;
}

.mac-control {
  width: 12px;
  height: 12px;
  display: block;
  padding: 0;
  border: 0;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.16);
}

button.mac-control,
.mac-titlebar-action {
  cursor: pointer;
}

.mac-control--close {
  position: relative;
  background-color: #ff5f57;
}

.mac-control--close::before,
.mac-control--close::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 3px;
  width: 6px;
  height: 1.5px;
  border-radius: 999px;
  background-color: rgba(92, 16, 16, 0.68);
}

.mac-control--close::before {
  transform: rotate(45deg);
}

.mac-control--close::after {
  transform: rotate(-45deg);
}

.mac-control--minimize {
  background-color: #ffbd2e;
}

.mac-control--zoom {
  background-color: #28c840;
}

.mac-toolbar-spacer {
  width: 76px;
}

.mac-titlebar-action {
  padding: 3px 9px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 999px;
  color: #334155;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.72);
}

.mac-titlebar-action:hover {
  background: #ffffff;
}

.mac-window {
  width: 100%;
  height: 100%;
  background: #f8fafc;
}

.mac-sidebar {
  width: 150px;
  padding: 18px 12px;
  color: #334155;
  background: rgba(226, 232, 240, 0.68);
  border-right: 1px solid rgba(148, 163, 184, 0.3);
}

.mac-sidebar-title {
  margin: 0 8px 10px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mac-folder {
  width: 100%;
  padding: 7px 10px;
  border: 0;
  border-radius: 8px;
  color: inherit;
  font: inherit;
  text-align: left;
  background: transparent;
}

.mac-folder--active {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.mac-content {
  flex: 1 1 auto;
  min-width: 0;
  padding: 30px;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.92);
}

.mac-content h3 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 24px;
}

.mac-content p {
  max-width: 460px;
  margin: 0 0 18px;
  line-height: 1.55;
}

.mac-card {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 420px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 12px;
  color: #334155;
  background: #f8fafc;
}

.mac-card-dot {
  width: 10px;
  height: 10px;
  flex: none;
  border-radius: 999px;
  background: #0ea5e9;
}

@media (max-width: 599px) {
  .q-window-native-stage {
    min-height: 430px;
    padding: 12px;
  }

  .mac-window {
    flex-direction: column;
  }

  .mac-sidebar {
    width: 100%;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  }

  .mac-sidebar-title {
    display: none;
  }

  .mac-folder {
    width: auto;
    white-space: nowrap;
  }

  .mac-content {
    padding: 22px;
  }
}
</style>
