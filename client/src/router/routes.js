
const routes = [
  {
    path: '/test',
    component: () => import('pages/Test.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':categoryId',
        component: () => import('pages/TodoCategory.vue'),
      },
    ],
  },
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
