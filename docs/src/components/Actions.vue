<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      title="QWindow Actions"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      content-class="bg-grey-8"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>

<script>
import { QWindow } from '@quasar/quasar-ui-qwindow/src/QWindow.js'
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
