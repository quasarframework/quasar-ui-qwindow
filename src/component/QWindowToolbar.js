import Vue from 'vue'

// Styles
import './window.styl'

export default function (ssrContext) {
  return Vue.extend({
    name: 'q-window_toolbar',

    props: {
      title: String,
      actions: Array,
      contentStyler: Function
    },

    data () {
      return {
        initial: true,
        state: {
        }
      }
    },

    mounted () {
    },

    computed: {
      style () {
        let style = {
        }

        return style
      },

      classes () {
        return ''
      },

      attrs () {
        let attrs = {
        }
        return attrs
      }
    },

    methods: {
    },

    render (h) {
      return h('div', {
        staticClass: 'q-window_toolbar',
        class: this.classes,
        style: this.style,
        attrs: this.attrs
      }, [
      ])
    }
  })
}
