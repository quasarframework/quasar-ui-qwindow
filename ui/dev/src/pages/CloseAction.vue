<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      ref="window"
      v-model="visible"
      title="QWindow Close Action"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen', 'close']"
      embedded
      content-class="bg-grey-1"
      @visible="(v) => visible = v"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
    <q-btn
      v-if="canShowButton === true"
      label="Show Window"
      color="primary"
      @click="visible = true"
      style="width: 100%;"
    />
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
    canShowButton () {
      if (this.visible !== true) {
        return true
      }
      return false
    }
  }
}
</script>
