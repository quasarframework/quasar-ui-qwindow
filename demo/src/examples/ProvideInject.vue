<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <component-provide>
      <q-window
        ref="window"
        v-model="visible"
        title="QWindow Provide/Inject 1"
        :start-x="200"
        :start-y="200"
        :height="150"
        :width="350"
        :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
        embedded
        :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
      >
        <div class="q-pa-sm">
          <component-inject/>
          <div>This is the "default" slot content</div>
        </div>
      </q-window>
      <q-window
        ref="window"
        v-model="visible"
        title="QWindow Provide/Inject 2"
        :start-x="220"
        :start-y="220"
        :height="150"
        :width="350"
        :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
        embedded
        :content-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
      >
        <div class="q-pa-sm">
          <component-provide>
            <component-inject/>
            <div>This is the "default" slot content</div>
          </component-provide>
        </div>
      </q-window>
      <div class="q-pa-sm">
        <q-markdown>
Below is the **injected** data:
        </q-markdown>
        <component-inject/>
      </div>
    </component-provide>
  </div>
</template>

<script>
export default {
  components: {
    'component-inject': () => import('../components/ComponentInject'),
    'component-provide': () => import('../components/ComponentProvide')
  },
  data () {
    return {
      visible: true
    }
  }
}
</script>
