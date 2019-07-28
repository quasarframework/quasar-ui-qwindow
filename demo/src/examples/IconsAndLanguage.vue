<template>
  <div>
    <q-window
      v-model="visible"
      title="QWindow Icons and Language"
      :iconSet="iconSet"
      :start-x="100"
      :start-y="100"
      :height="150"
      :width="350"
      :actions="['embedded', 'pin', 'maximize', 'fullscreen']"
      embedded
      content-class="bg-grey-1"
    >
      <div class="q-pa-md fit">
        This is the "default" slot content
      </div>
    </q-window>
  </div>
</template>

<script>
export default {
  data () {
    return {
      visible: true,
      iconSet: {
        visible: {
          on: {
            icon: 'fas fa-eye',
            label: 'Show Me!'
          },
          off: {
            icon: 'fas fa-eye-slash',
            label: 'Hide Me!'
          }
        },
        embedded: {
          on: {
            icon: 'fas fa-lock',
            label: 'Embed Me!'
          },
          off: {
            icon: 'fas fa-unlock',
            label: 'Float Me!'
          }
        },
        pinned: {
          on: {
            icon: 'fas fa-map-marker',
            label: 'Pin Me!'
          },
          off: {
            icon: 'fas fa-map-marker-alt',
            label: 'Unpin Me!'
          }
        },
        maximize: {
          on: {
            icon: 'fas fa-window-maximize',
            label: 'To the Max!'
          },
          off: {
            icon: 'fas fa-window-restore',
            label: 'Restore me!'
          }
        },
        fullscreen: {
          on: {
            icon: 'fas fa-expand',
            label: 'Enter fullscreen mode'
          },
          off: {
            icon: 'fas fa-compress',
            label: 'Leave fullscreen mode'
          }
        }
      }
    }
  }
}
</script>
