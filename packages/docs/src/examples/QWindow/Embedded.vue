<template>
  <div class="q-pa-md">
    <div class="text-body2 text-blue-grey-7 q-mb-md">
      Add `embedded` when the panel should stay inside the page layout instead of floating through
      Teleport.
    </div>

    <div class="embedded-shell">
      <q-window
        v-model="showing"
        embedded
        no-menu
        title="Embedded Inspector"
        :height="300"
        :content-style="windowStyle"
        :titlebar-style="titlebarStyle"
      >
        <div class="embedded-content column q-gutter-md">
          <div class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-weight-bold">Selected widget</div>
              <div class="text-caption text-blue-grey-7">Hero callout block</div>
            </div>
            <q-badge color="teal-7" label="Synced" />
          </div>

          <q-input dense outlined label="Label" model-value="Launch workspace" readonly />
          <q-toggle dense model-value color="teal" label="Show icon" readonly />

          <q-banner rounded class="bg-teal-1 text-teal-10">
            Embedded windows work well for inspectors, side panels, and builder controls that belong
            to a specific page region.
          </q-banner>
        </div>
      </q-window>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QWindow } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";

const showing = ref(true);

const windowStyle = {
  background: "#f8fafc",
  borderColor: "#7f9a9a",
  borderRadius: "14px",
  overflow: "hidden",
};

const titlebarStyle = {
  background: "linear-gradient(90deg, #123c3c, #176869)",
  color: "#ecfeff",
  borderColor: "rgba(255, 255, 255, 0.16)",
};
</script>

<style lang="scss" scoped>
.embedded-shell {
  max-width: 620px;
  height: 300px;
  padding: 10px;
  border: 1px dashed rgba(23, 104, 105, 0.34);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(20, 184, 166, 0.1), transparent 46%), rgba(15, 23, 42, 0.04);
}

.embedded-content {
  min-height: 100%;
  padding: 16px;
  background: #f8fafc;
}
</style>
