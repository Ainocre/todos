import Vue from 'vue'
import Vuex from 'vuex'
import { sortBy } from 'lodash'
import server from '../utils/server.js'

Vue.use(Vuex)

const sortChronologically = (type, tasks) => {
  if (type === 'todo') {
    const todos = sortBy(tasks, task => new Date(task._createdAt))
    todos.reverse()
    return todos
  }
  if (type === 'done') {
    const done = sortBy(tasks, task => new Date(task.doneAt))
    done.reverse()
    return done
  }
  return tasks
}

const store = new Vuex.Store({
  state: {
    categories: [],
    connectionLoader: false,
    doneTasks: [],
    isConnected: false,
    isReady: false,
    tasks: [],
    user: null,
  },

  getters: {
    getCategory(state) {
      return (id) => {
        if (id === 'starred') return { _id: 'starred' }
        return state.categories.find(category => category._id === id) || {}
      }      
    },

    starredTodos(state) {
      return state.tasks.filter(todo => todo.starred && !todo.done)
    },


    categorySizes(state) {
      const todos = state.tasks.filter(({ done }) => !done)
      const res = {}
      state.categories.forEach((category) => {
        res[category._id] = todos.filter(task => task.categoryId === category._id).length
      })
      return res
    },
  },

  mutations: {
    setUser(state, user) {
      state.user = user
    },
    isReady(state) {
      state.isReady = true
    },
    connectionLoader(state, newState) {
      state.connectionLoader = newState
    },
    setCategories(state, categories) {
      state.categories = categories
    },
    isConnected(state, isConnected) {
      state.isConnected = isConnected
    },
    resetState(state) {
      state.categories = []
      state.currentCategory = 'main'
      state.isConnected = false
      state.tasks = []
      state.user = null
    },


    createCategory(state, category) {
      state.categories.push(category)
    },
    updateCategory(state, newCategory) {
      const index = state.categories.findIndex(cat => cat._id === newCategory._id)
      state.categories.splice(index, 1, newCategory)
    },
    deleteCategory(state, category) {
      const index = state.categories.findIndex(cat => cat._id === category._id)
      state.categories.splice(index, 1)
    },


    updateTask(state, task) {
      const index = state.tasks.findIndex(t => t._id === task._id)
      state.tasks.splice(index, 1, task)
    },
    addTask(state, task) {
      state.tasks.unshift(task)
    },
    checkTask(state, task) {
      const index = state.tasks.findIndex(t => t._id === task._id)
      state.tasks.splice(index, 1)
      state.doneTasks.unshift(task)
    },
    uncheckTask(state, task) {
      const index = state.doneTasks.findIndex(t => t._id === task._id)
      state.doneTasks.splice(index, 1)
      state.tasks.unshift(task)
    },
    setTasks(state, tasks) {
      Vue.set(state, 'tasks', tasks)
    },
    setDoneTasks(state, tasks) {
      Vue.set(state, 'doneTasks', tasks)
    },
  },

  actions: {
    fetchStart(ctx) {
      ctx.commit('connectionLoader', true)
      server.ql({
        service: 'fetchStart',
      })
        .then(({ data: { user, categories, todos } }) => {
          ctx.commit('setTasks', sortChronologically('todo', todos.filter(({ done }) => !done)))
          ctx.commit('setDoneTasks', sortChronologically('done', todos.filter(({ done }) => !!done)))
          ctx.commit('setUser', user)
          ctx.commit('setCategories', categories)
          ctx.commit('isConnected', true)
          ctx.commit('isReady', true)
          ctx.commit('connectionLoader', false)
        })
        .catch((err) => {
          ctx.commit('isReady')
          ctx.commit('connectionLoader', false)
          throw err
        })
    },
    signin(ctx, { email, pwd }) {
      return server.query({
        route: '/signin',
        fields: { email, pwd },
      })
        .then(({ data }) => {
          localStorage.todoToken = data
          return ctx.dispatch('fetchStart')
        })
    },
    signup(ctx, { email, pwd }) {
      return server.query({
        route: '/signup',
        fields: { email, pwd },
      })
        .then(({ data }) => {
          localStorage.todoToken = data
          return ctx.dispatch('fetchStart')
        })
    },
    signout(ctx) {
      ctx.commit('resetState')
      delete localStorage.todoToken
    },
    changePwd(ctx, pwd) {
      server.ql({
        service: 'changePwd',
        data: { pwd },
      })
    },


    createCategory(ctx, category) {
      server.ql({
        service: 'categories',
        method: 'create',
        data: { category },
      })
        .then(({ data }) => {
          ctx.commit('createCategory', data)
        })
    },
    updateCategory(ctx, category) {
      server.ql({
        service: 'categories',
        method: 'update',
        data: { category },
      })
        .then(() => {
          ctx.commit('updateCategory', category)
        })
    },
    deleteCategory(ctx, category) {
      server.ql({
        service: 'categories',
        method: 'delete',
        data: { category },
      })
        .then(() => {
          ctx.commit('deleteCategory', category)
        })
    },


    createTask(ctx, task) {
      server.ql({
        service: 'tasks',
        method: 'create',
        data: { task },
      })
        .then(({ data }) => {
          ctx.commit('addTask', data)
        })
    },
    updateTask(ctx, task) {
      server.ql({
        service: 'tasks',
        method: 'update',
        data: { task },
      })
        .then(() => {
          ctx.commit('updateTask', task)
        })
    },
    checkTask(ctx, task) {
      server.ql({
        service: 'tasks',
        method: 'update',
        data: { task },
      })
        .then(() => {
          ctx.commit('checkTask', task)
        })
    },
    uncheckTask(ctx, task) {
      server.ql({
        service: 'tasks',
        method: 'update',
        data: { task },
      })
        .then(() => {
          ctx.commit('uncheckTask', task)
        })
    },
  },

  strict: process.env.DEV
})

store.dispatch('fetchStart')

export default store
