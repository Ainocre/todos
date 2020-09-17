import Vue from 'vue'
import feathers from './feathers.js'
import toaster from './toaster.js'

const store = Vue.observable({
  user: null,
})

store.signin = ({ email, password }) => {
  return feathers.authenticate({
    strategy: 'local',
    email,
    password,
  })
    .then(({ user }) => {
      store.user = user
    })
}

store.signup = (user) => {
  return feathers.service('users').create(user)
    .then(() => store.signin(user))
    .catch((err) => {
      if (err.message === 'email: value already exists.') {
        toaster.error('Un compte existe déjà avec cet email.')
      } else {
        toaster.error('Une erreur est survenue, veuillez réessayer plus tard.')
      }

      throw err
    })
}

store.reAuthenticate = () => {
  return feathers.reAuthenticate()
    .then(({ user }) => {
      store.user = user
    })
}

store.signout = () => {
  return feathers.logout()
    .then(() => {
      store.user = null
    })
}

Vue.prototype.$store = store

export default store
