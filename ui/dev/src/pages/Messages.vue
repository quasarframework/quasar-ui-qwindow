<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <div class="col">
      <q-window
        v-model="visible"
        title="QWindow Messages"
        :start-x="100"
        :start-y="100"
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
        @selected="v => messages.unshift(`selected(${v})`)"
        @beforeDrag="v => messages.unshift(`beforeDrag(${v})`)"
        @afterDrag="v => messages.unshift(`afterDrag(${v})`)"
        @position="v => messages.unshift(`position(${JSON.stringify(v)})`)"
      >
        <div class="q-pa-md fit">
          This is the "default" slot content
        </div>
      </q-window>
    </div>
    <q-scroll-area style="height: 200px; font-size: 12px;">
      <q-list dense>
        <q-item
          v-for="(message, index) in messages"
          :key="index"
          dense
          style="height: 15px;"
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
