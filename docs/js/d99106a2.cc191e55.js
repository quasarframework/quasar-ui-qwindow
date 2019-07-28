(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["d99106a2"],{2514:function(e,n,t){"use strict";var o=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("div",[t("section",{staticClass:"page-header"},[t("h1",{staticClass:"project-name"},[e._v("QWindow")]),t("h2",{staticClass:"project-tagline"}),t("q-btn",{staticClass:"btn",attrs:{type:"a",href:"https://github.com/hawkeye64/app-extension-qwindow",target:"_blank",label:"View on GitHub","no-caps":"",flat:""}}),t("q-btn",{staticClass:"btn",attrs:{to:"/docs",label:"Docs","no-caps":"",flat:""}}),t("q-btn",{staticClass:"btn",attrs:{to:"/examples",label:"Examples","no-caps":"",flat:""}}),t("q-btn",{staticClass:"btn",attrs:{type:"a",href:"https://donate.quasar.dev",target:"_blank",label:"Donate","no-caps":"",flat:""}})],1),t("main",{staticClass:"flex flex-start justify-center inset-shadow"},[t("div",{staticClass:"q-pa-md col-12-sm col-8-md col-6-lg inset-shadow",staticStyle:{width:"100%",height:"3px"}}),t("div",{staticClass:"q-pa-md col-12-sm col-8-md col-6-lg bg-white shadow-1",staticStyle:{"max-width":"800px",width:"100%"}},[e._t("default")],2)])])},i=[],a={name:"Hero"},s=a,r=t("2877"),l=Object(r["a"])(s,o,i,!1,null,null,null);n["a"]=l.exports},"8b24":function(e,n,t){"use strict";t.r(n);var o=function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("hero",[t("q-markdown",{attrs:{src:e.markdown,toc:""},on:{data:e.onToc}})],1)},i=[],a=t("2514"),s="QWindow\n===\n\nQWindow is a [Quasar App Extension](https://quasar.dev/app-extensions/introduction). It allows you to have a floating, movable, and resizable HTML window in your Quasar App.\n\n# Install\nTo add this App Extension to your Quasar application, run the following (in your Quasar app folder):\n```\nquasar ext add qwindow\n```\n\n# Uninstall\nTo remove this App Extension from your Quasar application, run the following (in your Quasar app folder):\n```\nquasar ext remove qwindow\n```\n\n# Describe\nYou can use `quasar describe QWindow`\n\n# Docs\nCan be found [here](https://hawkeye64.github.io/app-extension-qwindow).\n\n# Examples\nCan be found [here](https://hawkeye64.github.io/app-extension-qwindow/examples).\n\n# Interactive Demo\nCan be found [here](https://hawkeye64.github.io/app-extension-qwindow/demo).\n\n# Demo (source) Project\nCan be found [here](https://github.com/hawkeye64/app-extension-qwindow/tree/master/demo).\n\n# Working with QWindow\nWorking with QWindow can be very minimal. Almost all essential properties have defaults. Here is an example of using QWindow:\n```html\n  <q-window\n    v-model=\"visible\"\n    title=\"QWindow Basic\"\n    :actions=\"['embedded']\"\n    content-class=\"bg-grey-1\"\n  >\n    <div class=\"q-pa-md fit\">\n      This is the \"default\" slot content\n    </div>\n  </q-window>\n```\n\nIn the example above, QWindow is not gven the `start-x` and `start-y` positions. In this case, QWindow uses an algorithm that prevents multiple instantiated windows from sitting on top of each other (the x and x are offset).\n\nIt is a good idea to provide the `content-class` unless your slotted content can control the background and foreground colors, otherwise your content background may be transparent.\n\n## Embedding and Floating\nIn the above example, the QWindow will immediately be floating. If you want it embedded, simply provide the `embedded` property.\n\n```html\n  <q-window\n    v-model=\"visible\"\n    title=\"QWindow Basic\"\n    embedded\n    :actions=\"['embedded']\"\n    content-class=\"bg-grey-1\"\n  >\n    <div class=\"q-pa-md fit\">\n      This is the \"default\" slot content\n    </div>\n  </q-window>\n```\n\nYou can set the initial state by providing one of the following: `embedded`, `pinned`, `maximize`, `fullscreen`. Some states conflict, so if one is detected before the other, then the first state will be used and the latter won't.\n\n## Moving and Resizing\nWhen a QWindow is floating, it can be moved (via titlebar), or resized (via the grippers).\n\n![Floating](statics/qwindow-floating.png \"Floating\" =300x300)\n\n## Grippers\nThe grippers can be changed to be round with the `round-grippers` property.\n\n![Round Grippers](statics/qwindow-round-grippers.png \"Round Grippers\" =300x300)\n\nOr, by using the `hide-grippers` property you can turn off the visual display of the grippers. In this case, instead of being able to grip the \"boxes\" in order to resize you can click anywhere along the sides, as well as the corners.\n\n## Pinning\nWhen a QWindow is pinned, it can no longer be moved or resized.\n\n## Scrolling\nThe \"normal\" behavior of QWindow is to \"stay-in-place\". Meaning, if you scroll the document, the QWindow will stay in it's relative position to the browser's viewport. You can turn off this behavior, by setting the `scroll-with-window` property. In this case, the QWindow will scroll with the document.\n\n:::tip\nUsing the mouse to scroll will cause the QWindow to be a bit \"jerky\". This is because a mouse does not cause a pixel-by-pixel scroll, but causes a \"jump\" in the scroll position. Try scrolling with the scrollbar to see the difference.\n:::\n\n## Modifying the Menu\nTBD\n\n## Changing Icons and Language\nTBD\n\n# QWindow API\n\n## Vue Properties\n| Vue Property | Type | Description |\n| --- | --- | --- |\n| value | Boolean | v-model; controls visibility<br>Default: true |\n| dense | Boolean | Makes the titlebar height more dense |\n| embedded | Boolean | If the QWindow should be initially embedded |\n| pinned | Boolean | If the QWindow should be initially pinned |\n| maximized | Boolean | If the QWindow should be initially maximized |\n| fullscreen | Boolean | If the QWindow should initially be fullscreen |\n| start-x | [Number, String] | The starting x position |\n| start-y | [Number, String] | The starting y position |\n| width | [Number, String] | The starting width |\n| height | [Number, String] | The starting height |\n| actions | Array | The actions that can be applied to the QWindow<br>Values: ['pin', 'embedded', 'maximize', 'close', 'fullscreen']<br>Default:['pin', 'embedded', 'close'] |\n| no-move | Boolean | Restricts the ability to 'move' the QWindow. Moving can still be accomplished by resizing unless you restrict using the `resizable` property |\n| resizable | Array | Contains and array of resize handle names that are allowed<br>Default: [ 'top', 'left', 'right', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] |\n| scroll-with-window | Boolean | When the document body is scrolled, the QWindow will scroll with it. Normal behavior is to \"stay-in-place\".<br>Default: false |\n| bring-to-front-after-drag | Boolean | Change z-index after drag/resize |\n| menu-func | Function | Allows the menu to me modified before being displayed |\n| title | String | The title for the titlebar |\n| icon-set | Object | Allows icons and language to be changed. See below for details |\n| no-menu | Boolean | Prevent the titlebar from drawing the menu (see No Menu example) |\n| headless | Boolean | Prevent titlebar from being drawn (see Headless example) |\n| hide-toolbar-divider | Boolean | Controls if the titlebar separator should be displayed |\n| hide-grippers | Boolean | Controls if the grippers should be displayed |\n| round-grippers | Boolean | Use round grippers instead of square |\n| color | String | This can be any CSS color value or Quasar color |\n| background-color | String | This can be any CSS color value or Quasar color |\n| border-width | String | This can be any CSS unit<br>Default: 1px |\n| border-style | String | This can be any CSS border style<br>Default: solid |\n| titlebar-style | [String, Object, Array] | |\n| titlebar-class | [String, Object, Array] | |\n| content-style | [String, Object, Array] | |\n| content-class | [String, Object, Array] | |\n\nQWindow uses `Material Design` icons and the English language as defaults. If you wish to change either of these, you can use the `icon-set` property.\n\nIt looks like this:\n\n```js\n{\n  visible: {\n    on: {\n      icon: 'close',\n      label: 'Show'\n    },\n    off: {\n      icon: 'close',\n      label: 'Hide'\n    }\n  },\n  embedded: {\n    on: {\n      icon: 'lock_outline',\n      label: 'Embed'\n    },\n    off: {\n      icon: 'lock_open',\n      label: 'Float'\n    }\n  },\n  pinned: {\n    on: {\n      icon: 'location_searching',\n      label: 'Pin'\n    },\n    off: {\n      icon: 'gps_fixed',\n      label: 'Unpin'\n    }\n  },\n  maximize: {\n    on: {\n      icon: 'arrow_upward',\n      label: 'Maximize'\n    },\n    off: {\n      icon: 'restore',\n      label: 'Restore'\n    }\n  },\n  fullscreen: {\n    on: {\n      icon: 'fullscreen',\n      label: 'Enter fullscreen'\n    },\n    off: {\n      icon: 'fullscreen_exit',\n      label: 'Leave fullscreen'\n    }\n  }\n}\n```\nEach key within the whole of this structure is optional. You can replace a part of it or all of it. If you have `Material Design` icons turned off in your `quasar.conf.js`, then you need to set all the icons.\nYou do not need to include the `label` property unless you are:\n1. Changing the wording, or\n2. Using a different language\n\n## Vue Events\n| Vue Event | Args | Description |\n| --- | --- | --- |\n| @visible | Boolean | When the QWindow is displayed or hidden |\n| @embedded | Boolean | When the QWindow enters or leaves the embedded state |\n| @pinned | Boolean | When the QWindow enters or leaves the pinned state |\n| @maximize | Boolean | When the QWindow enters or leaves the maximize state |\n| @fullscreen | Boolean | When the QWindow enters or leaves the fullscreen state |\n| @position | Object | When the QWindow is moved or resized.<br>{ left, top, width, height, scrollX, scrollY } |\n\n\n## Vue Computed Properties\n| Vue Method | Type | Description |\n| --- | --- | --- |\n| isVisible | Boolean | true if the QWindow is currently visible, otherwise false |\n| isEmbedded | Boolean | true if the QWindow is currently embedded, otherwise false |\n| isPinned | Boolean | true if the QWindow is currently pinned, otherwise false |\n| isMaximized | Boolean | true if the QWindow is currently maximized, otherwise false |\n| isFullscreen | Boolean | true if the QWindow is currently fullscreen, otherwise false |\n| isDragging | Boolean | true if the QWindow is currently being moved or resized, otherwise false |\n| canDrag | Boolean | true if all criteria aligns that make the QWindow movable/resizable |\n| computedToolbarHeight | Number | The toolbar height |\n| computedLeft | Number | The left position of the QWindow |\n| computedTop | Number | The top position of the QWindow |\n| computedRight | Number | The right position of the QWindow |\n| computedBottom | Number | The bottom position of the QWindow |\n| computedHeight | Number | The height of the QWindow |\n| computedWidth | Number | The width of the QWindow |\n| computedScrollX | Number | The x position plus scroll width of the QWindow |\n| computedScrollY | Number | The y position plus scroll height of the QWindow |\n| computedPosition | Object | The current position of the QWindow<br>{ left, top, width, height, scrollX, scrollY } |\n| computedActions | Array | Contains an array of currently allowed states (like 'embedded', 'pinned', 'visble', etc). Useful for menu determination. For instance, if the length is 0, then do not show a menu |\n| computedMenuData | Array | This is the actual data used in determining the menu. Be aware that this data is a copy and direct manipulation may be lost. If it is needed, it should be retrieved before each use |\n\nThe `computedMenuData` looks similar to this:\n```js\n[\n  {\n    key: 'embedded',\n    state: true,\n    off: {\n      label: 'Float',\n      icon: 'lock_open',\n      func: this.unlock()\n    },\n    on: {\n      label: 'Embed',\n      icon: 'lock_outline',\n      func: this.lock()\n    }\n  }\n]\n```\nWhen the menu is built, it uses `state` to determine whether to use the `off` object or the `on` object.\n\n\n## Vue Methods\n| Vue Method | Args | Description |\n| --- | --- | --- |\n| show | | Makes the QWindow visible |\n| hide | | Makes the QWindow hidden |\n| lock | | Makes the QWindow embedded |\n| unlock | | Makes the QWindow floating |\n| pin | | Makes the QWindow pinned |\n| unpin | | Makes the QWindow non-pinned |\n| maximize | | Makes the QWindow maximized |\n| restore | | Restores the QWindow from maximized |\n| fullscreenEnter | | Makes the QWindow fullscreen |\n| fullscreenLeave | | Restores the QWindow from fullscreen |\n| bringToFront | | Brings the QWindow to the front layer |\n| sendToBack | | Sends the QWindow to the back layer |\n| centerWindow | | Centers the QWindow on the visible view port |\n| setX | Number | Programmatically set the x position |\n| setY | Number | Programmatically set the y position |\n| setXY | Number, Number | Programmatically set both the x and y positions |\n| setWidth | Number | Programmatically set the width |\n| setHeight | Number | Programmatically set the height |\n| canDo | String | Pass in a state, like 'embedded' or 'close' and will return true or false if it can be done at this time<br>Useful for determining items in the menu |\n\n\n## Vue Slots\n| Vue Slot | Description |\n| --- | --- |\n| default | This is the default slotted content |\n\n## Vue Scoped Slots\n| Vue Slot | Args | Description |\n| --- | --- | --- |\n| default | Object | This is the default slotted content<br>An object is returned with a key `zIndex`. Using this value is useful to set the slotted content to `zIndex + 1` if z order is a concern (like QDrawer) |\n| titlebar | Array | See `computedMenuData` above |\n\n\n# Donate\nIf you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).\n\n---\nThis page created with [QMarkdown](https://quasarframework.github.io/app-extension-qmarkdown), another great Quasar App Extension.",r={name:"PageIndex",components:{Hero:a["a"]},data:function(){return{markdown:s}},computed:{toc:{get:function(){return this.$store.state.common.toc},set:function(e){this.$store.commit("common/toc",e)}}},methods:{onToc:function(e){this.toc=e}}},l=r,d=t("2877"),h=Object(d["a"])(l,o,i,!1,null,null,null);n["default"]=h.exports}}]);