<template>
  <div ref="stage" class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      Floating windows normally stay fixed to the viewport. This demo opens beside the example and
      uses `scroll-with-window`, so it stays attached to this document section as the page scrolls.
    </div>

    <div class="row q-gutter-sm">
      <q-btn color="primary" unelevated label="Open scroll-linked window" @click="openWindow" />
      <q-btn outline class="scroll-demo-button" label="Scroll demo area" @click="scrollDemo" />
    </div>

    <div ref="scrollArea" class="scroll-demo">
      <div class="scroll-marker">
        <div class="text-weight-bold">Annotated document area</div>
        <div class="text-caption">
          Open the helper, then scroll this page to see it stay aligned with this section.
        </div>
      </div>
      <div class="scroll-spacer" />
      <div class="scroll-marker scroll-marker--bottom">
        The helper moves with this document section instead of sticking to the viewport.
      </div>
    </div>

    <q-window
      v-if="showing"
      v-model="showing"
      title="Scroll-linked Helper"
      scroll-with-window
      :width="windowProps.width"
      :height="windowProps.height"
      :start-x="startX"
      :start-y="startY"
      :actions="windowActions"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
    >
      <div class="scroll-window">
        <div class="scroll-window-copy text-body2 text-blue-grey-8">
          This floating window uses document-relative positioning. When the page scrolls, it travels
          with the content instead of staying pinned to the viewport.
        </div>
        <q-banner rounded class="scroll-window-banner">
          Useful for annotations, callouts, and document tools.
        </q-banner>
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { QWindow, useQWindowResponsiveProps } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";

const showing = ref(false);
const stage = ref<HTMLElement | null>(null);
const scrollArea = ref<HTMLElement | null>(null);
const windowActions = ["pinned", "close"];
const startX = ref(130);
const startY = ref(170);
const windowProps = useQWindowResponsiveProps({
  width: 380,
  height: 240,
  startX: 130,
  startY: 170,
  mobileWidth: 300,
  mobileHeight: 270,
  mobileStartY: 120,
});

async function openWindow() {
  showing.value = false;
  await nextTick();

  const rect = stage.value?.getBoundingClientRect();
  const win = window;

  if (rect !== void 0) {
    const safePadding = 16;
    const targetLeft = win.scrollX + rect.left + 24;
    const maxVisibleLeft = win.scrollX + win.innerWidth - windowProps.value.width - safePadding;

    startX.value = Math.max(win.scrollX + safePadding, Math.min(targetLeft, maxVisibleLeft));
    startY.value = win.scrollY + rect.top + 136;
  }

  showing.value = true;
}

function scrollDemo() {
  scrollArea.value?.scrollIntoView({ behavior: "smooth", block: "end" });
}

const windowStyle = {
  background: "#f8fafc",
  borderColor: "#0ea5e9",
  borderRadius: "16px",
};

const titlebarStyle = {
  background: "linear-gradient(90deg, #0c4a6e, #0369a1)",
  color: "#f0f9ff",
  borderColor: "rgba(255, 255, 255, 0.18)",
  borderTopLeftRadius: "14px",
  borderTopRightRadius: "14px",
};
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 520px;
  overflow: visible;
}

.demo-copy {
  max-width: 760px;
  color: #607d8b;
}

.scroll-demo {
  display: grid;
  min-height: 380px;
  border: 1px dashed rgba(14, 165, 233, 0.34);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(14, 165, 233, 0.1), transparent 45%), rgba(15, 23, 42, 0.04);
}

.scroll-marker {
  padding: 12px 16px;
  color: #0369a1;
  font-weight: 700;
}

.scroll-marker--bottom {
  align-self: flex-end;
}

.scroll-spacer {
  min-height: 260px;
}

.scroll-window {
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

.scroll-window-copy,
.scroll-window-banner {
  min-width: 0;
  width: 100%;
}

.scroll-window-banner {
  color: #075985;
  background: #e0f2fe;
  border: 1px solid rgba(14, 165, 233, 0.22);
}

.scroll-demo-button {
  color: #075985 !important;
  border-color: rgba(7, 89, 133, 0.45) !important;
}

:global(.body--dark) .scroll-demo-button {
  color: #bae6fd !important;
  border-color: rgba(186, 230, 253, 0.7) !important;
}
</style>
