<template>
  <div class="q-pa-md q-window-demo-stage">
    <q-window
      v-model="showing"
      v-bind="windowProps"
      embedded
      title="Project Notes"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
      gripper-background-color="#f8fafc"
      gripper-border-color="#0f3557"
      round-grippers
    >
      <div class="project-notes column q-gutter-md">
        <div class="text-subtitle1 text-weight-bold">Embedded first, floating when needed</div>
        <div class="text-body2 text-blue-grey-8">
          QWindow can live inside the page layout first, then float when users need a movable
          workspace panel.
        </div>
        <q-banner rounded class="bg-blue-1 text-blue-10">
          Open the title bar menu and choose <strong>Float</strong>. Once floating, drag the title
          bar or pull a resize handle.
        </q-banner>
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QWindow, useQWindowResponsiveProps } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";

const showing = ref(true);
const windowProps = useQWindowResponsiveProps({
  width: 420,
  height: 260,
  startX: 72,
  startY: 104,
  mobileWidth: 320,
  mobileHeight: 280,
  mobileStartY: 88,
});

const windowStyle = {
  background: "#f8fafc",
  borderColor: "#8aa1b2",
  borderRadius: "14px",
};

const titlebarStyle = {
  background: "linear-gradient(90deg, #102033, #193d55)",
  color: "#f8fafc",
  borderColor: "rgba(255, 255, 255, 0.14)",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
};
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  height: 320px;
  max-width: 640px;
  min-height: 360px;
  position: relative;
  overflow: visible;
}

.project-notes {
  min-height: 100%;
  padding: 18px;
  background-color: #f8fafc;
}
</style>
