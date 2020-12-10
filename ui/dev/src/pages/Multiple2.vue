<template>
<div class="q-ma-md multiple2" style="max-width: 800px; width: 100%">
  <div class="col">
    <q-window
      v-model="visible"
      title="YELLOW"
      round-grippers
      gripper-border-color="orange"
      gripper-background-color="orange"
      :height="150"
      :width="350"
      :start-x="50"
      :start-y="15"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
    >
      <div class="q-pa-md fit">
      </div>
    </q-window>
    <q-window
      v-model="visible"
      title="PURPLE"
      round-grippers
      gripper-border-color="purple-8"
      gripper-background-color="purple-2"
      :height="150"
      :width="350"
      :start-x="100"
      :start-y="18"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
    >
      <div class="q-pa-md fit">
      </div>
    </q-window><q-window
      v-model="visible"
      title="RED"
      round-grippers
      gripper-border-color="red-8"
      gripper-background-color="red-5"
      :height="250"
      :width="350"
      :start-x="180"
      :start-y="25"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
    >
      <div class="q-pa-md fit">
        <p>Step 1: Click titlebar here <span class="arrow">&#8627;</span></p>
        <p>Step 2: Click titlebar here ------------------------ <span class="arrow">&#8627;</span></p>
        <p>Notice the selection of windows passing deep</p>
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

<style lang="sass">
.arrow
  font-weight: bold
  transform: rotate(-90deg)
  display: inline-block
  font-size: 32px
  line-height: 0

.multiple2 ::v-deep .q-window__selected
  border-color: red !important

.multiple2 ::v-deep .q-window
  border-width: 4px !important
</style>
