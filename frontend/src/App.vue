<template>
  <router-view />

  <!-- Global Toast -->
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-glass border text-sm font-medium min-w-[280px] max-w-sm"
          :class="toastClass(toast.type)"
        >
          <component :is="toastIcon(toast.type)" class="w-5 h-5 flex-shrink-0" />
          <span>{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="ml-auto text-current opacity-60 hover:opacity-100"><X class="w-4 h-4" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from './stores/ui'
import { storeToRefs } from 'pinia'
import { CheckCircle, XCircle, AlertTriangle, Info, Bell, X } from 'lucide-vue-next'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore

const toastClass = (type) => ({
  success: 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100 backdrop-blur-md',
  error:   'bg-red-900/90 border-red-500/40 text-red-100 backdrop-blur-md',
  warning: 'bg-amber-900/90 border-amber-500/40 text-amber-100 backdrop-blur-md',
  info:    'bg-primary-900/90 border-primary-500/40 text-primary-100 backdrop-blur-md',
}[type] || 'bg-dark-800/90 border-dark-600/40 text-dark-100 backdrop-blur-md')

const toastIcon = (type) => ({ success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }[type] || Bell)
</script>

<style>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to   { opacity: 0; transform: translateX(100%); }
</style>
