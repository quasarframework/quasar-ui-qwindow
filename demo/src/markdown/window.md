QWindow
===

QWindow is a [Quasar App Extension](https://quasar.dev/app-extensions/introduction). It allows you to have a floating, movable, and resizable HTML windows in your Quasar App.

![QWindow](qwindow.png "QWindow" =800x800)

This work is currently in `beta` and there are expected changes while things get worked out. Your help with testing is greatly appreciated. Suggestions and PRs welcomed.

# Install
To add this App Extension to your Quasar application, run the following (in your Quasar app folder):
```
quasar ext add @quasar/qwindow
```

# Uninstall
To remove this App Extension from your Quasar application, run the following (in your Quasar app folder):
```
quasar ext remove @quasar/qwindow
```

# Describe
You can use `quasar describe QWindow`

# Docs
Can be found [here](https://quasarframework.github.io/quasar-ui-qwindow).

# Examples
Can be found [here](https://quasarframework.github.io/quasar-ui-qwindow/examples).

# Demo (source) Project
Can be found [here](https://github.com/quasarframework/quasar-ui-qwindow/tree/master/demo).

# A Word About QWindow
When floating, QWindow uses a Vue Portal. A Vue Portal is another instance of a Vue root useful for containing a Vue component so that it is not constrained by its parent element in any way. As such, the code has to calculate the position of the QWindow all the time, relative to the top of the page and the top of the view port. Because of this, when scrolling with the mouse or keyboard, the floating QWindow may appear to be a bit "jumpy". This is a result of the browser sending scroll positions in increments. One notch of a mouse scroll can be 52px. This cannot be helped as this is how browsers work.

# Working with QWindow
Working with QWindow can be very minimal. Almost all essential properties have defaults. Here is an example of using QWindow:
```html
  <q-window
    v-model="visible"
    title="QWindow Basic"
    :actions="['embedded']"
    content-class="bg-grey-1"
  >
    <div class="q-pa-md fit">
      This is the "default" slot content
    </div>
  </q-window>
```

In the example above, QWindow is not gven the `start-x` and `start-y` positions. In this case, QWindow uses an algorithm that prevents multiple instantiated windows from sitting on top of each other (the x and y are offset 10px for each window).

It is a good idea to provide the `content-class` unless your slotted content can control the background and foreground colors, otherwise your content background may be transparent.

## Embedding and Floating
In the above example, the QWindow will immediately be floating. If you want it embedded, simply provide the `embedded` property.

```html
  <q-window
    v-model="visible"
    title="QWindow Basic"
    embedded
    :actions="['embedded']"
    content-class="bg-grey-1"
  >
    <div class="q-pa-md fit">
      This is the "default" slot content
    </div>
  </q-window>
```

You can set the initial state by providing one of the following: `embedded`, `pinned`, `maximize`, or `fullscreen`. Some states conflict, so if one is detected before the other, then the first state will be used and the latter won't.

## Moving and Resizing
When a QWindow is floating, it can be moved (via titlebar), or resized (via the grippers).

![Floating](qwindow-floating.png "Floating" =300x300)

QWindow's grippers can be controlled with the `resizable` property (array). To turn on specific grippers, you specify in the array what you want.

```js
[ 'top', 'left', 'right', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
```

![No Grippers on Top](qwindow-no-resize-top.png "No Grippers on Top" =300x300)

## Grippers
The grippers can be changed to be round with the `round-grippers` property.

![Round Grippers](qwindow-round-grippers.png "Round Grippers" =300x300)

Or, by using the `hide-grippers` property you can turn off the visual display of the grippers. In this case, instead of being able to grip the "boxes" in order to resize you can click anywhere along the sides, as well as the corners.

![Hide Grippers](qwindow-hide-grippers.png "Hide Grippers" =300x300)

And, of course, you can stylize the grippers with the `gripper-border-color` and `gripper-background-color` properties.

![Colored Grippers](qwindow-colored-grippers.png "Colored Grippers" =300x300)

## Pinning
When a QWindow is pinned, it can no longer be moved or resized. Try using the `auto-pin` property. When the QWindow is selected, the grippers become visible. When it is not selected, the QWindow will automatically pin (no grippers).

## Scrolling
The "normal" behavior of QWindow is to "stay-in-place". Meaning, if you scroll the document, the QWindow will stay in it's relative position to the browser's viewport. You can turn off this behavior, by setting the `scroll-with-window` property. In this case, the QWindow will scroll with the document.

:::tip
Using the mouse to scroll will cause the QWindow to be a bit "jerky". This is because a mouse does not cause a pixel-by-pixel scroll, but causes a "jump" in the scroll position. Same with using the keyboard to scroll. Try scrolling with the scrollbar to see the difference.
:::

## Modifying the Menu
The items in a menu can be replaced or augmented. You can use the `menu-func` (function) property. This function is sent a copy (array of objects) of the menu data and can be modified with an appropriate object defining the state of a menu item. You can also use the special keyword `separator` to have a separator inserted into the menu.

![Modified Menu](qwindow-modified-menu.png "Modified Menu" =200x300)

The HTML:
```html
:menu-func="updateMenu"
```

and, then in JavaScript:
```js
updateMenu (menuItems) {
  if (this.$refs.window.isEmbedded !== true && this.$refs.window.isFullscreen !== true) {
    if (menuItems[menuItems.length - 1].key === 'visible') {
      menuItems.splice(menuItems.length - 1, 0, 'separator')
    }
    const sendToBack = {
      key: 'sendtoback',
      state: false,
      on: {
        label: 'Send to Back',
        icon: '',
        func: this.sendToBack1
      },
      off: {
        label: 'Send to Back',
        icon: '',
        func: this.sendToBack1
      }
    }
    const bringToFront = {
      key: 'bringtofront',
      state: false,
      on: {
        label: 'Bring to Front',
        icon: '',
        func: this.bringToFront1
      },
      off: {
        label: 'Bring to Front',
        icon: '',
        func: this.bringToFront1
      }
    }
    const centerWindow = {
      key: 'centerwindow',
      state: false,
      on: {
        label: 'Center Window',
        icon: '',
        func: this.centerWindow1
      },
      off: {
        label: 'Center Window',
        icon: '',
        func: this.centerWindow1
      }
    }
    menuItems.splice(menuItems.length, 0, 'separator')
    menuItems.splice(menuItems.length, 0, sendToBack)
    menuItems.splice(menuItems.length, 0, bringToFront)
    menuItems.splice(menuItems.length, 0, 'separator')
    menuItems.splice(menuItems.length, 0, centerWindow)
  }
}
```

## Changing Icons and Language
The default icon set for QWindow is the Material Design icons. English is also the default language. If you would like to change either of these, you can use the `icon-set` property. This is an object that represents all icons and language to use in different states. You do not have to completely replace this, only the bits you want to change.

The example below is using Fontawesome to rerplace the Material Design icons and the English has been modified. In this same manner, you can also replace the language to whatever suits yur needs.

![Icons and Language](qwindow-icons-and-language.png "Icons and Language" =200x300)

```js
{
  visible: {
    on: {
      icon: 'fas fa-eye',
      label: 'Show Me!'
    },
    off: {
      icon: 'fas fa-eye-slash',
      label: 'Hide Me!'
    }
  },
  embedded: {
    on: {
      icon: 'fas fa-lock',
      label: 'Embed Me!'
    },
    off: {
      icon: 'fas fa-unlock',
      label: 'Float Me!'
    }
  },
  pinned: {
    on: {
      icon: 'fas fa-map-marker',
      label: 'Pin Me!'
    },
    off: {
      icon: 'fas fa-map-marker-alt',
      label: 'Unpin Me!'
    }
  },
  maximize: {
    on: {
      icon: 'fas fa-window-maximize',
      label: 'To the Max!'
    },
    off: {
      icon: 'fas fa-window-restore',
      label: 'Restore me!'
    }
  },
  fullscreen: {
    on: {
      icon: 'fas fa-expand',
      label: 'Enter fullscreen mode'
    },
    off: {
      icon: 'fas fa-compress',
      label: 'Leave fullscreen mode'
    }
  }
}
```

Each key within the whole of this structure is optional. You can replace a part of it or all of it. If you have `Material Design` icons turned off in your `quasar.conf.js`, then you need to set all the icons.
You do not need to include the `label` property unless you are:
1. Changing the wording, or
2. Using a different language

## Headless
Using the `headless` property displays a QWindow without the titlebar. There is no longer a menu displayed, so cannot be modified by the user. However, the user can still move or resize the Qwindow. Try the `headless` property combined with the `auto-pin` property. A nice combination for website design software, as an example. Another option, by using the `isSelected` property, control the background color for a more professional look and feel.

![Headless Deselected](qwindow-headless-deslected.png "Headless Deselected" =300x300)
![Headless Selected](qwindow-headless-selected.png "Headless Selected" =300x300)

The style:
```stylus
<style lang="stylus">
.headless-deselected
  background-color rgba(105,179,190,0.514) !important
  border 1px dashed #e3cb47 !important

.headless-selected
  background-color rgba(172,83,83,0.42) !important
  border 1px dashed #e3cb47 !important
</style>
```

The HTML:
```html
 <q-window
  ref="window"
  v-model="visible"
  headless
  auto-pin
  title="QWindow Headless/AutoPin Selected Styles"
  :start-x="200"
  :start-y="200"
  :height="150"
  :width="350"
  :actions="['embedded', 'pin', 'fullscreen']"
  embedded
  :content-class="$refs.window && $refs.window.isSelected ? 'headless-selected' : 'headless-deselected'"
/>
```
