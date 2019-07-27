QWindow
===

QWindow is a [Quasar App Extension](https://quasar.dev/app-extensions/introduction). It allows you to have a floating, movable, and resizable HTML window in your Quasar App.

# Install
To add this App Extension to your Quasar application, run the following (in your Quasar app folder):
```
quasar ext add qwindow
```

# Uninstall
To remove this App Extension from your Quasar application, run the following (in your Quasar app folder):
```
quasar ext remove qwindow
```

# Describe
You can use `quasar describe QWindow`

# Docs
Can be found [here](https://hawkeye64.github.io/app-extension-qwindow).

# Examples
Can be found [here](https://hawkeye64.github.io/app-extension-qwindow/examples).

# Interactive Demo
Can be found [here](https://hawkeye64.github.io/app-extension-qwindow/demo).

# Demo (source) Project
Can be found [here](https://github.com/hawkeye64/app-extension-qwindow/tree/master/demo).

# Working with QWindow
Working with QWindow can be very minimal. Almost all essential properties have defaults. Here is an example of using QWindow:
```html
  <q-window
    v-model="visible"
    title="QWindow Basic"
    :actions="['embedded']"
    content-class="bg-grey-1"
  >
    <div class="q-ma-md">
      This is the "default" slot content
    </div>
  </q-window>
```

In the example above, QWindow is not gven the `start-x` and `start-y` positions. In this case, QWindow uses an algorithm that prevents multiple instantiated windows from sitting on top of each other (the x and x are offset).

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
    <div class="q-ma-md">
      This is the "default" slot content
    </div>
  </q-window>
```

You can set the initial state by providing one of the following: `embedded`, `pinned`, `maximize`, `fullscreen`. Some states conflict, so if one is detected before the other, then the first state will be used and the latter won't.

## Moving and Resizing
When a QWindow is floating, it can be moved (via titlebar), or resized (via the grippers).

![Floating](statics/qwindow-floating.png "Floating" =300x300)

## Grippers
The grippers can be changed to be round with the `round-grippers` property.

![Round Grippers](statics/qwindow-round-grippers.png "Round Grippers" =300x300)

Or, by using the `hide-grippers` property you can turn off the visual display of the grippers. In this case, instead of being able to grip the "boxes" in order to resize you can click anywhere along the sides, as well as the corners.

## Pinning
When a QWindow is pinned, it can no longer be moved or resized.

## Scrolling
The "normal" behavior of QWindow is to "stay-in-place". Meaning, if you scroll the document, the QWindow will stay in it's relative position to the browser's viewport. You can turn off this behavior, by setting the `scroll-with-window` property. In this case, the QWindow will scroll with the document.

:::tip
Using the mouse to scroll will cause the QWindow to be a bit "jerky". This is because a mouse does not cause a pixel-by-pixel scroll, but causes a "jump" in the scroll position. Try scrolling with the scrollbar to see the difference.
:::

## Modifying the Menu
TBD

## Changing Icons and Language
TBD

# QWindow API

## Vue Properties
| Vue Property | Type | Description |
| --- | --- | --- |
| value | Boolean | v-model; controls visibility<br>Default: true |
| embedded | Boolean | If the QWindow should be initially embedded |
| pinned | Boolean | If the QWindow should be initially pinned |
| maximized | Boolean | If the QWindow should be initially maximized |
| fullscreen | Boolean | If the QWindow should initially be fullscreen |
| start-x | [Number, String] | The starting x position |
| start-y | [Number, String] | The starting y position |
| width | [Number, String] | The starting width |
| height | [Number, String] | The starting height |
| actions | Array | The actions that can be applied to the QWindow<br>Values: ['pin', 'embedded', 'maximize', 'close', 'fullscreen']<br>Default:['pin', 'embedded', 'close']
| scroll-with-window | Boolean | When the document body is scrolled, the QWindow will scroll with it. Normal behavior is to "stay-in-place".<br>Default: false |
| bring-to-front-after-drag | Boolean | Change z-index after drag/resize |
| menu-func | Function | Allows the menu to me modified before being displayed |
| title | String | The title for the titlebar |
| icon-set | Object | Allows icons and language to be changed. See below for details |
| headless | Boolean | Prevent titlebar from being drawn (see Headless example) |
| hide-toolbar-divider | Boolean | Controls if the titlebar separator should be displayed |
| hide-grippers | Boolean | Controls if the grippers should be displayed |
| round-grippers | Boolean | Use round grippers instead of square |
| color | String | This can be any CSS color value or Quasar color |
| background-color | String | This can be any CSS color value or Quasar color |
| border-width | String | This can be any CSS unit<br>Default: 1px |
| border-style | String | This can be any CSS border style<br>Default: solid |
| titlebar-style | [String, Object, Array] | |
| titlebar-class | [String, Object, Array] | |
| content-style | [String, Object, Array] | |
| content-class | [String, Object, Array] | |

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

## Vue Events
| Vue Event | Args | Description |
| --- | --- | --- |
| @visible | Boolean | When the QWindow is displayed or hidden |
| @embedded | Boolean | When the QWindow enters or leaves the embedded state |
| @pinned | Boolean | When the QWindow enters or leaves the pinned state |
| @maximize | Boolean | When the QWindow enters or leaves the maximize state |
| @fullscreen | Boolean | When the QWindow enters or leaves the fullscreen state |
| @position | Object | When the QWindow is moved or resized.<br>{ left, top, width, height, scrollX, scrollY } |


## Vue Computed Properties
| Vue Method | Type | Description |
| --- | --- | --- |
| isVisible | Boolean | true if the QWindow is currently visible, otherwise false |
| isEmbedded | Boolean | true if the QWindow is currently embedded, otherwise false |
| isPinned | Boolean | true if the QWindow is currently pinned, otherwise false |
| isMaximized | Boolean | true if the QWindow is currently maximized, otherwise false |
| isFullscreen | Boolean | true if the QWindow is currently fullscreen, otherwise false |
| isDragging | Boolean | true if the QWindow is currently being moved or resized, otherwise false |
| canDrag | Boolean | true if all criteria aligns that make the QWindow movable/resizable |
| computedToolbarHeight | Number | The toolbar height |
| computedLeft | Number | The left position of the QWindow |
| computedTop | Number | The top position of the QWindow |
| computedRight | Number | The right position of the QWindow |
| computedBottom | Number | The bottom position of the QWindow |
| computedHeight | Number | The height of the QWindow |
| computedWidth | Number | The width of the QWindow |
| computedScrollX | Number | The x position plus scroll width of the QWindow |
| computedScrollY | Number | The y position plus scroll height of the QWindow |
| computedPosition | Object | The current position of the QWindow<br>{ left, top, width, height, scrollX, scrollY } |
| computedActions | Array | Contains an array of currently allowed states (like 'embedded', 'pinned', 'visble', etc). Useful for menu determination. For instance, if the length is 0, then do not show a menu |
| computedMenuData | Array | This is the actual data used in determining the menu. Be aware that this data is a copy and direct manipulation may be lost. If it is needed, it should be retrieved before each use |

The `computedMenuData` looks similar to this:
```js
[
  {
    key: 'embedded',
    state: true,
    off: {
      label: 'Float',
      icon: 'lock_open',
      func: this.unlock()
    },
    on: {
      label: 'Embed',
      icon: 'lock_outline',
      func: this.lock()
    }
  }
]
```
When the menu is built, it uses `state` to determine whether to use the `off` object or the `on` object.


## Vue Methods
| Vue Method | Args | Description |
| --- | --- | --- |
| show | | Makes the QWindow visible |
| hide | | Makes the QWindow hidden |
| lock | | Makes the QWindow embedded |
| unlock | | Makes the QWindow floating |
| pin | | Makes the QWindow pinned |
| unpin | | Makes the QWindow non-pinned |
| maximize | | Makes the QWindow maximized |
| restore | | Restores the QWindow from maximized |
| fullscreenEnter | | Makes the QWindow fullscreen |
| fullscreenLeave | | Restores the QWindow from fullscreen |
| bringToFront | | Brings the QWindow to the front layer |
| sendToBack | | Sends the QWindow to the back layer |
| centerWindow | | Centers the QWindow on the visible view port |
| setX | Number | Programmatically set the x position |
| setY | Number | Programmatically set the y position |
| setXY | Number, Number | Programmatically set both the x and y positions |
| setWidth | Number | Programmatically set the width |
| setHeight | Number | Programmatically set the height |
| canDo | String | Pass in a state, like 'embedded' or 'close' and will return true or false if it can be done at this time<br>Useful for determining items in the menu |


## Vue Slots
| Vue Slot | Description |
| --- | --- |
| default | This is the default slotted content |

## Vue Scoped Slots
| Vue Slot | Args | Description |
| --- | --- | --- |
| default | Object | This is the default slotted content<br>An object is returned with a key `zIndex`. Using this value is useful to set the slotted content to `zIndex + 1` if z order is a concern (like QDrawer) |
| titlebar | Array | See `computedMenuData` above |


# Donate
If you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).

---
This page created with [QMarkdown](https://quasarframework.github.io/app-extension-qmarkdown), another great Quasar App Extension.