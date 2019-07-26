<template>
  <div>
    <q-window
      title="QWindow Actions"
      :height="150"
      :width="200"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      contentClass="bg-grey-1"
    >
      <div class="q-ma-md">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>
