<template>
  <div>
    <q-window
      title="QWindow Color"
      color="yellow-2"
      background-color="blue-grey-4"
      :height="150"
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
