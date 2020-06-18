<template>
  <hero>
    <div>
      <q-markdown>
**QWindow** allows for a floating, movable, resizable window above the regular HTML elements.

It is quite possible to start a QWindow off as `floating`, but for these examples, the window must start off as `embedded` so there isn't a lot of windows popping up and then knowing which example they come from.

This means, you must access the menu content to make it `floating`.

Once a window is `floating`, unless restricted, you can move it (via the titlebar) or resize it (via sides and corners).

:::tip
All QWindows are initially relative to the browser's view. This means, even if you scroll, it will stay in-place. If you want the QWindow to scroll with the document, then set the `scroll-with-window` to `true`.
:::

:::tip
Using the mouse or keyboard to scroll will cause the QWindow to be a bit "jerky". These devices do not do a pixel-by-pixel scroll, but causes a "jump" in the pixels to a new scroll position. Try scrolling with the scrollbar to see the difference.
:::

:::info
When you move or resize a QWindow in `floating` mode, then `embed` it, if you make it `floating` again, it's last position is retained.
:::

:::warning
Floating windows use a Vue Portal and while developing, the HMR is unable to re-create this portal which may cause issues. Just refresh the page if this happens to you during development.
:::

      </q-markdown>
      <example-title title="Basic" />
      <example-card title="Embedded/Floating" name="Basic" :tag-parts="getTagParts(require('!!raw-loader!../examples/Basic.vue').default)" />

      <example-card title="Scroll With Window" name="ScrollWithWindow" :tag-parts="getTagParts(require('!!raw-loader!../examples/ScrollWithWindow.vue').default)">
        <q-markdown>
You might have noticed on the previous example, when the QWindow is floating, when you scroll the document, the QWindow stays in-place.

To prevent the in-place and scroll with the document, use the `scroll-with-window` property.

If you make this window `floating`, you will have to scroll up to see it. It's position is now relative to the document and not to the view port.

Make sure to `embed` the `floating` window before moving on to the next example.
        </q-markdown>
      </example-card>

      <example-card title="Dense" name="Dense" :tag-parts="getTagParts(require('!!raw-loader!../examples/Dense.vue').default)" />

      <example-card title="Actions" name="Actions" :tag-parts="getTagParts(require('!!raw-loader!../examples/Actions.vue').default)">
        <q-markdown>
Actions allow the window to be in different states.

The available actions are:
1. `embedded`
2. `pinned`
3. `maximize`
4. `fullscreen`
5. `close`

All of the actions are self-explanatory, except for `pinned`. When a QWindow is `pinned` this means it can no longer be moved or resized.

In the example below, we will use all actions, except for `close` which will be discussed in a later example.

`float` the example window to see the actions in the menu.
        </q-markdown>
      </example-card>

      <example-card title="Color" name="Color" :tag-parts="getTagParts(require('!!raw-loader!../examples/Color.vue').default)" />
      <example-card title="Border" name="Border" :tag-parts="getTagParts(require('!!raw-loader!../examples/Border.vue').default)" />
      <example-card title="Titlebar Style" name="TitlebarStyle" :tag-parts="getTagParts(require('!!raw-loader!../examples/TitlebarStyle.vue').default)" />
      <example-card title="Content Style - String" name="ContentStyleString" :tag-parts="getTagParts(require('!!raw-loader!../examples/ContentStyleString.vue').default)" />
      <example-card title="Content Style - Object" name="ContentStyleObject" :tag-parts="getTagParts(require('!!raw-loader!../examples/ContentStyleObject.vue').default)" />
      <example-card title="Content Style - Array" name="ContentStyleArray" :tag-parts="getTagParts(require('!!raw-loader!../examples/ContentStyleArray.vue').default)" />

      <example-card title="Hide Grippers" name="GripperNone" :tag-parts="getTagParts(require('!!raw-loader!../examples/GripperNone.vue').default)">
        <q-markdown>
If you don't like the **grippers** you can hide them with the `hide-grippers` property. In this case, there will be invisible bars running on the sides, as well as all corners that allow for resizing. Hover the mouse over these areas to see the cursor change.
        </q-markdown>
      </example-card>

      <example-card title="Round Grippers" name="GripperRound" :tag-parts="getTagParts(require('!!raw-loader!../examples/GripperRound.vue').default)" />
      <example-card title="Colored Grippers" name="GripperColored" :tag-parts="getTagParts(require('!!raw-loader!../examples/GripperColored.vue').default)" />

      <example-card title="No Resize" name="NoResize" :tag-parts="getTagParts(require('!!raw-loader!../examples/NoResize.vue').default)" />
      <example-card title="No Move" name="NoMove" :tag-parts="getTagParts(require('!!raw-loader!../examples/NoMove.vue').default)" />

      <example-card title="Resizable" name="Resizable" :tag-parts="getTagParts(require('!!raw-loader!../examples/Resizable.vue').default)">
        <q-markdown>
The `resizable` property allows you to turn on/off various resize handles. The acceptable array items are:
```js
[ 'top', 'left', 'right', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
```
See the code in the examples below for details.
        </q-markdown>
      </example-card>

      <example-card title="Messages" name="Messages" :tag-parts="getTagParts(require('!!raw-loader!../examples/Messages.vue').default)">
        <q-markdown>
You can play with the QWindow and get feedback on the messages that are emitted. The `position` message is always for a non-embedded window and will emit when a QWindow is moved, resized or the document is scrolled.
        </q-markdown>
      </example-card>

      <example-card title="Auto Pin" name="AutoPin" :tag-parts="getTagParts(require('!!raw-loader!../examples/AutoPin.vue').default)">
        <q-markdown>
The `auto-pin` property allows you to automatically pin/unpin a floating QWindow depending on it's selected state.

:::warning
Clicking the menu on an unselected QWindow, the QWindow becomes selected and the menu will have to be clicked a second time.

It is recommended to use `auto-pin` along with the `headless` property.
:::
        </q-markdown>
      </example-card>

      <example-title title="Advanced" />

      <example-card title="Close Action" name="CloseAction" :tag-parts="getTagParts(require('!!raw-loader!../examples/CloseAction.vue').default)">
        <q-markdown>
You can provide the action `close` in the array of actions. This will add a **Close** option to the menu. Essentually, the window is really hidden. It is up to the developer to provide a way for the QWindow to be re-displayed by setting the `v-model` (value) property.
        </q-markdown>
      </example-card>

      <example-card title="Scroll Area" name="ScrollArea" :tag-parts="getTagParts(require('!!raw-loader!../examples/ScrollArea.vue').default)">
        <q-markdown>
The example below is just showing more content in the default slot.
        </q-markdown>
      </example-card>

      <example-card title="Modify Menu" name="ModifyMenu" :tag-parts="getTagParts(require('!!raw-loader!../examples/ModifyMenu.vue').default)">
        <q-markdown>
There is opportunity to modify the displayed menu just before it is displayed. In the example below, two functions are added: `Bring to Front` and `Send to Back` where the appropriate functionality will be called.

You can add to the menu the text `separator` which will put a separator between items. Other than that, the rest of the items must be objects that look like this:
```js
let sendToBack = {
  key: 'sendtoback',
  state: true,
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
```
When `state` is `true`, then the `on` object will be used, otherwise the `off` object will be used. If the state will always be `true` or `false` then you only need to provide the `on` or `off` object, respectively.

In the example below, menu items are added only if the QWindow is floating. Use the menu to change the `z-order` manually.

Additionally, one other menu item is being added that you can try out: `Center Window`.
        </q-markdown>
      </example-card>

      <example-card title="Complex Slot" name="ComplexSlot" :tag-parts="getTagParts(require('!!raw-loader!../examples/ComplexSlot.vue').default)">
        <q-markdown>
The example below is using the default scoped slot. When this is done, data (an object) is passed into the scoped slot that contains the current `zIndex`. Usining this information, it is used to control the `z-order` of the `QDrawer` components, so when in fullscreen mode, they are properly displayed.
        </q-markdown>
      </example-card>

      <example-card title="Icons and Language" name="IconsAndLanguage" :tag-parts="getTagParts(require('!!raw-loader!../examples/IconsAndLanguage.vue').default)">
        <q-markdown>
QWindow uses `Material Design` icons and the English language as defaults. If you wish to change either of these, you can use the `icon-set` property.

It looks like this:

```js
{
  visible: {
    on: {
      icon: 'close',
      label: 'Show'
    },
    off: {
      icon: 'close',
      label: 'Hide'
    }
  },
  embedded: {
    on: {
      icon: 'lock_outline',
      label: 'Embed'
    },
    off: {
      icon: 'lock_open',
      label: 'Float'
    }
  },
  pinned: {
    on: {
      icon: 'location_searching',
      label: 'Pin'
    },
    off: {
      icon: 'gps_fixed',
      label: 'Unpin'
    }
  },
  maximize: {
    on: {
      icon: 'arrow_upward',
      label: 'Maximize'
    },
    off: {
      icon: 'restore',
      label: 'Restore'
    }
  },
  fullscreen: {
    on: {
      icon: 'fullscreen',
      label: 'Enter fullscreen'
    },
    off: {
      icon: 'fullscreen_exit',
      label: 'Leave fullscreen'
    }
  }
}
```
Each key within the whole of this structure is optional. You can replace a part of it or all of it. If you have `Material Design` icons turned off in your `quasar.conf.js`, then you need to set all the icons.
You do not need to include the `label` property unless you are:
1. Changing the wording, or
2. Using a different language

The example below uses the `icon-set` property to change the icons to use `Fontawesome-v5` and also changes all the text (still in English, but you get the point).

It is also using the `start-x` and `start-y` properties.
        </q-markdown>
      </example-card>

      <example-card title="No Menu" name="NoMenu" :tag-parts="getTagParts(require('!!raw-loader!../examples/NoMenu.vue').default)">
        <q-markdown>
Using the `no-menu` property means the titlebar will not draw the menu, which means you have to provide the functionality yourself.

In the example below, we are using a button that when clicked retrieves the `computedMenuData` from QWindow so it can be displayed. We have to do this before the QMenu is displayed, so we can control that via the `showMenu` data attribute.

Just to re-iterate, all state handling must be driven from outside of QWindow, but QWindow makes it very easy for you by providing all the necessary data and functions to do so.

Be aware, that for `no-menu` you probably don't wants to add actions that may impede the user, like `maximize` or `fullscreen`. In the example below, `fullscreen` is still being allowed because most browsers have a hotkey (F11 in Chrome) to toggle fullscreen or by pressing the ESC key.
        </q-markdown>
      </example-card>

      <example-card title="Provide/Inject" name="ProvideInject" :tag-parts="getTagParts(require('!!raw-loader!../examples/ProvideInject.vue').default)">
        <q-markdown>
Vue [Provide and Inject](https://vuejs.org/v2/api/#provide-inject) is for **advanced** users. It is not within the scope of this document to teach you how to use this technique. However, if you are using Provide/Inject, be aware that when `floating`, a QWindow will not be able to pass along the injection without remediation on your part.

When a QWindow is `floating`, it is using portal code. This means a new Vue `$root` instance is created and it is not aware of your registered Injector. The fix is relatively easy. Just put the Injector class in the slot as well, so that the new Vue `$root` instance, created by the portal, knows your intension.

In the first QWindow example below, the **Injector** is being handled incorrectly. It works while `embedded`, but does not work while `floating`. The second QWindow is being handled properly. When `floating`, you will see the injected data inside the window.

The code tabs in this example will not show you everything used in the example. If you are interested in the Inject and Provide code used, check out the Github repo in the demo code.
        </q-markdown>
      </example-card>

      <example-card title="Headless" name="Headless" :tag-parts="getTagParts(require('!!raw-loader!../examples/Headless.vue').default)">
        <q-markdown>
Using the `headless` property means the titlebar will not be drawn, therefore there will be no menu drawn, which means you have to provide the functionality yourself.

In the example below, we are using a button that when clicked retrieves the `computedMenuData` from QWindow so it can be displayed. We have to do this before the QMenu is displayed, so we can control that via the `showMenu` data attribute.

Just to re-iterate, all state handling must be driven from outside of QWindow, but QWindow makes it very easy for you by providing all the necessary data and functions to do so.

Be aware, that for `headless` you probably don't wants to add actions that may impede the user, like `maximize` or `fullscreen`. In the example below, `fullscreen` is still being allowed because most browsers have a hotkey (F11 in Chrome) to toggle fullscreen or by pressing the ESC key.
        </q-markdown>
      </example-card>

      <example-card title="Headless With AutoPin" name="HeadlessAutoPin" :tag-parts="getTagParts(require('!!raw-loader!../examples/HeadlessAutoPin.vue').default)" />

      <example-card title="Headless/AutoPin Selected Styles" name="HeadlessAutoPinSelected" :tag-parts="getTagParts(require('!!raw-loader!../examples/HeadlessAutoPinSelected.vue').default)">
        <q-markdown>
The example below is **not** using any slot content. Try clicking on the window and then off the window while embedded and then when floating.
        </q-markdown>
      </example-card>

    </div>
    <q-page-scroller position="bottom-right" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary" />
    </q-page-scroller>
  </hero>
</template>

<script>
import Hero from '../components/Hero'
import ExampleTitle from '../components/ExampleTitle'
import ExampleCard from '../components/ExampleCard'
import { slugify } from 'assets/page-utils'
import getTagParts from '@quasar/quasar-ui-qmarkdown/src/util/getTagParts'

export default {
  name: 'Examples',

  components: {
    Hero,
    ExampleTitle,
    ExampleCard
  },

  data () {
    return {
      tempToc: []
    }
  },

  mounted () {
    this.toc = []
    this.tempToc = []

    this.addToToc('Basic')
    this.addToToc('Embedded/Floating', 2)
    this.addToToc('Scroll With Window', 2)
    this.addToToc('Dense', 2)
    this.addToToc('Actions', 2)
    this.addToToc('Color', 2)
    this.addToToc('Border', 2)
    this.addToToc('Titlebar Style', 2)
    this.addToToc('Content Style - String', 2)
    this.addToToc('Content Style - Object', 2)
    this.addToToc('Content Style - Array', 2)
    this.addToToc('Hide Grippers', 2)
    this.addToToc('Round Grippers', 2)
    this.addToToc('Colored Grippers', 2)
    this.addToToc('No Resize', 2)
    this.addToToc('No Move', 2)
    this.addToToc('Resizable', 2)
    this.addToToc('Messages', 2)
    this.addToToc('Auto Pin', 2)

    this.addToToc('Advanced')
    this.addToToc('Close Action', 2)
    this.addToToc('Scroll Area', 2)
    this.addToToc('Modify Menu', 2)
    this.addToToc('Complex Slot', 2)
    this.addToToc('Icons and Language', 2)
    this.addToToc('No Menu', 2)
    this.addToToc('Provide/Inject', 2)
    this.addToToc('Headless', 2)
    this.addToToc('Headless With AutoPin', 2)
    this.addToToc('Headless/AutoPin Selected Styles', 2)

    this.toc = this.tempToc
  },

  computed: {
    toc:
    {
      get () {
        return this.$store.state.common.toc
      },
      set (toc) {
        this.$store.commit('common/toc', toc)
      }
    }
  },

  methods: {
    getTagParts,
    addToToc (name, level = 1) {
      const slug = slugify(name)
      this.tempToc.push({
        children: [],
        id: slug,
        label: name,
        level: level
      })
    }
  }
}
</script>

<style lang="stylus">
.example-page
  padding: 16px 46px;
  font-weight: 300;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
</style>
