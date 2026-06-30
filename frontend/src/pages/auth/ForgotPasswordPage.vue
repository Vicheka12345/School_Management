<template>
  <div class="glass-card p-8 animate-slide-up">
    <router-link to="/login" class="flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-6 transition-colors">
      ← Back to Login
    </router-link>
    <h2 class="text-2xl font-bold text-white mb-1">Reset Password</h2>
    <p class="text-dark-400 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="form-label">Email Address</label>
        <input v-model="email" type="email" class="form-input" placeholder="admin@school.edu" required />
      </div>
      <div v-if="sent" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
        <CheckCircle class="w-5 h-5 text-current" /> Reset link sent! Check your inbox.
      </div>
      <button type="submit" :disabled="loading" class="btn-primary w-full">
        {{ loading ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>
  </div>
</template>
<script setup>
import { CheckCircle } from 'lucide-vue-next'

import { ref } from 'vue'
const email = ref(''), loading = ref(false), sent = ref(false)
async function handleSubmit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  sent.value = true; loading.value = false
}
</script>
