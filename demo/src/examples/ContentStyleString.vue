<template>
  <div>
    <q-window
      v-model="visible"
      title="QWindow Titlebar Style"
      content-style="border: 1px solid blue, background-color: ghostwhite"
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
