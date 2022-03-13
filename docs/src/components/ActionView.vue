<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <div id="qwindow" style="background-color: #0d47a1">
dasdad
    </div>

    <q-window
      v-model="showModal"
      title="QWindow Actions"
      :height="150"
      :width="350"
      key="1"
      :actions="showModal ? actions1 : actions1"
      embedded
      content-class="bg-grey-2"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>

    <button id="show-modal" @click="showModal = !showModal">Show Modal</button>


    <div id="qwindow2" style="background-color: #0d47a1">
      dasdad
    </div>

    <q-window
      key="2"
      v-model="showModal"
      title="QWindow Actions"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit" style="background-color: #0d47a1; border: #00c853 solid 1px">
        This is the "default" slot content
      </div>
    </q-window>

  </div>
</template>



<script setup>
import { QWindow } from '@quasar/quasar-ui-qwindow/src/QWindow.js'
import '@quasar/quasar-ui-qwindow/src/index.sass'

import { ref } from 'vue'

let showModal = ref(false)
const visible = ref(true)

const actions1 =['embedded', 'pin', 'maximize', 'fullscreen']
const actions2 =['embedded', 'pin']
</script>

