import { createMachine } from "xstate";




export const qWindowMachine = createMachine({
  id: 'qwindow',
  initial: 'idle',
  states: {
    idle: {
      on: {
        UPDATE_MENU_ACTIONS: {
          actions: ['menu']
        },
        SHOW: {
          actions: ['show']
        },
        HIDE: {
          actions: ['hide']
        },
        LOCK: {
          actions: ['lock']
        },
        UNLOCK: {
          actions: ['unlock']
        },
        PIN: {
          actions: ['pin']
        },
        UNPIN: {
          actions: ['unpin']
        },
        MAXIMIZE: {
          actions: ['maximize']
        },
        MINIMIZE: {
          actions: ['minimize']
        },
        RESTORE: {
          actions: ['restore']
        },
        FULLSCREEN_LEAVE: {
          actions: ['fullscreenLeave']
        },
        FULLSCREEN_ENTER: {
          actions: ['fullScreenEnter']
        }
      }
    }
  }
});
