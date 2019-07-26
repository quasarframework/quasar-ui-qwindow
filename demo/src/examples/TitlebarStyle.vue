<template>
  <div>
    <q-window
      title="QWindow Titlebar Style"
      :titlebarStyle="{ borderBottom: '3px dashed #C4C27A', fontStyle: 'italic', fontSize: '2em' }"
      border-width="3px"
      border-style="dashed"
      color="#BB714F"
      background-color="#C4C27A"
      :height="300"
      :width="200"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
    >
      <div class="q-ma-md">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>
