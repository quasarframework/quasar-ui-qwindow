<template>
  <div>
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'ComponentProvide',
  provide: { myContext: 'some injected data' },
  data () {
    return {}
  }
}
</script>
