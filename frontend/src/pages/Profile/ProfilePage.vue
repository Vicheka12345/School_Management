<template>
  <div class="space-y-6 animate-fade-in">
    <h1 class="page-title">My Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Avatar Card -->
      <AppCard class="lg:col-span-1 text-center" padding="p-8">
        <div class="relative inline-block mb-4">
          <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-4xl font-bold text-white shadow-glow mx-auto">
            {{ auth.user?.name?.[0]?.toUpperCase() || 'A' }}
          </div>
          <button class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm hover:bg-primary-500 transition-colors shadow-glow-sm">
            <Camera class="w-4 h-4 text-current" />
          </button>
        </div>
        <h2 class="text-xl font-bold text-white">{{ auth.user?.name || 'Admin User' }}</h2>
        <p class="text-dark-400 text-sm mt-1">{{ auth.user?.email }}</p>
        <span class="badge badge-purple mt-3">{{ auth.user?.role || 'Admin' }}</span>
        <div class="mt-6 pt-4 border-t border-dark-700/40 space-y-2 text-sm text-left">
          <div class="flex justify-between text-dark-400">
            <span>Last Login</span><span class="text-dark-300">Today, 10:45 AM</span>
          </div>
          <div class="flex justify-between text-dark-400">
            <span>Member Since</span><span class="text-dark-300">Jan 2024</span>
          </div>
        </div>
      </AppCard>

      <!-- Edit Profile -->
      <AppCard class="lg:col-span-2" title="Edit Profile" subtitle="Update your account information">
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput v-model="form.name"  label="Full Name"  :placeholder="auth.user?.name || 'Admin'" />
            <AppInput v-model="form.email" label="Email"      type="email" :placeholder="auth.user?.email || ''" />
            <AppInput v-model="form.phone" label="Phone"      placeholder="+855 12-345-678" />
            <AppInput v-model="form.dob"   label="Date of Birth" type="date" />
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button @click="resetForm" class="btn-secondary"><RotateCcw class="w-4 h-4 text-current" /> Reset</button>
            <button @click="saveProfile" :disabled="saving" class="btn-primary">
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              <Save class="w-4 h-4 text-current mr-2 inline" /> Save Profile
            </button>
          </div>
        </div>

        <!-- Change Password -->
        <div class="mt-6 pt-6 border-t border-dark-700/40">
          <h3 class="font-semibold text-white mb-4">Change Password</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AppInput v-model="pass.current" label="Current" type="password" placeholder="••••••••" />
            <AppInput v-model="pass.new"     label="New"     type="password" placeholder="••••••••" />
            <AppInput v-model="pass.confirm" label="Confirm" type="password" placeholder="••••••••" />
          </div>
          <div class="flex justify-end mt-3">
            <button @click="changePassword" class="btn-secondary"><Lock class="w-5 h-5 text-current" /> Update Password</button>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { Lock, Save, Camera, RotateCcw } from 'lucide-vue-next'

import { ref } from 'vue'
import AppCard  from '../../components/Card/AppCard.vue'
import AppInput from '../../components/Form/AppInput.vue'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/ui'

const auth  = useAuthStore()
const toast = useToastStore()

const form  = ref({ name: auth.user?.name || '', email: auth.user?.email || '', phone: '', dob: '' })
const pass  = ref({ current: '', new: '', confirm: '' })
const saving = ref(false)

function resetForm() { form.value = { name: auth.user?.name||'', email: auth.user?.email||'', phone:'', dob:'' } }

async function saveProfile() {
  saving.value = true
  await new Promise(r => setTimeout(r, 700))
  auth.updateUser({ name: form.value.name, email: form.value.email })
  toast.success('Profile updated successfully!')
  saving.value = false
}

async function changePassword() {
  if (!pass.value.current) { toast.error('Enter current password'); return }
  if (pass.value.new !== pass.value.confirm) { toast.error('Passwords do not match'); return }
  await new Promise(r => setTimeout(r, 600))
  toast.success('Password changed successfully!')
  pass.value = { current:'', new:'', confirm:'' }
}
</script>
