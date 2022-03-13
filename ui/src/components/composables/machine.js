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
        VISIBLE: {
          actions: [ 'visible', 'menu' ],
          target: 'idle',
        },
        EMBED: {
          actions: [ 'embed', 'menu' ],
          target: 'idle',
        },
        PIN: {
          actions: [ 'pin', 'menu' ],
          target: 'idle',
        },
        FULLSCREEN: [
          {
            actions: [ 'fullscreenLeave', 'menu' ],
            target: 'exitFullscreen',
            cond: 'isFullscreen'
          }, {
            actions: [ 'fullScreenEnter', 'menu' ],
            target: 'requestFullscreen',
          }
        ],
        MAXIMIZE: [
          {
            actions: [ 'restore', 'menu' ],
            target: 'idle',
            cond: 'isRestoreState'
          },
          {
            actions: [ 'maximize', 'menu' ],
            target: 'idle',
          }
        ],
        MINIMIZE: {
          actions: [ 'minimize', 'menu' ],
          target: 'idle',
        },
        RESTORE: {
          actions: [ 'restore', 'menu' ],
          target: 'idle',
        }
      }
    },
    requestFullscreen: {
      invoke: {
        id: 'openFullscreen',
        src: 'openFullscreen',
        onDone: {
          target: 'idle'
        },
        onError: {
          target: 'idle'
        }
      }
    },
    exitFullscreen: {
      invoke: {
        id: 'closeFullscreen',
        src: 'closeFullscreen',
        onDone: {
          target: 'idle'
        },
        onError: {
          target: 'idle'
        }
      }
    },
  }
});
