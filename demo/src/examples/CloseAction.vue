<template>
  <div>
    <q-window
      v-if="visible === true"
      ref="window"
      title="QWindow Close Action"
      :height="300"
      :width="200"
      fixed-position
      :actions="['embedded', 'pin', 'maximize', 'fullscreen', 'close']"
      embedded
      contentClass="bg-grey-1"
      @visible="(v) => visible = v"
    >
      <div class="q-ma-md">
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
