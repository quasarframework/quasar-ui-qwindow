<template>
  <div>
    <q-window
      title="QWindow Basic"
      :height="150"
      :width="350"
      :actions="['embedded']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-ma-md">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>
