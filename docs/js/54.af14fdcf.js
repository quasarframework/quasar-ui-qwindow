(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[54],{"9e68":function(n,e,a){"use strict";a.r(e),e["default"]="<template>\n  <div class=\"q-ma-md\" style=\"max-width: 800px; width: 100%\">\n    <q-window\n      v-model=\"visible\"\n      title=\"QWindow Icons and Language\"\n      :iconSet=\"iconSet\"\n      :start-x=\"100\"\n      :start-y=\"100\"\n      :height=\"150\"\n      :width=\"350\"\n      :actions=\"['embedded', 'pin', 'maximize', 'fullscreen']\"\n      embedded\n      content-class=\"bg-grey-1\"\n    >\n      <div class=\"q-pa-md fit\">\n        This is the \"default\" slot content\n      </div>\n    </q-window>\n  </div>\n</template>\n\n<script>\nexport default {\n  data () {\n    return {\n      visible: true,\n      iconSet: {\n        visible: {\n          on: {\n            icon: 'fas fa-eye',\n            label: 'Show Me!'\n          },\n          off: {\n            icon: 'fas fa-eye-slash',\n            label: 'Hide Me!'\n          }\n        },\n        embedded: {\n          on: {\n            icon: 'fas fa-lock',\n            label: 'Embed Me!'\n          },\n          off: {\n            icon: 'fas fa-unlock',\n            label: 'Float Me!'\n          }\n        },\n        pinned: {\n          on: {\n            icon: 'fas fa-map-marker',\n            label: 'Pin Me!'\n          },\n          off: {\n            icon: 'fas fa-map-marker-alt',\n            label: 'Unpin Me!'\n          }\n        },\n        maximize: {\n          on: {\n            icon: 'fas fa-window-maximize',\n            label: 'To the Max!'\n          },\n          off: {\n            icon: 'fas fa-window-restore',\n            label: 'Restore me!'\n          }\n        },\n        fullscreen: {\n          on: {\n            icon: 'fas fa-expand',\n            label: 'Enter fullscreen mode'\n          },\n          off: {\n            icon: 'fas fa-compress',\n            label: 'Leave fullscreen mode'\n          }\n        }\n      }\n    }\n  }\n}\n<\/script>\n"}}]);