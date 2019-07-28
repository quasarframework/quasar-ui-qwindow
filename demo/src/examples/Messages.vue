<template>
  <div>
    <q-window
      v-model="visible"
      title="QWindow Actions"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      content-class="bg-grey-1"
      @input="v => messages.unshift(`visible(${v})`)"
      @embedded="v => messages.unshift(`embedded(${v})`)"
      @pinned="v => messages.unshift(`pinned(${v})`)"
      @maximize="v => messages.unshift(`maximize(${v})`)"
      @fullscreen="v => messages.unshift(`fullscreen(${v})`)"
      @position="v => messages.unshift(`position(${JSON.stringify(v)})`)"
    >
      <div class="q-ma-md">
        This is the "default" slot content
      </div>
    </q-window>
    <q-scroll-area style="height: 200px">
      <q-list dense>
        <q-item
          v-for="(message, index) in messages"
          :key="index"
          dense
        >
          <q-item-section no-wrap>{{ message }}</q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script>
export default {
  data () {
    return {
      visible: true,
      messages: []
    }
  }
}
</script>
