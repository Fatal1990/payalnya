import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/projects'
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: { title: 'Projects' }
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('@/views/ProjectDetailView.vue'),
      meta: { title: 'Project Detail' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/projects'
    }
  ]
})

router.beforeEach((to) => {
  document.title = `${to.meta.title as string || 'Page'} | Project Manager`
})

export default router
