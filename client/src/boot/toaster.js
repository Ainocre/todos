import { Notify } from 'quasar'
import Vue from 'vue'

const toaster = {
  success (message, options = {}) {
    Notify.create({
      color: 'positive',
      message,
      position: 'top',
      timeout: 1500,
      ...options,
    })
  },
  error (message, options = {}) {
    Notify.create({
      color: 'negative',
      message,
      position: 'top',
      timeout: 2500,
      ...options,
    })
  },
}

Vue.prototype.$toaster = toaster

export default toaster
