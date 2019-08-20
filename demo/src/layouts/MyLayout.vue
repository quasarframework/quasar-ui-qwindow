<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Essential Links</q-item-label>
        <q-item clickable tag="a" target="_blank" href="https://quasar.dev">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Docs</q-item-label>
            <q-item-label caption>quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://github.quasar.dev">
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Github</q-item-label>
            <q-item-label caption>github.com/quasarframework</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://chat.quasar.dev">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Discord Chat Channel</q-item-label>
            <q-item-label caption>chat.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://forum.quasar.dev">
          <q-item-section avatar>
            <q-icon name="record_voice_over" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Forum</q-item-label>
            <q-item-label caption>forum.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://twitter.quasar.dev">
          <q-item-section avatar>
            <q-icon name="rss_feed" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Twitter</q-item-label>
            <q-item-label caption>@quasarframework</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" target="_blank" href="https://facebook.quasar.dev">
          <q-item-section avatar>
            <q-icon name="public" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Facebook</q-item-label>
            <q-item-label caption>@QuasarFramework</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div style="width: 100%; height: 500px;">
        <q-separator />
        <q-window
        v-if="visible === true"
        ref="window"
        title="Quasar Embedded Layout"
        :height="500"
        :width="600"
        :actions="actions"
        :embedded="embedded"
        :visible="visible"
        :pinned="pinned"
        :menu-func="updateMenu"
        content-class="bg-grey-1"
        @embedded="(v) => embedded = v"
        @visible="(v) => visible = v"
        @pinned="(v) => pinned = v"
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
      <q-btn
        v-else
        label="Show Window"
        @click="visible = true"
        style="width: 100%;"
      />
    </div>

    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      embedded: true,
      visible: true,
      pinned: false,
      actions: ['pin', 'embed', 'minimize', 'maximize', 'close', 'fullscreen'],
      drawerLeft: false,
      drawerRight: true
    }
  },
  methods: {
    updateMenu (menuItems) {
      if (this.$refs.window.isEmbedded !== true && this.$refs.window.isFullscreen !== true) {
        if (menuItems[menuItems.length - 1].key === 'visible') {
          menuItems.splice(menuItems.length - 1, 0, 'separator')
        }
        let sendToBack = {
          key: 'sendtoback',
          state: false,
          on: {
            label: 'Send to Back',
            icon: '',
            func: this.sendToBack
          },
          off: {
            label: 'Send to Back',
            icon: '',
            func: this.sendToBack
          }
        }
        let bringToFront = {
          key: 'bringtofront',
          state: false,
          on: {
            label: 'Bring to Front',
            icon: '',
            func: this.bringToFront
          },
          off: {
            label: 'Bring to Front',
            icon: '',
            func: this.bringToFront
          }
        }
        menuItems.splice(menuItems.length - 1, 0, 'separator')
        menuItems.splice(menuItems.length - 2, 0, sendToBack)
        menuItems.splice(menuItems.length - 2, 0, bringToFront)
      }
    },
    bringToFront () {
      this.$refs.window.bringToFront()
    },
    sendToBack () {
      this.$refs.window.sendToBack()
    }
  }
}
</script>

<style>
</style>
