import { QBtn, QIcon, QItem, QItemSection, QList, QMenu, QSeparator } from 'quasar'
import { computed, h, withDirectives, resolveDirective } from 'vue'
import type { Ref, Slots } from 'vue'
import { MENU_ITEM_SEPARATOR } from '../QWindow'

const CLOSE_POPUP_DIRECTIVE_NAME = 'close-popup'
type MenuDataAction = {
  key?: string
  state: boolean
  on: {
    label: string
    icon: string
    func: () => boolean | void
  }
  off: {
    label: string
    icon: string
    func: () => boolean | void
  }
}

type MenuDataItem = typeof MENU_ITEM_SEPARATOR | MenuDataAction

export default function useToolbar(
  props: Record<string, any>,
  slots: Slots,
  computedZIndex: Ref<number>,
  canDrag: () => boolean,
  isDragging: Ref<boolean>,
  isEmbedded: Ref<boolean>,
  isMinimized: Ref<boolean>,
  computedMenuData: Ref<MenuDataItem[]>,
  onTitlebarDoubleClick: (evt: MouseEvent) => void,
  onTitlebarMouseDown: (evt: MouseEvent) => void,
  onTitlebarTouchStart: (evt: TouchEvent) => void,
) {
  const tbHeight = computed(() => {
    return props.headless === true ? 0 : props.dense === true ? 28 : 40
  })
  const tbStaticClass = computed(() => {
    return (
      'q-window__titlebar' +
      (props.hideToolbarDivider !== true ? ' q-window__titlebar--divider' : '') +
      (props.dense === true ? ' q-window__titlebar--dense' : '') +
      (canDrag() === true ? ' q-window__titlebar--movable' : '') +
      (isEmbedded.value !== true && isMinimized.value !== true ? ' absolute' : '') +
      (isDragging.value === true ? ' q-window__touch-action' : '') +
      ' row justify-between items-center'
    )
  })

  const tbStyle = computed(() => {
    const titleHeight = `${tbHeight.value}px`
    let style: any = { height: titleHeight }

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

  function renderMenuItem(stateInfo: MenuDataItem) {
    if (stateInfo === MENU_ITEM_SEPARATOR) {
      return h(QSeparator)
    }
    const action = stateInfo as MenuDataAction

    return withDirectives(
      h(
        QItem,
        {
          key: action.key,
          clickable: true,
          dense: props.dense,
          onClick: () => (action.state === true ? action.off.func() : action.on.func()),
        },
        () => [
          h(
            QItemSection,
            {
              noWrap: true,
            },
            () => (action.state === true ? action.off.label : action.on.label),
          ),
          h(
            QItemSection,
            {
              avatar: true,
            },
            () => [
              h(QIcon, {
                name: action.state === true ? action.off.icon : action.on.icon,
              }),
            ],
          ),
        ],
      ),
      [[resolveDirective(CLOSE_POPUP_DIRECTIVE_NAME), true]],
    )
  }

  function renderMenu(menuData: MenuDataItem[]) {
    // let user manipulate menu
    if (props.menuFunc) {
      props.menuFunc(menuData)
    }

    return h(QMenu, () => [
      h(
        QList,
        {
          highlight: true,
          dense: true,
          style: [
            { zIndex: isEmbedded.value === true ? void 0 : computedZIndex.value + 1 },
            `background-color:${props.backgroundColor}`,
            `color: ${props.color}`,
          ],
        },
        () => [...menuData.map((stateInfo) => renderMenuItem(stateInfo))],
      ),
    ])
  }

  function renderMenuButton(menuData: MenuDataItem[]) {
    if (props.noMenu === true) {
      return ''
    }

    return h(
      QBtn,
      {
        class: 'q-window__titlebar--actions',
        flat: true,
        round: true,
        dense: true,
        icon: 'more_vert',
      },
      () => [renderMenu(menuData)],
    )
  }

  function renderTitle() {
    return h(
      'div',
      {
        class: 'q-window__title col ellipsis',
      },
      props.title,
    )
  }

  function renderTitleBar() {
    if (props.headless === true) {
      return ''
    }
    const menuData = [...computedMenuData.value]
    const titlebarSlot = slots.titlebar

    return h(
      'div',
      {
        class: [tbStaticClass.value, props.titlebarClass],
        style: tbStyle.value,
        onDblclick: onTitlebarDoubleClick,
        onMousedown: onTitlebarMouseDown,
        onTouchstart: onTitlebarTouchStart,
      },
      [
        titlebarSlot === void 0 ? renderTitle() : '',
        titlebarSlot === void 0 ? renderMenuButton(menuData) : '',
        titlebarSlot !== void 0 ? titlebarSlot({ menuData }) : '',
      ] as any,
    )
  }

  return { renderTitleBar }
}
