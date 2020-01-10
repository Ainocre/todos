import Vue from 'vue'
import Vuex from 'vuex'
import server from '../utils/server.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    categories: [],
    currentCategory: { _id: 'starred' },
    isConnected: false,
    isReady: false,
    tasks: [],
    doneTasks: [],
    user: null,
  },

  getters: {
    starredTodos(state) {
      return state.tasks.filter(todo => todo.starred && !todo.done)
    },
    todoTasks(state) {
      const todos = state.currentCategory._id === 'starred'
        ? state.tasks.filter(todo => todo.starred && !todo.done)
        : state.tasks.filter(task => !task.done && task.categoryId === state.currentCategory._id)
      return [
        ...todos.filter(todo => todo.starred),
        ...todos.filter(todo => !todo.starred),
      ]
    },
    doneTasks(state) {
      return state.doneTasks.filter(task => task.done && task.categoryId === state.currentCategory._id)
    },


    categorySizes(state) {
      const todos = state.tasks.filter(({ done }) => !done)
      const res = {}
      state.categories.forEach((category) => {
        res[category._id] = todos.filter(task => task.categoryId === category._id).length
      })
      return res
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


    updateTask(state, task) {
      const index = state.tasks.findIndex(t => t._id === task._id)
      state.tasks.splice(index, 1, task)
    },
    addTask(state, task) {
      state.tasks.push(task)
    },
    checkTask(state, task) {
      const index = state.tasks.findIndex(t => t._id === task._id)
      state.tasks.splice(index, 1)
      state.doneTasks.push(task)
    },
    uncheckTask(state, task) {
      const index = state.doneTasks.findIndex(t => t._id === task._id)
      state.doneTasks.splice(index, 1)
      state.tasks.push(task)
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
      server.ql({
        service: 'fetchStart',
      })
        .then(({ data: { user, categories, todos } }) => {
          ctx.commit('setTasks', todos.filter(({ done }) => !done))
          ctx.commit('setDoneTasks', todos.filter(({ done }) => !!done))
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
