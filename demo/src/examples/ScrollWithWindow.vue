<template>
  <div>
    <q-window
      v-model="visible"
      title="QWindow Scroll With Window"
      scroll-with-window
      :height="150"
      :width="350"
      :actions="['embedded']"
      embedded
      content-class="bg-grey-1"
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
