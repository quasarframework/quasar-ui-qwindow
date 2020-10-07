<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      no-resize
      title="QWindow No Resize"
      :height="150"
      :width="350"
      :actions="['embedded']"
      embedded
      :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
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
