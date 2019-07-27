<template>
  <div>
    <q-window
      v-model="visible"
      title="QWindow Border"
      border-width="3px"
      border-style="dashed"
      color="#C4C27A"
      background-color="#BB714F"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
    >
      <div class="q-ma-md">
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
  }
}
</script>
