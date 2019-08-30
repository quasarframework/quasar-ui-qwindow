<template>
  <div>
    <q-window
      ref="window1"
      v-model="visible1"
      title="QWindow Modify Menu 1"
      :start-x="50"
      :start-y="50"
      :height="300"
      :width="400"
      :menu-func="updateMenu1"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit scroll">
        <q-scroll-area style="width: 100%; height: 100%">
          <div class="text-h4">Quasar Framework</div>
          <div class="quasar-logo"><img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" alt="Quasar Framework" height="150" width="150" style="float:left" /></div>
          <p>Quasar Framework is an MIT-licensed open-source project maintained by Razvan Stoenescu along with his Team and a community of open source contributors. We work on behalf of the community to create new features, fix bugs, and maintain Quasar so you can get on with your own development projects. We’re working to shape the future of the Vue.js ecosystem to write code once and simultaneously deploy it as a website (SPA/PWA/SSR), a Mobile App and/or an Electron App.</p>
          <p>Like most open source products, Quasar can’t do it alone. We rely on sponsors, backers and supporters to keep things going. When Quasar starts to bring you some financial stability, please be considerate of the tens of thousands of hours that went into its creation and send some money back to the team that made it possible. And finally, if your company relies on Quasar, the best way to guarantee that Quasar continues to be there for you is to invest in its maintenance!</p>
        </q-scroll-area>
      </div>
    </q-window>
    <q-window
      ref="window2"
      v-model="visible2"
      title="QWindow Modify Menu 2"
      :start-x="100"
      :start-y="100"
      :height="300"
      :width="400"
      :menu-func="updateMenu2"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit scroll">
        <q-scroll-area style="width: 100%; height: 100%">
          <div class="text-h4">Quasar Framework</div>
          <div class="quasar-logo"><img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" alt="Quasar Framework" height="150" width="150" style="float:left" /></div>
          <p>Quasar Framework is an MIT-licensed open-source project maintained by Razvan Stoenescu along with his Team and a community of open source contributors. We work on behalf of the community to create new features, fix bugs, and maintain Quasar so you can get on with your own development projects. We’re working to shape the future of the Vue.js ecosystem to write code once and simultaneously deploy it as a website (SPA/PWA/SSR), a Mobile App and/or an Electron App.</p>
          <p>Like most open source products, Quasar can’t do it alone. We rely on sponsors, backers and supporters to keep things going. When Quasar starts to bring you some financial stability, please be considerate of the tens of thousands of hours that went into its creation and send some money back to the team that made it possible. And finally, if your company relies on Quasar, the best way to guarantee that Quasar continues to be there for you is to invest in its maintenance!</p>
        </q-scroll-area>
      </div>
    </q-window>
  </div>
</template>

<script>
export default {
  data () {
    return {
      visible1: true,
      visible2: true
    }
  },
  methods: {
    updateMenu1 (menuItems) {
      if (this.$refs.window1.isEmbedded !== true && this.$refs.window1.isFullscreen !== true) {
        if (menuItems[menuItems.length - 1].key === 'visible') {
          menuItems.splice(menuItems.length - 1, 0, 'separator')
        }
        let sendToBack = {
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
        let bringToFront = {
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
        let centerWindow = {
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
    },
    bringToFront1 () {
      this.$refs.window1.bringToFront()
    },
    sendToBack1 () {
      this.$refs.window1.sendToBack()
    },
    centerWindow1 () {
      this.$refs.window1.centerWindow()
    },
    updateMenu2 (menuItems) {
      if (this.$refs.window2.isEmbedded !== true && this.$refs.window2.isFullscreen !== true) {
        if (menuItems[menuItems.length - 1].key === 'visible') {
          menuItems.splice(menuItems.length - 1, 0, 'separator')
        }
        let sendToBack = {
          key: 'sendtoback',
          state: false,
          on: {
            label: 'Send to Back',
            icon: '',
            func: this.sendToBack2
          },
          off: {
            label: 'Send to Back',
            icon: '',
            func: this.sendToBack2
          }
        }
        let bringToFront = {
          key: 'bringtofront',
          state: false,
          on: {
            label: 'Bring to Front',
            icon: '',
            func: this.bringToFront2
          },
          off: {
            label: 'Bring to Front',
            icon: '',
            func: this.bringToFront2
          }
        }
        let centerWindow = {
          key: 'centerwindow',
          state: false,
          on: {
            label: 'Center Window',
            icon: '',
            func: this.centerWindow2
          },
          off: {
            label: 'Center Window',
            icon: '',
            func: this.centerWindow2
          }
        }
        menuItems.splice(menuItems.length, 0, 'separator')
        menuItems.splice(menuItems.length, 0, sendToBack)
        menuItems.splice(menuItems.length, 0, bringToFront)
        menuItems.splice(menuItems.length, 0, 'separator')
        menuItems.splice(menuItems.length, 0, centerWindow)
      }
    },
    bringToFront2 () {
      this.$refs.window2.bringToFront()
    },
    sendToBack2 () {
      this.$refs.window2.sendToBack()
    },
    centerWindow2 () {
      this.$refs.window2.centerWindow()
    }
  }
}
</script>
