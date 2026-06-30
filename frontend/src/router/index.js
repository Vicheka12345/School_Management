import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // Auth
  {
    path: '/login',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'Login', component: () => import('../pages/auth/LoginPage.vue') },
      { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../pages/auth/ForgotPasswordPage.vue') },
    ],
    meta: { guest: true }
  },
  // Admin
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',          redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard',      component: () => import('../pages/Dashboard/DashboardPage.vue') },
      { path: 'students',  name: 'Students',        component: () => import('../pages/Students/StudentsPage.vue') },
      { path: 'students/:id', name: 'StudentDetail', component: () => import('../pages/Students/StudentDetailPage.vue') },
      { path: 'teachers',  name: 'Teachers',        component: () => import('../pages/Teachers/TeachersPage.vue') },
      { path: 'classes',   name: 'Classes',         component: () => import('../pages/Classes/ClassesPage.vue') },
      { path: 'payments',  name: 'Payments',        component: () => import('../pages/Payments/PaymentsPage.vue') },
      { path: 'attendance',name: 'Attendance',      component: () => import('../pages/Attendance/AttendancePage.vue') },
      { path: 'reports',   name: 'Reports',         component: () => import('../pages/Reports/ReportsPage.vue') },
      { path: 'settings',  name: 'Settings',        component: () => import('../pages/Settings/SettingsPage.vue') },
      { path: 'profile',   name: 'Profile',         component: () => import('../pages/Profile/ProfilePage.vue') },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' })
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.guest && auth.isLoggedIn) return next('/dashboard')
  next()
})

export default router
