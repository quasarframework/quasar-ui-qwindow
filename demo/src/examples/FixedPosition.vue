<template>
  <div>
    <q-window
      title="QWindow Fixed Position"
      :height="300"
      :width="200"
      fixed-position
      :actions="['embedded']"
      embedded
      contentClass="bg-grey-1"
    >
      <div class="q-ma-md">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>
