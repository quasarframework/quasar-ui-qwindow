import { createMachine } from "xstate";


export const qWindowMachine = createMachine({
  id: 'qwindow',
  initial: 'idle',
  states: {
    idle: {
      on: {
        update_menu_actions: {
          actions: ['menu']
        },
        visible: {
          actions: [ 'visible', 'menu' ],
          target: 'idle',
        },
        embedded: {
          actions: [ 'embed', 'menu' ],
          target: 'idle',
        },
        pin: {
          actions: [ 'pin', 'menu' ],
          target: 'idle',
        },
        fullscreen: [
          {
            actions: [ 'fullscreenLeave', 'menu' ],
            target: 'exitFullscreen',
            cond: 'isFullscreen'
          }, {
            actions: [ 'fullScreenEnter', 'menu' ],
            target: 'requestFullscreen',
          }
        ],
        maximize: [
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
        minimize: {
          actions: [ 'minimize', 'menu' ],
          target: 'idle',
        },
        restore: {
          actions: [ 'restore', 'menu' ],
          target: 'idle',
        },
        mousedown: {
          target: 'dragging',
          actions: ['onMouseDown']
        }

      }
    },
    dragging: {
        on: {
          mousemove: {
            target: 'dragging',
            actions: 'onMouseMove'
          },
          mouseup: {
            target: 'idle',
            actions: ['onMouseUp']
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
