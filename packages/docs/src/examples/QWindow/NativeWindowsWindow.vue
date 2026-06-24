<template>
  <div class="q-pa-md q-window-native-stage column items-center justify-center">
    <q-window
      v-if="showing"
      v-model="showing"
      embedded
      no-menu
      hide-grippers
      hide-toolbar-divider
      :height="340"
      :content-style="windowStyle"
      :titlebar-style="titlebarStyle"
    >
      <template #titlebar>
        <div class="win-titlebar row items-center no-wrap">
          <div class="win-app-icon" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div class="win-title col ellipsis">QWindow Studio</div>
          <div class="win-controls row no-wrap">
            <span class="win-control" aria-hidden="true">-</span>
            <span class="win-control win-control--maximize" aria-hidden="true" />
            <button
              class="win-control win-control--close"
              type="button"
              aria-label="Close Windows window"
              @pointerdown.stop
              @click.stop="showing = false"
            />
          </div>
        </div>
      </template>

      <div class="win-window column no-wrap">
        <div class="win-commandbar row items-center no-wrap">
          <button
            v-for="command in commands"
            :key="command"
            class="win-command"
            type="button"
            @click="activeCommand = command"
          >
            {{ command }}
          </button>
        </div>

        <div class="win-content row no-wrap">
          <aside class="win-nav column">
            <button
              v-for="item in navItems"
              :key="item"
              class="win-nav-item"
              :class="{ 'win-nav-item--active': item === activeNav }"
              type="button"
              @click="activeNav = item"
            >
              {{ item }}
            </button>
          </aside>

          <section class="win-panel">
            <div class="text-caption text-blue-grey-6 q-mb-xs">{{ activeCommand }}</div>
            <h3>{{ activeNav }}</h3>
            <p>
              Use QWindow as a desktop-style surface for inspectors, dashboards, and utility panels.
            </p>

            <div class="win-metrics">
              <div v-for="metric in metrics" :key="metric.label" class="win-metric">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </q-window>

    <div v-else class="native-reopen column items-center justify-center text-center">
      <div class="text-subtitle2 text-weight-bold">Windows-style window closed</div>
      <div class="text-body2 text-blue-grey-7 q-mt-xs">
        The custom close button updates the QWindow model while the example stays embedded.
      </div>
      <q-btn
        class="q-mt-md"
        color="primary"
        unelevated
        label="Reopen Windows window"
        @click="showing = true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QWindow } from '@quasar/quasar-ui-qwindow'
import '@quasar/quasar-ui-qwindow/src/index.scss'

const showing = ref(true)
const activeCommand = ref('View')
const activeNav = ref('Dashboard')
const commands = ['File', 'Edit', 'View']
const navItems = ['Dashboard', 'Windows', 'Activity']
const metrics = [
  { label: 'Open', value: '12' },
  { label: 'Pinned', value: '4' },
  { label: 'Events', value: '38' },
]

const windowStyle = {
  border: '1px solid rgba(15, 23, 42, 0.22)',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)',
}

const titlebarStyle = {
  background: '#f3f6fb',
  color: '#111827',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
}
</script>

<style lang="scss" scoped>
.q-window-native-stage {
  min-height: 460px;
  background:
    linear-gradient(120deg, rgba(59, 130, 246, 0.14), transparent 42%),
    linear-gradient(135deg, #f8fafc, #e0f2fe);
}

.native-reopen {
  width: min(100%, 520px);
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 14px;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.12);
}

.win-titlebar {
  width: 100%;
  height: 100%;
  padding-left: 12px;
  font-size: 13px;
}

.win-app-icon {
  width: 18px;
  height: 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  margin-right: 10px;
}

.win-app-icon span {
  display: block;
  border-radius: 2px;
  background: #2563eb;
}

.win-title {
  font-weight: 600;
}

.win-controls {
  height: 100%;
  margin-left: auto;
}

.win-control {
  width: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  color: #334155;
  font-size: 15px;
  line-height: 1;
  background: transparent;
}

.win-control--maximize::before {
  content: '';
  width: 10px;
  height: 10px;
  display: block;
  border: 1px solid currentColor;
}

.win-control--close {
  position: relative;
  color: #991b1b;
  cursor: pointer;
}

.win-control--close::before,
.win-control--close::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 1.5px;
  border-radius: 999px;
  background-color: currentColor;
}

.win-control--close::before {
  transform: rotate(45deg);
}

.win-control--close::after {
  transform: rotate(-45deg);
}

.win-window {
  width: 100%;
  height: 100%;
  background: #f8fafc;
}

.win-commandbar {
  min-height: 44px;
  padding: 0 12px;
  gap: 4px;
  border-bottom: 1px solid #dbe4ef;
  background: #ffffff;
}

.win-command {
  padding: 6px 12px;
  border: 0;
  border-radius: 5px;
  color: #334155;
  font: inherit;
  background: transparent;
}

.win-command:hover {
  background: #e0f2fe;
}

.win-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.win-nav {
  width: 160px;
  padding: 12px;
  gap: 4px;
  border-right: 1px solid #dbe4ef;
  background: #eef4fb;
}

.win-nav-item {
  padding: 9px 10px;
  border: 0;
  border-radius: 6px;
  color: #334155;
  font: inherit;
  text-align: left;
  background: transparent;
}

.win-nav-item--active {
  color: #0f172a;
  background: #ffffff;
  box-shadow: inset 3px 0 0 #2563eb;
}

.win-panel {
  flex: 1 1 auto;
  min-width: 0;
  padding: 26px;
  overflow-y: auto;
  color: #1e293b;
}

.win-panel h3 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 24px;
}

.win-panel p {
  max-width: 480px;
  margin: 0 0 20px;
  line-height: 1.55;
}

.win-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.win-metric {
  padding: 14px;
  border: 1px solid #dbe4ef;
  border-radius: 8px;
  background: #ffffff;
}

.win-metric span,
.win-metric strong {
  display: block;
}

.win-metric span {
  color: #64748b;
  font-size: 12px;
}

.win-metric strong {
  margin-top: 4px;
  color: #0f172a;
  font-size: 24px;
}

@media (max-width: 599px) {
  .q-window-native-stage {
    min-height: 430px;
    padding: 12px;
  }

  .native-reopen {
    padding: 16px;
  }

  .win-content {
    flex-direction: column;
  }

  .win-nav {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid #dbe4ef;
  }

  .win-nav-item {
    white-space: nowrap;
  }

  .win-panel {
    padding: 22px;
  }

  .win-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
