<template>
  <div class="flex h-screen overflow-hidden bg-dark-950">
    <!-- Sidebar -->
    <aside
      :class="[
        'sidebar-glass flex-col flex-shrink-0 transition-all duration-300 z-30',
        ui.sidebarCollapsed ? 'w-16' : 'w-64',
        ui.sidebarOpen ? 'flex' : 'hidden lg:flex'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-dark-700/40">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <School class="w-5 h-5 text-white" />
        </div>
        <Transition name="fade">
          <div v-if="!ui.sidebarCollapsed" class="overflow-hidden">
            <p class="text-sm font-bold text-white leading-tight">Sovannaphumi </p>
            <p class="text-xs text-dark-400">Admin Panel</p>
          </div>
        </Transition>
        <button
          @click="ui.collapseSidebar()"
          class="ml-auto text-dark-400 hover:text-white transition-colors flex-shrink-0"
        >
          <svg class="w-4 h-4" :class="ui.sidebarCollapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div v-for="group in navGroups" :key="group.label">
          <p v-if="!ui.sidebarCollapsed" class="text-xs font-semibold text-dark-600 uppercase tracking-wider px-3 mb-2 mt-3">{{ group.label }}</p>
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            custom
            v-slot="{ isActive, navigate }"
          >
            <div
              @click="navigate"
              :class="[
                'nav-item',
                isActive ? 'active' : '',
                ui.sidebarCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''
              ]"
              :title="ui.sidebarCollapsed ? item.label : ''"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <Transition name="fade">
                <span v-if="!ui.sidebarCollapsed" class="truncate">{{ item.label }}</span>
              </Transition>
              <Transition name="fade">
                <span v-if="!ui.sidebarCollapsed && item.badge" class="ml-auto badge badge-info text-xs">{{ item.badge }}</span>
              </Transition>
            </div>
          </router-link>
        </div>
      </nav>

      <!-- Bottom: User -->
      <div class="border-t border-dark-700/40 p-3">
        <router-link to="/profile" custom v-slot="{ navigate }">
          <div @click="navigate" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-700/40 cursor-pointer transition-colors">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-purple flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
              {{ auth.user?.name?.[0]?.toUpperCase() || 'A' }}
            </div>
            <Transition name="fade">
              <div v-if="!ui.sidebarCollapsed" class="overflow-hidden flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ auth.user?.name || 'Admin' }}</p>
                <p class="text-xs text-dark-400 truncate">{{ auth.user?.email || 'admin@.edu' }}</p>
              </div>
            </Transition>
          </div>
        </router-link>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="ui.sidebarOpen" class="fixed inset-0 bg-dark-950/60 z-20 lg:hidden" @click="ui.toggleSidebar()" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Topbar -->
      <header class="flex-shrink-0 h-16 flex items-center px-6 gap-4 border-b border-dark-700/40 bg-dark-900/50 backdrop-blur-md">
        <button @click="ui.toggleSidebar()" class="lg:hidden text-dark-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 text-sm text-dark-400">
          <MapPin class="w-4 h-4 text-dark-600" />
          <span class="text-white font-medium">{{ currentPageName }}</span>
        </div>

        <div class="ml-auto flex items-center gap-3">
          <!-- Date -->
          <span class="hidden sm:block text-xs text-dark-500">{{ todayFormatted }}</span>

          <!-- Theme Toggle -->
          <button @click="ui.toggleTheme()" class="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-800/60 border border-dark-700/50 text-dark-400 hover:text-white hover:border-dark-600 transition-all">
            <Sun v-if="ui.isDark" class="w-4 h-4" />
            <Moon v-else class="w-4 h-4" />
          </button>

          <!-- Notifications -->
          <button class="relative w-9 h-9 flex items-center justify-center rounded-xl bg-dark-800/60 border border-dark-700/50 text-dark-400 hover:text-white hover:border-dark-600 transition-all">
            <Bell class="w-4 h-4" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- Logout -->
          <button @click="handleLogout" class="w-9 h-9 flex items-center justify-center rounded-xl bg-dark-800/60 border border-dark-700/50 text-dark-400 hover:text-red-400 hover:border-red-500/30 transition-all">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </header>

      <!-- Page -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>

    <!-- Confirm Dialog -->
    <Teleport to="body">
      <div v-if="ui.confirmDialog.open" class="modal-overlay" @click.self="ui.resolveConfirm(false)">
        <div class="modal-box max-w-sm">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <span class="text-red-400 text-xl"><AlertTriangle class="w-5 h-5 text-current" /></span>
              </div>
              <div>
                <h3 class="font-semibold text-white">{{ ui.confirmDialog.title }}</h3>
                <p class="text-sm text-dark-400">{{ ui.confirmDialog.message }}</p>
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button class="btn-secondary" @click="ui.resolveConfirm(false)">Cancel</button>
              <button class="btn-danger" @click="ui.resolveConfirm(true)">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next'

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { School, LayoutDashboard, GraduationCap, Users, ClipboardCheck, CreditCard, LineChart, Settings, MapPin, Sun, Moon, Bell, LogOut } from 'lucide-vue-next'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    ]
  },
  {
    label: 'Academic',
    items: [
      { to: '/students',   label: 'Students',   icon: GraduationCap },
      { to: '/teachers',   label: 'Teachers',   icon: Users },
      { to: '/classes',    label: 'Classes',    icon: School },
      { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/payments',   label: 'Payments',   icon: CreditCard },
    ]
  },
  {
    label: 'System',
    items: [
      { to: '/reports',    label: 'Reports',    icon: LineChart },
      { to: '/settings',   label: 'Settings',   icon: Settings },
    ]
  }
]

const routeNames = {
  Dashboard: 'Dashboard', Students: 'Students', StudentDetail: 'Student Detail',
  Teachers: 'Teachers', Classes: 'Classes', Payments: 'Payments',
  Attendance: 'Attendance', Reports: 'Reports', Settings: 'Settings', Profile: 'Profile'
}
const currentPageName = computed(() => routeNames[route.name] || 'Page')

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.page-enter-active, .page-leave-active { transition: all 0.25s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to   { opacity: 0; transform: translateY(-8px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
