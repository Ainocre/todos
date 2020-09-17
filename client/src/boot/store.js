import Vue from 'vue'

const store = Vue.observable({
  user: {
    firstName: 'Gui',
    lastName: 'Bou',
  },
})

Vue.prototype.$store = store

export default store
