<template>
  <div ref="stageRef" class="q-pa-md q-window-demo-stage column q-gutter-md">
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
                <q-icon :name="handleMeta[handle].icon" size="14px" class="q-mr-xs" />
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
      :start-x="startX"
      :start-y="startY"
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

        <div class="handle-map" :style="handleMapStyle">
          <div class="handle-map__panel">
            <div class="text-weight-bold">Preview</div>
            <div class="text-caption">
              {{ selectedPreset.hideGrippers === true ? "Hidden hit areas" : "Visible grippers" }}
            </div>
          </div>

          <div
            v-for="handle in allResizeHandles"
            :key="handle"
            class="handle-marker"
            :class="[
              `handle-marker--${handle}`,
              { 'handle-marker--active': isHandleActive(handle) },
            ]"
          >
            <q-icon :name="handleMeta[handle].icon" size="16px" />
          </div>
        </div>

        <q-banner rounded class="resize-color-note">
          <span class="text-weight-bold">Color props:</span>
          border
          <span class="color-swatch" :style="{ backgroundColor: selectedPreset.borderColor }" />
          and background
          <span class="color-swatch" :style="{ backgroundColor: selectedPreset.gripperColor }" />
          are passed through `gripper-border-color` and `gripper-background-color`.
        </q-banner>

        <q-list dense bordered separator class="resize-list rounded-borders bg-white">
          <q-item v-for="handle in selectedPreset.handles" :key="handle">
            <q-item-section avatar>
              <q-icon :name="handleMeta[handle].icon" :color="selectedPreset.accentColor" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ handleMeta[handle].label }}</q-item-label>
              <q-item-label caption>{{ handleMeta[handle].cursor }} cursor</q-item-label>
            </q-item-section>
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

type ResizeHandle =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

type ResizePreset = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  windowCopy: string;
  icon: string;
  handles: ResizeHandle[];
  accentColor: string;
  borderColor: string;
  chipColor: string;
  chipTextColor: string;
  gradient: string;
  gripperColor: string;
  hideGrippers?: boolean;
};

type HandleMeta = {
  cursor: string;
  icon: string;
  label: string;
};

const allResizeHandles: ResizeHandle[] = [
  "top",
  "right",
  "bottom",
  "left",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];
const handleMeta: Record<ResizeHandle, HandleMeta> = {
  top: {
    cursor: "n-resize",
    icon: "north",
    label: "Top edge",
  },
  right: {
    cursor: "e-resize",
    icon: "east",
    label: "Right edge",
  },
  bottom: {
    cursor: "s-resize",
    icon: "south",
    label: "Bottom edge",
  },
  left: {
    cursor: "w-resize",
    icon: "west",
    label: "Left edge",
  },
  "top-left": {
    cursor: "nw-resize",
    icon: "north_west",
    label: "Top-left corner",
  },
  "top-right": {
    cursor: "ne-resize",
    icon: "north_east",
    label: "Top-right corner",
  },
  "bottom-left": {
    cursor: "sw-resize",
    icon: "south_west",
    label: "Bottom-left corner",
  },
  "bottom-right": {
    cursor: "se-resize",
    icon: "south_east",
    label: "Bottom-right corner",
  },
};

const showing = ref(false);
const stageRef = ref<HTMLElement | null>(null);
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
  width: 430,
  height: 420,
  startX: 112,
  startY: 132,
  mobileWidth: 320,
  mobileHeight: 420,
  mobileStartY: 96,
});
const startX = ref(112);
const startY = ref(132);

function selectPreset(id: string) {
  selectedPresetId.value = id;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function updateWindowStart() {
  const rect = stageRef.value?.getBoundingClientRect();
  const width = windowProps.value.width;
  const height = windowProps.value.height;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxX = Math.max(16, viewportWidth - width - 16);
  const maxY = Math.max(64, viewportHeight - height - 16);
  const viewportX = clamp((rect?.left ?? 24) + 24, 16, maxX);
  const viewportY = clamp((rect?.top ?? 80) + 160, 64, maxY);

  startX.value = window.scrollX + viewportX;
  startY.value = window.scrollY + viewportY;
}

async function openSelectedPreset() {
  showing.value = false;
  updateWindowStart();
  await nextTick();
  showing.value = true;
}

function isHandleActive(handle: ResizeHandle) {
  return selectedPreset.value.handles.includes(handle);
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

const handleMapStyle = computed<Record<string, string>>(() => ({
  "--resize-gripper-border-color": selectedPreset.value.borderColor,
  "--resize-gripper-background-color": selectedPreset.value.gripperColor,
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

.handle-map {
  position: relative;
  min-height: 150px;
  margin: 0 10px;
  border: 1px dashed rgba(96, 125, 139, 0.36);
  border-radius: 16px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.9), transparent 34%),
    linear-gradient(135deg, #ffffff, #eef6fb);
}

.handle-map__panel {
  position: absolute;
  inset: 32px 42px;
  display: grid;
  place-content: center;
  text-align: center;
  color: #546e7a;
  border: 1px solid rgba(84, 110, 122, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
}

.handle-marker {
  position: absolute;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  color: #90a4ae;
  background: #eceff1;
  border: 2px solid #cfd8dc;
  border-radius: 999px;
  opacity: 0.45;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    opacity 0.16s ease,
    transform 0.16s ease;
}

.handle-marker--active {
  color: var(--resize-gripper-border-color);
  background: var(--resize-gripper-background-color);
  border-color: var(--resize-gripper-border-color);
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.16);
  opacity: 1;
}

.handle-marker--top {
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
}

.handle-marker--right {
  top: 50%;
  right: -15px;
  transform: translateY(-50%);
}

.handle-marker--bottom {
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
}

.handle-marker--left {
  top: 50%;
  left: -15px;
  transform: translateY(-50%);
}

.handle-marker--top-left {
  top: -15px;
  left: -15px;
}

.handle-marker--top-right {
  top: -15px;
  right: -15px;
}

.handle-marker--bottom-left {
  bottom: -15px;
  left: -15px;
}

.handle-marker--bottom-right {
  right: -15px;
  bottom: -15px;
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

.resize-color-note {
  color: #455a64;
  background: #ffffff;
  border: 1px solid rgba(84, 110, 122, 0.14);
}

.color-swatch {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  margin: 0 0.2em;
  vertical-align: -0.08em;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 999px;
}

.resize-note {
  color: #155e75;
  background: #ecfeff;
  border: 1px solid rgba(8, 145, 178, 0.2);
}
</style>
