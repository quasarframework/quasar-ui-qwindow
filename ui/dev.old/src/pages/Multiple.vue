<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      title="QWindow Basic"
      :height="150"
      :width="350"
      :actions="['embedded']"
      embedded
      :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1' + ' q-mt-md'"
      style="height: 100px;"
    >
      <div class="q-pa-md fit">
        Window 1
      </div>
    </q-window>
    <q-window
      v-model="visible"
      title="QWindow Basic"
      :height="150"
      :width="350"
      :actions="['embedded']"
      embedded
      :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1' + ' q-mt-md'"
      style="height: 100px;"
    >
      <div class="q-pa-md fit">
        Window 2
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
