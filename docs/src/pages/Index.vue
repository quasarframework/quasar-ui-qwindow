<template>
  <q-page class="flex flex-center">

    <Actions></Actions>

  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import Actions from "components/Actions";

export default defineComponent({
  name: 'PageIndex',
  components: {Actions}
})
</script>
