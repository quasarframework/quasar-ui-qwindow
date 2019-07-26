<template>
  <div>
    <q-window
      title="QWindow Bring to Front After Drag 1"
      :height="500"
      :width="600"
      bring-to-front-after-drag
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      contentClass="bg-grey-1"
    >
      <div class="q-pa-md fit scroll">
        <q-scroll-area style="width: 100%; height: 100%">
          <div class="text-h4">Quasar Framework</div>
          <div class="quasar"><img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" alt="Quasar Framework" height="150" width="150"/></div>
          <p>Quasar Framework is an MIT-licensed open-source project maintained by Razvan Stoenescu along with his Team and a community of open source contributors. We work on behalf of the community to create new features, fix bugs, and maintain Quasar so you can get on with your own development projects. We’re working to shape the future of the Vue.js ecosystem to write code once and simultaneously deploy it as a website (SPA/PWA/SSR), a Mobile App and/or an Electron App.</p>
          <p>Like most open source products, Quasar can’t do it alone. We rely on sponsors, backers and supporters to keep things going. When Quasar starts to bring you some financial stability, please be considerate of the tens of thousands of hours that went into its creation and send some money back to the team that made it possible. And finally, if your company relies on Quasar, the best way to guarantee that Quasar continues to be there for you is to invest in its maintenance!</p>
        </q-scroll-area>
      </div>
    </q-window>
    <q-window
      title="QWindow Bring to Front After Drag 2"
      :height="500"
      :width="600"
      bring-to-front-after-drag
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      contentClass="bg-grey-1"
    >
      <div class="q-pa-md fit scroll">
        <q-scroll-area style="width: 100%; height: 100%">
          <div class="text-h4">Quasar Framework</div>
          <div class="quasar"><img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg" alt="Quasar Framework" height="150" width="150"/></div>
          <p>Quasar Framework is an MIT-licensed open-source project maintained by Razvan Stoenescu along with his Team and a community of open source contributors. We work on behalf of the community to create new features, fix bugs, and maintain Quasar so you can get on with your own development projects. We’re working to shape the future of the Vue.js ecosystem to write code once and simultaneously deploy it as a website (SPA/PWA/SSR), a Mobile App and/or an Electron App.</p>
          <p>Like most open source products, Quasar can’t do it alone. We rely on sponsors, backers and supporters to keep things going. When Quasar starts to bring you some financial stability, please be considerate of the tens of thousands of hours that went into its creation and send some money back to the team that made it possible. And finally, if your company relies on Quasar, the best way to guarantee that Quasar continues to be there for you is to invest in its maintenance!</p>
        </q-scroll-area>
      </div>
    </q-window>
  </div>
</template>
