<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <div class="col">
      <q-window
        v-model="visible"
        title="QWindow Colored Grippers"
        round-grippers
        gripper-border-color="orange"
        gripper-background-color="yellow"
        :height="150"
        :width="350"
        :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
        embedded
        content-class="bg-grey-1"
      >
        <div class="q-pa-md fit">
          This is the "default" slot content
        </div>
      </q-window>
      <q-window
        v-model="visible"
        title="QWindow Colored Grippers"
        round-grippers
        gripper-border-color="purple-8"
        gripper-background-color="purple-2"
        :height="150"
        :width="350"
        :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
        embedded
        content-class="bg-grey-1"
      >
        <div class="q-pa-md fit">
          This is the "default" slot content
        </div>
      </q-window>
      </div>
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
