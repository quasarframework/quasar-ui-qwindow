<template>
  <div class="q-ma-md" style="max-width: 800px; width: 100%">
    <div class="col">
      <q-btn
        color="primary"
        label="Menu"
        flat
        @click="menuClicked"
      />
      <div>
        <q-menu v-model="showMenu">
          <q-list
            style="min-width: 100px"
          >
            <q-item
              v-for="menuItem in menuData"
              clickable
              dense
              v-close-popup
              :key="menuItem.key"
              @click="menuItem.state === true ? menuItem.off.func() : menuItem.on.func()"
            >
              <q-item-section no-wrap>
                {{ menuItem.state === true ? menuItem.off.label : menuItem.on.label }}
              </q-item-section>
              <q-item-section avatar>
                <q-icon :name="menuItem.state === true ? menuItem.off.icon : menuItem.on.icon" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <q-window
        ref="window"
        v-model="visible"
        headless
        auto-pin
        title="QWindow Headless/AutoPin Selected Styles"
        :start-x="200"
        :start-y="200"
        :height="150"
        :width="350"
        :actions="['embedded', 'pin', 'fullscreen']"
        embedded
        :content-class="$refs.window && $refs.window.isSelected ? 'headless-selected' : 'headless-deselected'"
      />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      visible: true,
      showMenu: false,
      menuData: []
    }
  },
  methods: {
    menuClicked () {
      // everytime the menu is clicked, retrieve the computedMenuData from QWindow
      this.menuData = this.$refs.window.computedMenuData
      // tell QMenu to show the menu
      this.showMenu = true
    }
  }
}
</script>

<style lang="stylus">
.headless-deselected
  background-color rgba(105,179,190,0.514) !important
  border 1px dashed #e3cb47 !important

.headless-selected
  background-color rgba(172,83,83,0.42) !important
  border 1px dashed #e3cb47 !important

</style>
