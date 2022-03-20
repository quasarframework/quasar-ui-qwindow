import { QBtn, QIcon, QItem, QItemSection, QList, QMenu, QSeparator } from "quasar";
import { computed, h, withDirectives, resolveDirective } from "vue";
import { MENU_ITEM_SEPARATOR } from "../QWindow";

const CLOSE_POPUP_DIRECTIVE_NAME = 'close-popup';
export default function useToolbar(props, slots, computedZIndex, canDrag, isDragging,   isEmbedded,isMinimized,computedMenuData, renderResizeHandle) {

  const tbHeight = computed(() => {
    return props.headless === true ? 0 : props.dense === true ? 28 : 40
  })
  const tbStaticClass = computed(() => {
    return 'q-window__titlebar'
      + (props.hideToolbarDivider !== true ? ' q-window__titlebar--divider' : '')
      + (props.dense === true ? ' q-window__titlebar--dense' : '')
      + (isEmbedded.value !== true && isMinimized.value !== true ? ' absolute' : '')
      + (isDragging.value === true ? ' q-window__touch-action' : '')
      + ' row justify-between items-center'
  })


  const tbStyle = computed(() => {
    const titleHeight = `${ tbHeight.value }px`
    let style = { height: titleHeight }

    if (props.titlebarStyle) {
      if (typeof props.titlebarStyle === 'object') {
        style = Object.assign(props.titlebarStyle, style)
      } else if (typeof props.titlebarStyle === 'string') {
        style = props.titlebarStyle + '; height:' + titleHeight
      } else if (Array.isArray(props.titlebarStyle)) {
        style = props.titlebarStyle
        style.push({ height: titleHeight })
      }
    }
    return style
  })

  function renderMenuItem(stateInfo) {

    if (stateInfo === MENU_ITEM_SEPARATOR) {
      return h(QSeparator)
    }
    console.log('CLICK ITEM')
    console.log(stateInfo)
    return withDirectives(h(QItem, {
      key: stateInfo.key,
      clickable: true,
      dense: props.dense,
      onClick: () => (stateInfo.state === true ? stateInfo.off.func() : stateInfo.on.func())
    }, () => [
      h(QItemSection, {
        noWrap: true
      }, () => (stateInfo.state === true ? stateInfo.off.label : stateInfo.on.label)),
      h(QItemSection, {
        avatar: true
      }, () => [
        h(QIcon, {
          name: stateInfo.state === true ? stateInfo.off.icon : stateInfo.on.icon
        })
      ])
    ]), [[ resolveDirective(CLOSE_POPUP_DIRECTIVE_NAME), true ]])
  }

  function renderMenu(menuData) {

    // let user manipulate menu
    if (props.menuFunc) {
      props.menuFunc(menuData)
    }

    return h(QMenu, () => [
      h(QList, {
          highlight: true,
          dense: true,
          style: [
            { zIndex: (isEmbedded.value === true) ? void 0 : computedZIndex.value + 1 },
            `background-color:${ props.backgroundColor }`,
            `color: ${ props.color }`
          ]
        }
        , () => [
          ...menuData.map(stateInfo => renderMenuItem(stateInfo))
        ])
    ])
  }

  function renderMenuButton(menuData) {
    if (props.noMenu === true) {
      return ''
    }

    return h(QBtn, {
      class: 'q-window__titlebar--actions',
      flat: true,
      round: true,
      dense: true,
      icon: 'more_vert'
    }, () => [
      renderMenu(menuData)
    ])
  }

  function renderTitle() {
    return h('div', {
      class: 'q-window__title col ellipsis'
    }, props.title)
  }

  function renderTitleBar() {
    if (props.headless === true) {
      return ''
    }
    const menuData = [...computedMenuData.value]
    const titlebarSlot = (slots.titlebar && slots.titlebar())

    return h('div', {
    class: [ tbStaticClass.value, props.titlebarClass ],
      style: tbStyle.value
    }, [
      titlebarSlot === void 0 ? renderTitle() : '',
      titlebarSlot === void 0 ? renderMenuButton(menuData) : '',
      titlebarSlot !== void 0 ? titlebarSlot(menuData) : '',
     (canDrag() === true) && renderResizeHandle('titlebar', props.noMenu ? 0 : 35) // width of more button
    ])
  }

  return { renderTitleBar }
}
