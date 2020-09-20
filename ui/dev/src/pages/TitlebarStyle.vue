<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      title="QWindow Titlebar Style"
      :titlebar-style="{ borderBottom: '1px solid #BB714F', fontStyle: 'italic', fontSize: '2em' }"
      :content-style="{ border: '1px solid #BB714F' }"
      border-width="1px"
      border-style="solid"
      color="#BB714F"
      background-color="#C4C27A"
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
  }
}
</script>
