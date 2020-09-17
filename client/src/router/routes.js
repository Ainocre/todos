
const routes = [
  {
    name: 'Todos',
    path: '/',
    component: () => import('pages/Todos.vue'),
  },
  {
    name: 'Category',
    path: '/category/:categoryId',
    component: () => import('pages/Todos.vue'),
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('pages/Login.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
]

export default routes
