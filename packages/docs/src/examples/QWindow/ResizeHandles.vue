<template>
  <div class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      Use `resizable` to decide which sides and corners can resize the window. Pick a preset, open
      the window, then pull the available handles to compare each resize pattern.
    </div>

    <div class="resize-presets row q-col-gutter-sm">
      <div v-for="preset in resizePresets" :key="preset.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          bordered
          flat
          class="resize-preset-card cursor-pointer"
          :class="{ 'resize-preset-card--active': selectedPreset.id === preset.id }"
          @click="selectPreset(preset.id)"
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-icon :name="preset.icon" size="22px" :color="preset.accentColor" />
              <div class="text-subtitle2 text-weight-bold">{{ preset.title }}</div>
            </div>
            <div class="text-caption text-blue-grey-7 q-mt-xs">
              {{ preset.description }}
            </div>
            <div class="resize-preset-handles q-mt-sm">
              <q-chip
                v-for="handle in preset.handles"
                :key="handle"
                square
                dense
                :color="preset.chipColor"
                :text-color="preset.chipTextColor"
              >
                {{ handle }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-btn
      color="teal"
      unelevated
      :label="`Open ${selectedPreset.shortLabel} demo`"
      @click="openSelectedPreset"
    />

    <q-window
      v-if="showing"
      v-model="showing"
      v-bind="windowProps"
      :title="`Resize: ${selectedPreset.title}`"
      :actions="windowActions"
      :resizable="selectedPreset.handles"
      :hide-grippers="selectedPreset.hideGrippers === true"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
      :gripper-border-color="selectedPreset.borderColor"
      :gripper-background-color="selectedPreset.gripperColor"
      round-grippers
    >
      <div class="resize-window">
        <div class="resize-copy text-body2 text-blue-grey-8">
          {{ selectedPreset.windowCopy }}
        </div>

        <q-list dense bordered separator class="resize-list rounded-borders bg-white">
          <q-item v-for="handle in selectedPreset.handles" :key="handle">
            <q-item-section avatar>
              <q-icon name="open_in_full" :color="selectedPreset.accentColor" />
            </q-item-section>
            <q-item-section>{{ handle }}</q-item-section>
          </q-item>
        </q-list>

        <q-banner v-if="selectedPreset.hideGrippers === true" rounded class="resize-note">
          The resize hit areas are still active, but the visible gripper squares are hidden.
        </q-banner>
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { QWindow, useQWindowResponsiveProps } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";

type ResizePreset = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  windowCopy: string;
  icon: string;
  handles: string[];
  accentColor: string;
  borderColor: string;
  chipColor: string;
  chipTextColor: string;
  gradient: string;
  gripperColor: string;
  hideGrippers?: boolean;
};

const showing = ref(false);
const windowActions = ["pinned", "close"];
const selectedPresetId = ref("drawer");
const resizePresets: ResizePreset[] = [
  {
    id: "all",
    title: "Full perimeter",
    shortLabel: "full perimeter",
    description: "Default behavior with every edge and corner enabled.",
    windowCopy: "All eight handles are active. Pull any side or corner to resize freely.",
    icon: "select_all",
    handles: [
      "top",
      "right",
      "bottom",
      "left",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ],
    accentColor: "blue-7",
    borderColor: "#2563eb",
    chipColor: "blue-1",
    chipTextColor: "blue-10",
    gradient: "linear-gradient(90deg, #1d4ed8, #2563eb)",
    gripperColor: "#dbeafe",
  },
  {
    id: "edges",
    title: "Edges only",
    shortLabel: "edges only",
    description: "Useful when corners should stay visually quiet.",
    windowCopy: "Only the top, right, bottom, and left edges are active. Corners stay locked.",
    icon: "border_outer",
    handles: ["top", "right", "bottom", "left"],
    accentColor: "indigo-7",
    borderColor: "#4f46e5",
    chipColor: "indigo-1",
    chipTextColor: "indigo-10",
    gradient: "linear-gradient(90deg, #3730a3, #4f46e5)",
    gripperColor: "#e0e7ff",
  },
  {
    id: "corners",
    title: "Corners only",
    shortLabel: "corners only",
    description: "Diagonal resizing without side-edge handles.",
    windowCopy: "Only the four corner handles are active. Side edges do not resize the window.",
    icon: "crop_free",
    handles: ["top-left", "top-right", "bottom-left", "bottom-right"],
    accentColor: "deep-purple-7",
    borderColor: "#7c3aed",
    chipColor: "deep-purple-1",
    chipTextColor: "deep-purple-10",
    gradient: "linear-gradient(90deg, #5b21b6, #7c3aed)",
    gripperColor: "#ede9fe",
  },
  {
    id: "drawer",
    title: "Drawer growth",
    shortLabel: "drawer growth",
    description: "Constrained resizing from the lower-right side.",
    windowCopy:
      "Only the bottom, right, and bottom-right handles are active. The top and left sides stay locked.",
    icon: "open_in_full",
    handles: ["right", "bottom", "bottom-right"],
    accentColor: "teal-7",
    borderColor: "#0f766e",
    chipColor: "teal-1",
    chipTextColor: "teal-10",
    gradient: "linear-gradient(90deg, #134e4a, #0f766e)",
    gripperColor: "#ccfbf1",
  },
  {
    id: "hidden",
    title: "Invisible handles",
    shortLabel: "invisible handles",
    description: "All resize zones remain active without visible grippers.",
    windowCopy:
      "All eight resize hit areas are active, but the visible gripper squares are hidden for a cleaner panel.",
    icon: "visibility_off",
    handles: [
      "top",
      "right",
      "bottom",
      "left",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ],
    accentColor: "cyan-8",
    borderColor: "#0891b2",
    chipColor: "cyan-1",
    chipTextColor: "cyan-10",
    gradient: "linear-gradient(90deg, #155e75, #0891b2)",
    gripperColor: "#cffafe",
    hideGrippers: true,
  },
];
const defaultResizePreset = resizePresets.find((preset) => preset.id === "drawer") as ResizePreset;
const selectedPreset = computed<ResizePreset>(
  () => resizePresets.find((preset) => preset.id === selectedPresetId.value) ?? defaultResizePreset,
);
const windowProps = useQWindowResponsiveProps({
  width: 380,
  height: 310,
  startX: 112,
  startY: 132,
  mobileWidth: 300,
  mobileHeight: 330,
  mobileStartY: 96,
});

function selectPreset(id: string) {
  selectedPresetId.value = id;
}

async function openSelectedPreset() {
  showing.value = false;
  await nextTick();
  showing.value = true;
}

const windowStyle = computed(() => ({
  background: "#f8fafc",
  borderColor: selectedPreset.value.borderColor,
  borderRadius: "16px",
}));

const titlebarStyle = computed(() => ({
  background: selectedPreset.value.gradient,
  color: "#ecfeff",
  borderColor: "rgba(255, 255, 255, 0.16)",
  borderTopLeftRadius: "14px",
  borderTopRightRadius: "14px",
}));
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 420px;
  overflow: visible;
}

.demo-copy {
  max-width: 760px;
  color: #607d8b;
}

.resize-presets {
  max-width: 880px;
}

.resize-preset-card {
  height: 100%;
  border-color: rgba(15, 118, 110, 0.18);
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.resize-preset-card:hover,
.resize-preset-card--active {
  border-color: rgba(15, 118, 110, 0.65);
  box-shadow: 0 12px 24px rgba(15, 118, 110, 0.12);
  transform: translateY(-1px);
}

.resize-preset-card--active {
  background: linear-gradient(135deg, rgba(204, 251, 241, 0.56), rgba(255, 255, 255, 0.92));
}

.resize-preset-handles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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

.resize-note {
  color: #155e75;
  background: #ecfeff;
  border: 1px solid rgba(8, 145, 178, 0.2);
}
</style>
