<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <div id="qwindow">

    </div>

    <q-window
      v-model="visible"
      title="QWindow Actions"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>

<script>
import { QWindow } from '@quasar/quasar-ui-qwindow/src/QWindow.js'
import '@quasar/quasar-ui-qwindow/src/index.sass'
export default {
  components: {
    QWindow
  },
  data () {
    return {
      visible: true
    }
  }
}
</script>
