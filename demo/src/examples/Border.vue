<template>
  <div>
    <q-window
      title="QWindow Border"
      border-width="3px"
      border-style="dashed"
      color="#363641"
      background-color="#BB714F"
      :height="300"
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
