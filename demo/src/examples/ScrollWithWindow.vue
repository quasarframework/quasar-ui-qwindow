<template>
  <div>
    <q-window
      title="QWindow Scroll With Window"
      scroll-with-window
      :height="150"
      :width="350"
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
