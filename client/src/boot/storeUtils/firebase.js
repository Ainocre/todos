import firebase from 'firebase'
import Vue from 'vue'

const firebaseConfig = {
  apiKey: "AIzaSyBlMM77XJAeELSO6pn4iDHAhUjxJoy0Ydg",
  authDomain: "simple-todos-3c1f3.firebaseapp.com",
  databaseURL: "https://simple-todos-3c1f3.firebaseio.com",
  projectId: "simple-todos-3c1f3",
  storageBucket: "simple-todos-3c1f3.appspot.com",
  messagingSenderId: "861120478315",
  appId: "1:861120478315:web:e2e765269efff61292052e",
}

firebase.initializeApp(firebaseConfig)

export const db = firebase.firestore()
export const functions = firebase.functions()
export const storage = firebase.storage()

Vue.prototype.$db = db
Vue.prototype.$functions = functions
Vue.prototype.$storage = storage

export default firebase
