<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <q-window
      v-model="visible"
      :resizable="['top', 'left', 'bottom', 'top-left', 'bottom-left']"
      title="QWindow No Resize Right"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
    <q-window
      v-model="visible"
      :resizable="['bottom-right', 'top', 'bottom', 'top-right', 'right']"
      title="QWindow No Resize Left"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
    <q-window
      v-model="visible"
      :resizable="['bottom-right', 'bottom-left', 'bottom', 'right', 'left']"
      title="QWindow No Resize Top"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
    <q-window
      v-model="visible"
      :resizable="['right', 'top', 'left', 'top-right', 'top-left']"
      title="QWindow No Resize Bottom"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
    <q-window
      v-model="visible"
      :resizable="['right', 'bottom-right', 'bottom']"
      title="QWindow Resize Bottom and Right"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin']"
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
