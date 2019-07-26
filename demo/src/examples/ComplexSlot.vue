<template>
  <div>
    <q-window
      title="QWindow Complex Slot"
      :height="600"
      :width="400"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      contentClass="bg-grey-1"
    >
      <template #default="{ zIndex }">
        <div class="fit">
          <q-layout view="lhh LpR lff" container style="height: 100%" class="shadow-2 rounded-borders">
            <q-header reveal class="bg-black">
              <q-toolbar>
                <q-btn flat @click="drawerLeft = !drawerLeft" round dense icon="menu" />
                <q-toolbar-title>Header</q-toolbar-title>
                <q-btn flat @click="drawerRight = !drawerRight" round dense icon="menu" />
              </q-toolbar>
            </q-header>

            <q-footer>
              <q-toolbar>
                <q-toolbar-title>Footer</q-toolbar-title>
              </q-toolbar>
            </q-footer>

            <q-drawer
              v-model="drawerLeft"
              :width="350"
              :breakpoint="700"
              bordered
              content-class="bg-grey-3"
              :style="{ zIndex: zIndex + 1 }"
            >
              <q-scroll-area class="fit">
                <div class="q-pa-sm">
                  <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
                </div>
              </q-scroll-area>
            </q-drawer>

            <q-drawer
              side="right"
              v-model="drawerRight"
              bordered
              :width="350"
              :breakpoint="500"
              content-class="bg-grey-3"
              :style="{ zIndex: zIndex + 1 }"
            >
              <q-scroll-area class="fit">
                <div class="q-pa-sm">
                  <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
                </div>
              </q-scroll-area>
            </q-drawer>

            <q-page-container>
              <q-page style="padding-top: 60px" class="q-pa-md">
                <q-markdown>
  Some information about **QWindow**:
  1. If it starts off embedded, but you can `unlock` it from the menu to make it `float`
  2. If floating, you can `embed` it back again
  3. If floating, you can move it around (via caption), or resize it (via sides and corners)
  4. If a QWindow is embeddable, you can `close` it while in embedded or floating states. It is up to the developer to provide a way to bring it back (ex: via a QBtn - close this window and try it!)
  5. You can enter fullscreen mode (currently while floating)
  6. The menu can be manipulated in devland. Notice the "Bring to Front" and "Send to Back" functions (while floating)
  7. QWindow is embeddable anywhere like a normal HTML element. It displayes slotted content provided by the developer
  8. On any move or resize (while floating), `position` is emitted with `{x, y, width, height }` values
  9. If initial `startX`, `startY`, `width` and `height` are not given, defaults will be used. The algorithm always makes sure two windows do not completely overlap each other on initial render
  10. There is a special property `bring-to-front-after-drag` that ensures a dragged/resized window always remains on top
                  </q-markdown>

                  <q-page-sticky position="top" expand class="bg-accent text-white">
                    <q-toolbar>
                      <q-btn flat round dense icon="map" />
                      <q-toolbar-title>Title</q-toolbar-title>
                    </q-toolbar>
                  </q-page-sticky>
                </q-page>

                <q-page-scroller position="bottom">
                  <q-btn fab icon="keyboard_arrow_up" color="red" />
                </q-page-scroller>
              </q-page-container>
            </q-layout>
          </div>
        </template>
    </q-window>
  </div>
</template>

<script>
export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      drawerLeft: false,
      drawerRight: true
    }
  }
}
</script>
