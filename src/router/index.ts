import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { UserRole } from '@/types'
import { hasUserRole } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { homeRouteNameForUser, PENDING_APPROVAL_ROUTE_NAME, routeNameForRole } from '@/utils/roleRoutes'

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
      path: '/venter',
      name: PENDING_APPROVAL_ROUTE_NAME,
      component: () => import('@/page/PendingApprovalPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated || !authStore.currentUser) {
          return { name: 'login' }
        }
        return { name: homeRouteNameForUser(authStore.currentUser)! }
      },
    },
    {
      path: '/project-leader',
      name: 'project-leader',
      component: () => import('@/page/ProjectLeaderPage.vue'),
      meta: { requiresAuth: true, role: 'projectLeader' },
    },
    {
      path: '/project-leader/prosjekter/:projectId',
      name: 'project-leader-project',
      component: () => import('@/page/ProjectPage.vue'),
      meta: { requiresAuth: true, role: 'projectLeader' },
    },
    {
      path: '/project-leader/prosjekter/:projectId/oppgaver/:taskId',
      name: 'project-leader-task',
      component: () => import('@/page/TaskPage.vue'),
      meta: { requiresAuth: true, role: 'projectLeader' },
    },
    {
      path: '/management',
      name: 'management',
      component: () => import('@/page/ManagementPage.vue'),
      meta: { requiresAuth: true, role: 'management' },
    },
    {
      path: '/management/prosjekter/:projectId',
      name: 'management-project',
      component: () => import('@/page/ProjectPage.vue'),
      meta: { requiresAuth: true, role: 'management' },
    },
    {
      path: '/management/prosjekter/:projectId/oppgaver/:taskId',
      name: 'management-task',
      component: () => import('@/page/TaskPage.vue'),
      meta: { requiresAuth: true, role: 'management' },
    },
    {
      path: '/employee',
      name: 'employee',
      component: () => import('@/page/EmployeePage.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/employee/oppgaver/:taskId',
      name: 'employee-task',
      component: () => import('@/page/TaskPage.vue'),
      meta: { requiresAuth: true, role: 'employee' },
    },
    {
      path: '/tilganger',
      name: 'tilganger',
      component: () => import('@/page/TilgangerPage.vue'),
      meta: { requiresAuth: true, role: 'management' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
 
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

  const user = authStore.currentUser
  if (!user) return

  if (to.name === PENDING_APPROVAL_ROUTE_NAME) {
    if (hasUserRole(user)) {
      return { name: routeNameForRole(user.role) }
    }
    return
  }

  if (to.meta.role && !hasUserRole(user)) {
    return { name: PENDING_APPROVAL_ROUTE_NAME }
  }

  const requiredRole = to.meta.role
  if (requiredRole && hasUserRole(user) && user.role !== requiredRole) {
    return { name: routeNameForRole(user.role) }
  }
})

export default router
