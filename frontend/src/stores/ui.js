import { defineStore } from 'pinia'
import { ref } from 'vue'

// ── Toast Store ──────────────────────────────────────────
export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 0

  function addToast(message, type = 'info', duration = 3500) {
    const id = ++nextId
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id) {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i !== -1) toasts.value.splice(i, 1)
  }

  const success = (msg) => addToast(msg, 'success')
  const error   = (msg) => addToast(msg, 'error')
  const warning = (msg) => addToast(msg, 'warning')
  const info    = (msg) => addToast(msg, 'info')

  return { toasts, addToast, removeToast, success, error, warning, info }
})

// ── UI Store ─────────────────────────────────────────────
export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(window.innerWidth >= 1024)
  const sidebarCollapsed = ref(false)
  const confirmDialog = ref({ open: false, title: '', message: '', resolve: null })

  function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
  function collapseSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }

  function confirm(title, message) {
    return new Promise((resolve) => {
      confirmDialog.value = { open: true, title, message, resolve }
    })
  }
  function resolveConfirm(result) {
    confirmDialog.value.resolve?.(result)
    confirmDialog.value = { open: false, title: '', message: '', resolve: null }
  }

  const savedTheme = localStorage.getItem('sms_theme')
  const isDark = ref(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)

  function initTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }
  initTheme()

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('sms_theme', isDark.value ? 'dark' : 'light')
    initTheme()
  }

  return { sidebarOpen, sidebarCollapsed, confirmDialog, isDark, toggleSidebar, collapseSidebar, confirm, resolveConfirm, toggleTheme }
})
