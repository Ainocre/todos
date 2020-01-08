import Vue from 'vue'
import Vuex from 'vuex'
import { values, keyBy } from 'lodash'
import server from '../utils/server.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    categories: [],
    currentCategory: { _id: 'starred' },
    isConnected: false,
    isReady: false,
    tasks: {},
    user: null,
  },

  getters: {
    starredTodos(state) {
      return values(state.tasks).filter(todo => todo.starred && !todo.done)
    },
    todoTasks(state) {
      return category => {
        const todos = category._id === 'starred'
          ? values(state.tasks).filter(todo => todo.starred && !todo.done)
          : values(state.tasks).filter(task => !task.done && task.categoryId === category._id)
        return [
          ...todos.filter(todo => todo.starred),
          ...todos.filter(todo => !todo.starred),
        ]
      }
    },
    doneTasks(state) {
      return (category, quantity) => values(state.tasks).filter(task => task.done && task.categoryId === category._id).slice(0, quantity)
    },

    
    doCurrentCategoryExists(state) {
      return state.currentCategory._id === 'starred' || state.categories.find(cat => state.currentCategory._id === cat._id)
    },
  },

  mutations: {
    setUser(state, user) {
      state.user = user
    },
    isReady(state) {
      state.isReady = true
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


    changeCurrentCategory(state, category) {
      state.currentCategory = category
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


    mergeTasks(state, tasks) {
      const newTasks = {
        ...state.tasks,
        ...keyBy(tasks, '_id'),
      }
      Vue.set(state, 'tasks', newTasks)
    },
  },

  actions: {
    fetchStart(ctx) {
      server.ql({
        service: 'fetchStart',
      })
        .then(({ data: { user, categories, todos } }) => {
          ctx.commit('mergeTasks', todos)
          ctx.commit('setUser', user)
          ctx.commit('setCategories', categories)
          ctx.commit('isConnected', true)
          ctx.commit('isReady', true)
        })
        .catch((err) => {
          ctx.commit('isReady')
          throw err
        })
    },
    signin(ctx, { email, pwd }) {
      return server.query({
        route: '/signin',
        fields: { email, pwd },
      })
        .then(({ data }) => {
          localStorage.token = data
          return ctx.dispatch('fetchStart')
        })
    },
    signup(ctx, { email, pwd }) {
      return server.query({
        route: '/signup',
        fields: { email, pwd },
      })
        .then(({ data }) => {
          localStorage.token = data
          return ctx.dispatch('fetchStart')
        })
    },
    signout(ctx) {
      ctx.commit('resetState')
      delete localStorage.token
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
          ctx.commit('mergeTasks', [data])
        })
    },
    updateTask(ctx, task) {
      server.ql({
        service: 'tasks',
        method: 'update',
        data: { task },
      })
        .then(() => {
          ctx.commit('mergeTasks', [task])
        })
    },
  },

  strict: process.env.DEV
})

store.dispatch('fetchStart')

export default store
