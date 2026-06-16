<template>
  <div class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      QWindow emits lifecycle-style events for visibility, selection, dragging, position, and state
      changes. This is useful when window state should be persisted or mirrored elsewhere.
    </div>

    <div>
      <q-btn color="deep-purple" unelevated label="Open event window" @click="showing = true" />
    </div>

    <q-window
      v-model="showing"
      v-bind="windowProps"
      title="Event Logger"
      :actions="windowActions"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
      @update:model-value="logBoolean('visible', $event)"
      @show="logText('show')"
      @hide="logText('hide')"
      @embedded="logBoolean('embedded', $event)"
      @pinned="logBoolean('pinned', $event)"
      @maximize="logBoolean('maximize', $event)"
      @fullscreen="logBoolean('fullscreen', $event)"
      @selected="logBoolean('selected', $event)"
      @before-drag="logText('beforeDrag')"
      @after-drag="logText('afterDrag')"
      @position="logPosition"
      @canceled="logPosition"
    >
      <div class="event-window column q-gutter-md">
        <div class="text-body2 text-blue-grey-8">
          Open, move, or resize this window to log lifecycle and position payloads. Pin, maximize,
          fullscreen, or close it to log state events.
        </div>
      </div>
    </q-window>

    <q-card flat bordered class="event-log">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="text-subtitle2 text-weight-bold">Latest events</div>
        <q-btn flat dense color="deep-purple" label="Clear" @click="messages = []" />
      </q-card-section>

      <q-card-section>
        <q-list dense separator>
          <q-item v-for="(message, index) in messages" :key="`${message}-${index}`">
            <q-item-section>{{ message }}</q-item-section>
          </q-item>
          <q-item v-if="messages.length === 0">
            <q-item-section class="text-blue-grey-6">No events yet</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QWindow, useQWindowResponsiveProps } from '@quasar/quasar-ui-qwindow'
import '@quasar/quasar-ui-qwindow/src/index.scss'

type PositionPayload = {
  left?: number
  top?: number
  width?: number
  height?: number
}

const showing = ref(false)
const messages = ref<string[]>([])
const windowActions = ['pinned', 'maximize', 'fullscreen', 'close']
const windowProps = useQWindowResponsiveProps({
  width: 390,
  height: 220,
  startX: 118,
  startY: 132,
  mobileWidth: 320,
  mobileHeight: 230,
  mobileStartY: 104,
})

function addMessage(message: string) {
  messages.value = [message, ...messages.value].slice(0, 8)
}

function logBoolean(name: string, value: boolean) {
  addMessage(`${name}: ${value}`)
}

function logText(name: string) {
  addMessage(name)
}

function logPosition(position: PositionPayload) {
  addMessage(
    `position: ${Math.round(position.left ?? 0)}, ${Math.round(position.top ?? 0)} / ${Math.round(
      position.width ?? 0,
    )} x ${Math.round(position.height ?? 0)}`,
  )
}

const windowStyle = {
  background: '#f8fafc',
  borderColor: '#a78bfa',
  borderRadius: '16px',
}

const titlebarStyle = {
  background: 'linear-gradient(90deg, #4c1d95, #6d28d9)',
  color: '#faf5ff',
  borderColor: 'rgba(255, 255, 255, 0.16)',
  borderTopLeftRadius: '14px',
  borderTopRightRadius: '14px',
}
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 520px;
  overflow: visible;
}

.demo-copy {
  max-width: 760px;
  color: #607d8b;
}

.event-window {
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 18px;
  overflow-y: auto;
  background-color: #f8fafc;
}

.event-log {
  max-width: 640px;
  background: #fbfafc;
}
</style>
