<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      title="QWindow Titlebar Style"
      :content-style="style"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>

<script>
export default {
  data () {
    return {
      visible: true
    }
  },
  computed: {
    style () {
      return {
        border: '1px solid blue',
        backgroundColor: 'ghostwhite'
      }
    }
  }
}
</script>
