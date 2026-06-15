<template>
  <div class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      Floating toolbars are useful when actions should follow the user's work area instead of living
      in a fixed page header.
    </div>

    <div>
      <q-btn color="primary" unelevated label="Open editor toolbar" @click="showing = true" />
    </div>

    <q-window
      v-model="showing"
      v-bind="windowProps"
      title="Selection Toolbar"
      dense
      no-resize
      hide-grippers
      :actions="toolbarActions"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
    >
      <div class="editor-toolbar row items-center q-pa-sm q-gutter-sm">
        <q-btn-toggle
          v-model="alignment"
          class="toolbar-toggle"
          dense
          unelevated
          :options="alignmentOptions"
        />

        <q-separator vertical dark />

        <q-btn class="toolbar-action" round dense flat icon="format_bold" />
        <q-btn class="toolbar-action" round dense flat icon="format_italic" />
        <q-btn class="toolbar-action" round dense flat icon="format_underlined" />
        <q-btn class="toolbar-action" round dense flat icon="format_color_text" />

        <q-separator vertical dark />

        <q-btn
          class="toolbar-action toolbar-action--accent"
          round
          dense
          unelevated
          icon="auto_fix_high"
        />
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QWindow, useQWindowResponsiveProps } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";

const showing = ref(false);
const alignment = ref("left");
const toolbarActions = ["pinned", "close"];
const windowProps = useQWindowResponsiveProps({
  width: 520,
  height: 126,
  startX: 96,
  startY: 132,
  mobileWidth: 320,
  mobileHeight: 188,
  mobileStartY: 96,
});

const alignmentOptions = [
  { label: "Left", value: "left", icon: "format_align_left" },
  { label: "Center", value: "center", icon: "format_align_center" },
  { label: "Right", value: "right", icon: "format_align_right" },
];

const windowStyle = {
  background: "#111827",
  borderColor: "rgba(148, 163, 184, 0.42)",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 22px 70px rgba(0, 0, 0, 0.42)",
};

const titlebarStyle = {
  background: "rgba(15, 23, 42, 0.94)",
  color: "#e5e7eb",
  borderColor: "rgba(148, 163, 184, 0.22)",
};
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 170px;
  overflow: visible;
}

.demo-copy {
  max-width: 680px;
  color: #607d8b;
}

.editor-toolbar {
  align-content: center;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  color: #f8fafc;
  background-color: #111827;

  :deep(.toolbar-toggle .q-btn) {
    color: #dbeafe !important;
    background-color: #172033 !important;
    border: 1px solid rgba(148, 163, 184, 0.22);
  }

  :deep(.toolbar-toggle .q-btn:hover),
  :deep(.toolbar-toggle .q-btn:focus-visible) {
    color: #ffffff !important;
    background-color: #1e3a5f !important;
  }

  :deep(.toolbar-toggle .q-btn[aria-pressed="true"]) {
    color: #06111f !important;
    background-color: #67e8f9 !important;
    border-color: #67e8f9;
  }

  :deep(.toolbar-toggle .q-btn[aria-pressed="true"]:hover),
  :deep(.toolbar-toggle .q-btn[aria-pressed="true"]:focus-visible) {
    color: #06111f !important;
    background-color: #a5f3fc !important;
  }

  :deep(.toolbar-action) {
    color: #e2e8f0 !important;
    background-color: rgba(15, 23, 42, 0.72);
  }

  :deep(.toolbar-action .q-icon) {
    color: currentColor !important;
  }

  :deep(.toolbar-action:hover),
  :deep(.toolbar-action:focus-visible) {
    color: #f8fafc !important;
    background-color: #1e3a5f !important;
  }

  :deep(.toolbar-action--accent) {
    color: #0f172a !important;
    background-color: #f59e0b !important;
  }

  :deep(.toolbar-action--accent:hover),
  :deep(.toolbar-action--accent:focus-visible) {
    color: #0f172a !important;
    background-color: #fbbf24 !important;
  }
}
</style>
