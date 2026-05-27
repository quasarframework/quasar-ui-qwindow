<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from "quasar";
import { useDark } from "src/.q-press/composables/dark";

import getMeta from "src/.q-press/assets/get-meta";

const { initDark } = useDark();
initDark();

useMeta({
  title: "QWindow for Vue and Quasar",
  titleTemplate: (title) => `${title} | QWindow`,

  meta: getMeta(
    "QWindow - floating windows for Vue and Quasar",
    "QWindow is a Vue and Quasar component for building movable and resizable workspace panels.",
  ),
});
</script>
