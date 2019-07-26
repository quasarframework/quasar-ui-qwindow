<template>
  <hero>
    <div class="q-markdown">
      <q-markdown>
**QWindow** allows for a floating, movable, resizable window above the regular HTML elements.

It is quite possible to start a QWindow off as `floating`, but for these examples, the window must start off as `embedded` so there isn't a lot of windows popping up and knowing which example they come from.

This means, you must access the menu content to make it `floating`.

Once a window is `floating`, unless restricted, you can move it (via the titlebar) or resize it (via sides and corners).

:::tip
All QWindows are initially relative to the browser's view. This means, even if you scroll, it will stay in-place. If you want the QWindow to scroll with the document, then set the `scroll-with-window` to `true`.
:::

:::tip
Using the mouse to scroll will cause the QWindow to be a bit "jerky". This is because a mouse does not cause a pixel-by-pixel scroll, but causes a "jump" in the scroll position. Try scrolling with the scrollbar to see the difference.
:::

:::info
When you move or resize a QWindow in `floating` mode, then `embed` it, if you make it `floating` again, it's last position is retained.
:::
      </q-markdown>
      <example-title title="Basic" />
      <example-card title="Embedded/Floating" name="Basic" :tag-parts="getTagParts(require('!!raw-loader!../examples/Basic.vue').default)" />

      <q-markdown>
You might have noticed on the previous example, when the QWindow is floating, that when you scroll the document that the QWindow stays in-place.

To prevent the in-place and scroll with the document, use the `scroll-with-window` property.

If you make this window `floating`, you will have to scroll up to see it. It's position is now relative to the document and not to the view port.

Make sure to `embed` the `floating` window before moving on to the next example.
      </q-markdown>

      <example-card title="Scroll With Window" name="ScrollWithWindow" :tag-parts="getTagParts(require('!!raw-loader!../examples/ScrollWithWindow.vue').default)" />

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

      <example-card title="Actions" name="Actions" :tag-parts="getTagParts(require('!!raw-loader!../examples/Actions.vue').default)" />
      <example-card title="Color" name="Color" :tag-parts="getTagParts(require('!!raw-loader!../examples/Color.vue').default)" />
      <example-card title="Border" name="Border" :tag-parts="getTagParts(require('!!raw-loader!../examples/Border.vue').default)" />
      <example-card title="Titlebar Style" name="TitlebarStyle" :tag-parts="getTagParts(require('!!raw-loader!../examples/TitlebarStyle.vue').default)" />

      <q-markdown>
If you don't like the **grippers** you can hide them with the `hide-grippers` property. In this case, there will be invisible bars running on the sides, as well as all corners that allow for resizing. Hover the mouse over these areas to see the cursor change.
      </q-markdown>

      <example-card title="Hide Grippers" name="GripperNone" :tag-parts="getTagParts(require('!!raw-loader!../examples/GripperNone.vue').default)" />
      <example-card title="Round Grippers" name="GripperRound" :tag-parts="getTagParts(require('!!raw-loader!../examples/GripperRound.vue').default)" />

      <example-title title="Advanced" />
      <q-markdown>
You can provide the action `close` in the array of actions. This will add a **Close** option to the menu. Essentually, the window is really hidden. It is up to the developer to provide a way for the QWindow to be re-displayed by setting the `visible` property.
      </q-markdown>

      <example-card title="Close Action" name="CloseAction" :tag-parts="getTagParts(require('!!raw-loader!../examples/CloseAction.vue').default)" />

      <q-markdown>
The example below is just showing more content in the default slot.
      </q-markdown>

      <example-card title="Scroll Area" name="ScrollArea" :tag-parts="getTagParts(require('!!raw-loader!../examples/ScrollArea.vue').default)" />
      <q-markdown>
One situation you may run into is when there is more than one QWindow components being displayed and they overlap each other. In this case, there may be no way easy to change their `z-index`. To resolve this, you can use the `bring-to-front-after-drag` property. The QWindow that is last dragged (or resized) will be moved to the top.

In the example below, you will need to float both QWindows to see this in action.
      </q-markdown>
      <example-card title="Bring to Front After Drag" name="BringToFrontAfterDrag" :tag-parts="getTagParts(require('!!raw-loader!../examples/BringToFrontAfterDrag.vue').default)" />

      <q-markdown>
There is opportunity to modify the displayed menu just before it is displayed. In the example below, two functionns are added: `Bring to Front` and `send to Back` where appropriate functionality will be called.

You can add to the menu the text `separator` which will put a separator between items. Other than that, the rest of the items must be objects that look like this:
```js
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
```
When `state` is `true`, then the `on` object will be used, otherwise the `off` object.

In the example below, menu items are added only if the QWindow is floating. Use the menu to change the `z-order` manually.
      </q-markdown>
      <example-card title="Modify Menu" name="ModifyMenu" :tag-parts="getTagParts(require('!!raw-loader!../examples/ModifyMenu.vue').default)" />

      <q-markdown>
The example below is using the default scoped slot. When this is done, data (an object) is passed into the scoped slot that contains the current `zIndex`. Usining this information, it is used to control the `z-order` of the `QDrawer` components, so when in fullscreen mode, they are properly displayed.
      </q-markdown>

      <example-card title="Complex Slot" name="ComplexSlot" :tag-parts="getTagParts(require('!!raw-loader!../examples/ComplexSlot.vue').default)" />

    </div>
  </hero>
</template>

<script>
import Hero from '../components/Hero'
import ExampleTitle from '../components/ExampleTitle'
import ExampleCard from '../components/ExampleCard'
import { slugify } from 'assets/page-utils'
import getTagParts from '@quasar/quasar-app-extension-qmarkdown/src/lib/getTagParts'

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
    this.addToToc('Fixed Position', 2)
    this.addToToc('Actions', 2)
    this.addToToc('Color', 2)
    this.addToToc('Border', 2)
    this.addToToc('Titlebar Style', 2)
    this.addToToc('Hide Grippers', 2)
    this.addToToc('Round Grippers', 2)

    this.addToToc('Advanced')
    this.addToToc('Close Action', 2)
    this.addToToc('Scroll Area', 2)
    this.addToToc('Bring to Front After Drag', 2)
    this.addToToc('Modify Menu', 2)
    this.addToToc('Complex Slot', 2)

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
