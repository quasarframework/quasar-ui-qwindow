<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      title="QWindow Titlebar Style"
      :content-style="[style1, style2]"
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
    style1 () {
      return {
        border: this.$q.dark.isActive ? '1px solid yellow' : '1px solid blue'
      }
    },
    style2 () {
      return {
        backgroundColor: this.$q.dark.isActive ? 'gray' : 'ghostwhite'
      }
    }
  }
}
</script>
