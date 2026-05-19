import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { UserRole } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { routeNameForRole } from '@/utils/roleRoutes'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    role?: UserRole
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/page/LoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/page/SignUpPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated || !authStore.currentUser) {
          return { name: 'login' }
        }
        return { name: routeNameForRole(authStore.currentUser.role) }
      },
    },
    {
      path: '/project-leader',
      name: 'project-leader',
      component: () => import('@/page/ProjectLeaderPage.vue'),
      meta: { requiresAuth: true, role: 'projectLeader' },
    },
    {
      path: '/management',
      name: 'management',
      component: () => import('@/page/ManagementPage.vue'),
      meta: { requiresAuth: true, role: 'management' },
    },
    {
      path: '/employee',
      name: 'employee',
      component: () => import('@/page/EmployeePage.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (authStore.loading) {
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => authStore.loading,
        (val) => {
          if (!val) {
            stop()
            resolve()
          }
        },
      )
    })
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated && authStore.homeRouteName) {
    return { name: authStore.homeRouteName }
  }

  const requiredRole = to.meta.role
  if (requiredRole && authStore.currentUser && authStore.currentUser.role !== requiredRole) {
    return { name: routeNameForRole(authStore.currentUser.role) }
  }
})

export default router
