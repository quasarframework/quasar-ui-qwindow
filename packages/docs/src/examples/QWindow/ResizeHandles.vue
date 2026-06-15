<template>
  <div class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      Use `resizable` to decide which sides and corners can resize the window. This keeps handles
      predictable for constrained layouts like drawers, inspectors, and docked tools.
    </div>

    <div>
      <q-btn color="teal" unelevated label="Open resize demo" @click="showing = true" />
    </div>

    <q-window
      v-model="showing"
      v-bind="windowProps"
      title="Bottom + Right Resize"
      :actions="windowActions"
      :resizable="resizeHandles"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
      gripper-border-color="#0f766e"
      gripper-background-color="#ccfbf1"
      round-grippers
    >
      <div class="resize-window">
        <div class="resize-copy text-body2 text-blue-grey-8">
          Only the bottom, right, and bottom-right handles are active. Try pulling the visible
          handles; the top and left sides stay locked.
        </div>

        <q-list dense bordered separator class="resize-list rounded-borders bg-white">
          <q-item v-for="handle in resizeHandles" :key="handle">
            <q-item-section avatar>
              <q-icon name="open_in_full" color="teal-7" />
            </q-item-section>
            <q-item-section>{{ handle }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QWindow, useQWindowResponsiveProps } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";

const showing = ref(false);
const windowActions = ["pinned", "close"];
const resizeHandles = ["right", "bottom", "bottom-right"];
const windowProps = useQWindowResponsiveProps({
  width: 380,
  height: 310,
  startX: 112,
  startY: 132,
  mobileWidth: 300,
  mobileHeight: 330,
  mobileStartY: 96,
});

const windowStyle = {
  background: "#f8fafc",
  borderColor: "#0f766e",
  borderRadius: "16px",
};

const titlebarStyle = {
  background: "linear-gradient(90deg, #134e4a, #0f766e)",
  color: "#ecfeff",
  borderColor: "rgba(255, 255, 255, 0.16)",
  borderTopLeftRadius: "14px",
  borderTopRightRadius: "14px",
};
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 300px;
  overflow: visible;
}

.demo-copy {
  max-width: 760px;
  color: #607d8b;
}

.resize-window {
  display: grid;
  align-content: flex-start;
  gap: 16px;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 18px;
  overflow-y: auto;
  background-color: #f8fafc;
}

.resize-copy,
.resize-list {
  min-width: 0;
  width: 100%;
}
</style>
