import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('sms_user') || 'null'))
  const token = ref(localStorage.getItem('sms_token') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function login(userData, authToken) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('sms_user', JSON.stringify(userData))
    localStorage.setItem('sms_token', authToken)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('sms_user')
    localStorage.removeItem('sms_token')
  }

  function updateUser(data) {
    user.value = { ...user.value, ...data }
    localStorage.setItem('sms_user', JSON.stringify(user.value))
  }

  return { user, token, isLoggedIn, isAdmin, login, logout, updateUser }
})
