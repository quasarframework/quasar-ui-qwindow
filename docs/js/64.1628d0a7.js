(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[64],{5117:function(n,t,e){"use strict";e.r(t),t["default"]='<template>\n  <div class="q-ma-md" style="max-width: 800px; width: 100%">\n    <q-window\n      v-model="visible"\n      title="QWindow Titlebar Style"\n      :titlebar-style="{ borderBottom: \'1px solid #BB714F\', fontStyle: \'italic\', fontSize: \'2em\' }"\n      :content-style="{ border: \'1px solid #BB714F\' }"\n      border-width="1px"\n      border-style="solid"\n      color="#BB714F"\n      background-color="#C4C27A"\n      :height="150"\n      :width="350"\n      :actions="[\'embedded\', \'pin\', \'maximize\', \'fullscreen\']"\n      embedded\n    >\n      <div class="q-pa-md fit">\n        This is the "default" slot content\n      </div>\n    </q-window>\n  </div>\n</template>\n\n<script>\nexport default {\n  data () {\n    return {\n      visible: true\n    }\n  }\n}\n<\/script>\n'}}]);