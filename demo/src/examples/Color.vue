<template>
  <div>
    <q-window
      v-model="visible"
      title="QWindow Color"
      color="yellow-2"
      background-color="blue-grey-4"
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
