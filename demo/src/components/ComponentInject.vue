<template>
  <div class="row full-width">
    <div class="col-xs-12">
      Injected: {{myContext}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentInject',
  props: ['test'],
  inject: ['myContext'],
  data () {
    return {}
  }
}
</script>
