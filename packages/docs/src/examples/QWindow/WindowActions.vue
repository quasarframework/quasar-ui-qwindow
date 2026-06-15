<template>
  <div class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      Actions control which built-in menu items are available. This example enables pinning,
      maximize, fullscreen, and close so users can try the main window states.
    </div>

    <div>
      <q-btn color="primary" unelevated label="Open actions window" @click="showing = true" />
    </div>

    <q-window
      v-model="showing"
      v-bind="windowProps"
      title="Window Actions"
      :actions="windowActions"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
    >
      <div class="actions-window column q-gutter-md">
        <div class="row q-col-gutter-sm">
          <div v-for="action in actionChips" :key="action" class="col-auto">
            <q-chip square dense color="indigo-1" text-color="indigo-10">
              {{ action }}
            </q-chip>
          </div>
        </div>

        <div class="text-body2 text-blue-grey-8">
          Use the menu in the title bar to pin the window, maximize it, move into fullscreen, or
          close it.
        </div>
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QWindow, useQWindowResponsiveProps } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";

const showing = ref(false);
const windowActions = ["pinned", "maximize", "fullscreen", "close"];
const actionChips = ["pinned", "maximize", "fullscreen", "close"];
const windowProps = useQWindowResponsiveProps({
  width: 430,
  height: 230,
  startX: 120,
  startY: 138,
  mobileWidth: 320,
  mobileHeight: 270,
  mobileStartY: 96,
});

const windowStyle = {
  background: "#f8fafc",
  borderColor: "#818cf8",
  borderRadius: "16px",
};

const titlebarStyle = {
  background: "linear-gradient(90deg, #312e81, #3730a3)",
  color: "#eef2ff",
  borderColor: "rgba(255, 255, 255, 0.16)",
  borderTopLeftRadius: "14px",
  borderTopRightRadius: "14px",
};
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 280px;
  overflow: visible;
}

.demo-copy {
  max-width: 760px;
  color: #607d8b;
}

.actions-window {
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 18px;
  overflow-y: auto;
  background-color: #f8fafc;
}
</style>
