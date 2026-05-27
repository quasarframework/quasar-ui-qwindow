<template>
  <div class="q-pa-md q-window-demo-stage column q-gutter-md">
    <div class="demo-copy">
      Multiple QWindow instances can float at the same time. Selecting one brings it forward, making
      lightweight workspace layouts possible.
    </div>

    <div class="row q-gutter-sm">
      <q-btn color="primary" unelevated label="Open inbox" @click="showInbox = true" />
      <q-btn color="deep-orange" unelevated label="Open task list" @click="showTasks = true" />
    </div>

    <q-window
      v-model="showInbox"
      title="Inbox"
      :width="inboxWidth"
      :height="inboxHeight"
      :start-x="inboxStartX"
      :start-y="inboxStartY"
      :actions="windowActions"
      :content-style="inboxStyle"
      :titlebar-style="inboxTitlebarStyle"
    >
      <div class="workspace-window workspace-window--inbox">
        <q-item v-for="item in inboxItems" :key="item" dense class="workspace-item rounded-borders">
          <q-item-section avatar>
            <q-icon name="mail" color="primary" />
          </q-item-section>
          <q-item-section>{{ item }}</q-item-section>
        </q-item>
      </div>
    </q-window>

    <q-window
      v-model="showTasks"
      title="Task List"
      :width="tasksWidth"
      :height="tasksHeight"
      :start-x="tasksStartX"
      :start-y="tasksStartY"
      :actions="windowActions"
      :content-style="taskStyle"
      :titlebar-style="taskTitlebarStyle"
    >
      <div class="workspace-window workspace-window--tasks">
        <q-checkbox
          v-for="task in tasks"
          :key="task"
          class="task-checkbox rounded-borders"
          dense
          :model-value="false"
          :label="task"
        />
      </div>
    </q-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { QWindow } from "@quasar/quasar-ui-qwindow";
import "@quasar/quasar-ui-qwindow/src/index.scss";
import { useResponsiveWindow } from "./useResponsiveWindow";

const showInbox = ref(false);
const showTasks = ref(false);
const windowActions = ["pinned", "close"];
const {
  width: inboxWidth,
  height: inboxHeight,
  startX: inboxStartX,
  startY: inboxStartY,
} = useResponsiveWindow({
  width: 340,
  height: 230,
  startX: 92,
  startY: 140,
  mobileWidth: 310,
  mobileStartY: 120,
});
const {
  width: tasksWidth,
  height: tasksHeight,
  startX: tasksStartX,
  startY: tasksStartY,
} = useResponsiveWindow({
  width: 330,
  height: 210,
  startX: 250,
  startY: 205,
  mobileWidth: 310,
  mobileHeight: 220,
  mobileStartX: 28,
  mobileStartY: 238,
});

const inboxItems = ["Release review", "Design feedback", "Netlify deploy"];
const tasks = ["Check keyboard flow", "Review resize handles", "Capture beta notes"];

const inboxStyle = {
  background: "#f8fafc",
  borderColor: "#60a5fa",
  borderRadius: "16px",
};

const inboxTitlebarStyle = {
  background: "linear-gradient(90deg, #1d4ed8, #2563eb)",
  color: "#eff6ff",
  borderColor: "rgba(255, 255, 255, 0.16)",
  borderTopLeftRadius: "14px",
  borderTopRightRadius: "14px",
};

const taskStyle = {
  background: "#fff7ed",
  borderColor: "#fb923c",
  borderRadius: "16px",
};

const taskTitlebarStyle = {
  background: "linear-gradient(90deg, #9a3412, #ea580c)",
  color: "#fff7ed",
  borderColor: "rgba(255, 255, 255, 0.18)",
  borderTopLeftRadius: "14px",
  borderTopRightRadius: "14px",
};
</script>

<style lang="scss" scoped>
.q-window-demo-stage {
  min-height: 230px;
  overflow: visible;
}

.demo-copy {
  max-width: 760px;
  color: #607d8b;
}

.workspace-window {
  display: grid;
  align-content: start;
  gap: 10px;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 16px;
  overflow-y: auto;
  color: #1e293b;
  background-color: #fff7ed;
}

.workspace-window--inbox {
  background-color: #f8fafc;
}

.workspace-item,
.task-checkbox {
  width: 100%;
  min-width: 0;
  color: #1e293b;
  background-color: rgba(255, 255, 255, 0.92);
}

.task-checkbox {
  padding: 8px 10px;
  border: 1px solid rgba(251, 146, 60, 0.2);
}

.task-checkbox :deep(.q-checkbox__inner) {
  color: #9a3412;
}

.task-checkbox :deep(.q-checkbox__bg) {
  background: #fffaf3;
  border-color: #9a3412;
}

.task-checkbox :deep(.q-checkbox__label) {
  color: #7c2d12;
}
</style>
