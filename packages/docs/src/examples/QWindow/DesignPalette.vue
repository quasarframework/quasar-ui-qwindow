<template>
  <div class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      Palette windows let users keep secondary controls nearby while preserving the main workspace.
      This style works well for design tools, map editors, low-code builders, and admin dashboards.
    </div>

    <div>
      <q-btn color="deep-orange" unelevated label="Open design palette" @click="showing = true" />
    </div>

    <q-window
      v-model="showing"
      v-bind="windowProps"
      title="Brush Palette"
      :actions="paletteActions"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
    >
      <div class="design-palette column">
        <div class="text-caption text-uppercase text-weight-bold text-blue-grey-4 q-mb-sm">
          Swatches
        </div>

        <div class="swatch-grid">
          <button
            v-for="color in swatches"
            :key="color"
            class="swatch"
            :class="{ 'swatch--active': selectedColor === color }"
            :style="{ backgroundColor: color }"
            type="button"
            @click="selectedColor = color"
          />
        </div>

        <div class="control-section">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-blue-grey-3">Opacity</span>
            <span class="text-caption text-blue-grey-4">{{ opacity }}%</span>
          </div>
          <q-slider v-model="opacity" color="deep-orange-5" :min="10" :max="100" />
        </div>

        <div class="control-section">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-blue-grey-3">Stroke</span>
            <span class="text-caption text-blue-grey-4">{{ stroke }} px</span>
          </div>
          <q-slider v-model="stroke" color="cyan-5" :min="1" :max="36" />
        </div>

        <div class="preview q-mt-md">
          <div
            class="preview-mark"
            :style="{
              '--preview-fill': previewColor,
              '--preview-shadow': previewShadow,
              width: `${previewSize}px`,
              height: `${previewSize}px`,
            }"
          />
        </div>
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { QWindow, useQWindowResponsiveProps } from '@quasar/quasar-ui-qwindow'
import '@quasar/quasar-ui-qwindow/src/index.scss'

const showing = ref(false)
const opacity = ref(86)
const stroke = ref(14)
const selectedColor = ref('#f97316')
const paletteActions = ['pinned', 'fullscreen', 'close']
const previewSize = computed(() => stroke.value * 3)
const previewAlpha = computed(() => opacity.value / 100)
const previewColor = computed(() => toRgba(selectedColor.value, previewAlpha.value))
const previewShadow = computed(
  () =>
    `0 0 ${12 + Math.round(previewAlpha.value * 26)}px ${toRgba(
      selectedColor.value,
      Math.min(previewAlpha.value, 0.72),
    )}`,
)
const windowProps = useQWindowResponsiveProps({
  width: 300,
  height: 560,
  startX: 128,
  startY: 150,
  mobileWidth: 300,
  mobileHeight: 560,
  mobileStartY: 96,
})

const swatches = [
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#14b8a6',
  '#38bdf8',
  '#6366f1',
  '#a855f7',
  '#ec4899',
]

const windowStyle = {
  background: '#151820',
  borderColor: 'rgba(248, 250, 252, 0.16)',
  borderRadius: '18px',
  overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.46)',
}

const titlebarStyle = {
  background: 'linear-gradient(90deg, #2f1b12, #1b2430)',
  color: '#fff7ed',
  borderColor: 'rgba(255, 237, 213, 0.18)',
}

function toRgba(hex: string, alpha: number): string {
  const color = hex.replace('#', '')
  const red = Number.parseInt(color.slice(0, 2), 16)
  const green = Number.parseInt(color.slice(2, 4), 16)
  const blue = Number.parseInt(color.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 180px;
  overflow: visible;
}

.demo-copy {
  max-width: 760px;
  color: #607d8b;
}

.design-palette {
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 18px;
  overflow-y: auto;
  background-color: #151820;
}

.swatch-grid {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, 56px);
  gap: 12px;
  margin-bottom: 30px;
}

.control-section {
  flex: 0 0 auto;
  margin-bottom: 18px;
}

.swatch {
  width: 100%;
  height: 100%;
  display: block;
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  cursor: pointer !important;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.swatch--active {
  border-color: #fff7ed;
  transform: translateY(-2px);
}

.preview {
  flex: 0 0 auto;
  display: grid;
  min-height: 132px;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 18px;
  overflow: hidden;
  background-color: #0f172a;
  background-image:
    linear-gradient(45deg, rgba(255, 255, 255, 0.12) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.12) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.12) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.12) 75%);
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
  background-size: 16px 16px;
}

.preview-mark {
  position: relative;
  border-radius: 999px;
  background: var(--preview-fill);
  box-shadow: var(--preview-shadow);
}
</style>
