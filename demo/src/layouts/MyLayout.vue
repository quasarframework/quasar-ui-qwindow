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
        contentClass="bg-grey-1"
        :height="500"
        :width="600"
        :actions="actions"
        :embedded="embedded"
        :visible="visible"
        :pinned="pinned"
        title="Quasar Embedded Layout"
        @embedded="(v) => embedded = v"
        @visible="(v) => visible = v"
        @pinned="(v) => pinned = v"
      >
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
              :width="200"
              :breakpoint="700"
              bordered
              content-class="bg-grey-3"
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
              :width="200"
              :breakpoint="500"
              content-class="bg-grey-3"
            >
              <q-scroll-area class="fit">
                <div class="q-pa-sm">
                  <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
                </div>
              </q-scroll-area>
            </q-drawer>

            <q-page-container>
              <q-page style="padding-top: 60px" class="q-pa-md">
                <p v-for="n in 15" :key="n">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit nihil praesentium molestias a adipisci, dolore vitae odit, quidem consequatur optio voluptates asperiores pariatur eos numquam rerum delectus commodi perferendis voluptate?
                </p>

                <q-page-sticky position="top-left" :offset="[18, 68]">
                  <q-btn round color="primary" icon="arrow_back" class="rotate-45" />
                </q-page-sticky>
                <q-page-sticky position="top-right" :offset="[18, 68]">
                  <q-btn round color="primary" icon="arrow_upward" class="rotate-45" />
                </q-page-sticky>
                <q-page-sticky position="bottom-left" :offset="[18, 18]">
                  <q-btn round color="primary" icon="arrow_forward" class="rotate-135" />
                </q-page-sticky>
                <q-page-sticky position="bottom-right" :offset="[18, 18]">
                  <q-btn round color="primary" icon="arrow_forward" class="rotate-45" />
                </q-page-sticky>

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
import { openURL } from 'quasar'

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
    openURL
  }
}
</script>

<style>
</style>
