(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[43],{8788:function(n,e,t){"use strict";t.r(e),e["default"]='<template>\n  <div class="q-ma-md" style="max-width: 800px; width: 100%">\n    <q-window\n      v-model="visible"\n      title="QWindow Complex Slot"\n      :height="600"\n      :width="400"\n      :actions="[\'embedded\', \'pin\', \'maximize\', \'fullscreen\']"\n      embedded\n      content-class="bg-grey-1"\n    >\n      <template #default="{ zIndex }">\n        <div class="fit">\n          <q-layout view="lhh LpR lff" container style="height: 100%" class="shadow-2 rounded-borders">\n            <q-header reveal class="bg-black">\n              <q-toolbar>\n                <q-btn flat @click="drawerLeft = !drawerLeft" round dense icon="menu" />\n                <q-toolbar-title>Header</q-toolbar-title>\n                <q-btn flat @click="drawerRight = !drawerRight" round dense icon="menu" />\n              </q-toolbar>\n            </q-header>\n\n            <q-footer>\n              <q-toolbar>\n                <q-toolbar-title>Footer</q-toolbar-title>\n              </q-toolbar>\n            </q-footer>\n\n            <q-drawer\n              v-model="drawerLeft"\n              :width="350"\n              :breakpoint="700"\n              bordered\n              content-class="bg-grey-3"\n              :style="{ zIndex: zIndex + 1 }"\n            >\n              <q-scroll-area class="fit">\n                <div class="q-pa-sm">\n                  <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>\n                </div>\n              </q-scroll-area>\n            </q-drawer>\n\n            <q-drawer\n              side="right"\n              v-model="drawerRight"\n              bordered\n              :width="350"\n              :breakpoint="500"\n              content-class="bg-grey-3"\n              :style="{ zIndex: zIndex + 1 }"\n            >\n              <q-scroll-area class="fit">\n                <div class="q-pa-sm">\n                  <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>\n                </div>\n              </q-scroll-area>\n            </q-drawer>\n\n            <q-page-container>\n              <q-page style="padding-top: 60px" class="q-pa-md">\n                <q-markdown>\n  Some information about **QWindow**:\n  1. If it starts off embedded, but you can `unlock` it from the menu to make it `float`\n  2. If floating, you can `embed` it back again\n  3. If floating, you can move it around (via caption), or resize it (via sides and corners)\n  4. If a QWindow is embeddable, you can `close` it while in embedded or floating states. It is up to the developer to provide a way to bring it back (ex: via a QBtn - close this window and try it!)\n  5. You can enter fullscreen mode (currently while floating)\n  6. The menu can be manipulated in devland. Notice the "Bring to Front" and "Send to Back" functions (while floating)\n  7. QWindow is embeddable anywhere like a normal HTML element. It displayes slotted content provided by the developer\n  8. On any move or resize (while floating), `position` is emitted with `{x, y, width, height }` values\n  9. If initial `startX`, `startY`, `width` and `height` are not given, defaults will be used. The algorithm always makes sure two windows do not completely overlap each other on initial render\n                  </q-markdown>\n\n                  <q-page-sticky position="top" expand class="bg-accent text-white">\n                    <q-toolbar>\n                      <q-btn flat round dense icon="map" />\n                      <q-toolbar-title>Title</q-toolbar-title>\n                    </q-toolbar>\n                  </q-page-sticky>\n                </q-page>\n\n                <q-page-scroller position="bottom">\n                  <q-btn fab icon="keyboard_arrow_up" color="red" />\n                </q-page-scroller>\n              </q-page-container>\n            </q-layout>\n          </div>\n        </template>\n    </q-window>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: \'ComplexSlot\',\n  data () {\n    return {\n      visible: true,\n      drawerLeft: false,\n      drawerRight: false\n    }\n  }\n}\n<\/script>\n'}}]);