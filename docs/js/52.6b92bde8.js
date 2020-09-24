(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[52],{"060b":function(n,e,t){"use strict";t.r(e),e["default"]='<template>\n  <div class="q-ma-md" style="max-width: 800px; width: 100%">\n    <div class="col">\n      <q-btn\n        color="primary"\n        label="Menu"\n        flat\n        @click="menuClicked"\n      />\n      <div>\n        <q-menu v-model="showMenu">\n          <q-list\n            style="min-width: 100px"\n          >\n            <q-item\n              v-for="menuItem in menuData"\n              clickable\n              dense\n              v-close-popup\n              :key="menuItem.key"\n              @click="menuItem.state === true ? menuItem.off.func() : menuItem.on.func()"\n            >\n              <q-item-section no-wrap>\n                {{ menuItem.state === true ? menuItem.off.label : menuItem.on.label }}\n              </q-item-section>\n              <q-item-section avatar>\n                <q-icon :name="menuItem.state === true ? menuItem.off.icon : menuItem.on.icon" />\n              </q-item-section>\n            </q-item>\n          </q-list>\n        </q-menu>\n      </div>\n      <q-window\n        ref="window"\n        v-model="visible"\n        headless\n        auto-pin\n        title="QWindow Wrap Up"\n        :start-x="200"\n        :start-y="200"\n        :height="150"\n        :width="350"\n        :actions="[\'embedded\', \'pin\', \'fullscreen\']"\n        embedded\n        content-class="bg-grey-1"\n      >\n        <div class="q-pa-md fit">\n          This is the "default" slot content\n        </div>\n      </q-window>\n    </div>\n  </div>\n</template>\n\n<script>\nexport default {\n  data () {\n    return {\n      visible: true,\n      showMenu: false,\n      menuData: []\n    }\n  },\n  methods: {\n    menuClicked () {\n      // everytime the menu is clicked, retrieve the computedMenuData from QWindow\n      this.menuData = this.$refs.window.computedMenuData\n      // tell QMenu to show the menu\n      this.showMenu = true\n    }\n  }\n}\n<\/script>\n'}}]);