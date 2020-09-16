
const routes = [
  {
    path: '/',
    component: () => import('pages/Todos.vue'),
  },
  {
    name: 'Category',
    path: '/category/:categoryId',
    component: () => import('pages/Todos.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
  },
]

export default routes
