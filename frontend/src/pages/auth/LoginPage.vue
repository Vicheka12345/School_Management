<template>
  <div class="glass-card p-8 animate-slide-up">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-1 text-center">Welcome </h2>
      <p class="text-dark-400 text-md text-center">Sign in to your administrator account</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      <!-- Email -->
      <div>
        <label class="form-label">Email Address</label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"><Mail class="w-5 h-5 text-current" /></span>
          <input
            v-model="form.email"
            type="email"
            placeholder="admin@school.edu"
            class="form-input pl-10"
            required
          />
        </div>
      </div>

      <!-- Password -->
      <div>
        <label class="form-label">Password</label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"><Lock class="w-5 h-5 text-current" /></span>
          <input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            placeholder="••••••••"
            class="form-input pl-10 pr-12"
            required
          />
          <button type="button" @click="showPass = !showPass"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors text-sm">
            <EyeOff class="w-5 h-5 text-current" v-if="showPass" />
            <Eye class="w-5 h-5 text-current" v-else />
          </button>
        </div>
      </div>

      <!-- Remember + Forgot -->
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 cursor-pointer text-sm text-dark-400">
          <input v-model="form.remember" type="checkbox" class="rounded accent-primary-500" />
          Remember me
        </label>
        <router-link to="/forgot-password" class="text-sm text-primary-400 hover:text-primary-300 transition-colors">
          Forgot password?
        </router-link>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
        <span><XCircle class="w-5 h-5 text-current" /></span> {{ error }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="btn-primary w-full btn-lg"
      >
        <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    
  </div>
</template>

<script setup>
import { Mail, Lock, EyeOff, Eye, XCircle, Key } from 'lucide-vue-next'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/ui'

const auth   = useAuthStore()
const toast  = useToastStore()
const router = useRouter()

const form     = ref({ email: 'admin@school.edu', password: 'password', remember: false })
const loading  = ref(false)
const error    = ref('')
const showPass = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  await new Promise(r => setTimeout(r, 800))
  if (form.value.email === 'admin@school.edu' && form.value.password === 'password') {
    auth.login({ name: 'Admin User', email: form.value.email, role: 'admin', avatar: null }, 'mock-token-xyz')
    toast.success('Welcome back, Admin! 👋')
    router.push('/dashboard')
  } else {
    error.value = 'Invalid email or password. Please try again.'
  }
  loading.value = false
}
</script>
