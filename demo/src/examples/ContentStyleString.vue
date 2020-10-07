<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      title="QWindow Titlebar Style"
      :content-style="$q.dark.isActive ? 'border: 1px solid yellow, background-color: gray' : 'border: 1px solid blue, background-color: ghostwhite'"
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
