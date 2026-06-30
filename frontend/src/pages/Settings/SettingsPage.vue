<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Nav -->
      <div class="lg:col-span-1 space-y-1">
        <button v-for="s in sections" :key="s.key" @click="active=s.key"
          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left', active===s.key ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20' : 'text-dark-400 hover:text-white hover:bg-dark-700/40']">
          <component :is="s.icon" class="w-5 h-5 flex-shrink-0" /> {{ s.label }}
        </button>
      </div>

      <!-- Content -->
      <div class="lg:col-span-2">
        <!-- School Info -->
        <AppCard v-if="active==='school'" title="School Information" subtitle="Update your school details">
          <div class="space-y-4">
            <AppInput v-model="school.name"    label="School Name"  required />
            <AppInput v-model="school.address" label="Address"      placeholder="Phnom Penh, Cambodia" />
            <AppInput v-model="school.phone"   label="Phone"        placeholder="023-456-789" />
            <AppInput v-model="school.email"   label="Email"        type="email" />
            <AppInput v-model="school.website" label="Website"      placeholder="https://school.edu" />
            <div class="flex justify-end pt-2">
              <button @click="toast.success('School info saved!')" class="btn-primary"><Save class="w-4 h-4 text-current" /> Save Changes</button>
            </div>
          </div>
        </AppCard>

        <!-- Academic Year -->
        <AppCard v-if="active==='academic'" title="Academic Years" subtitle="Manage academic year periods">
          <div class="space-y-3 mb-4">
            <div v-for="y in years" :key="y.id" class="flex items-center gap-3 p-3 rounded-xl bg-dark-700/30">
              <div class="flex-1">
                <p class="text-white text-sm font-medium">{{ y.name }}</p>
                <p class="text-xs text-dark-500">{{ y.start }} → {{ y.end }}</p>
              </div>
              <span v-if="y.active" class="badge badge-success">Current</span>
              <span v-else class="badge badge-gray">Inactive</span>
            </div>
          </div>
          <button @click="toast.info('Academic year feature coming soon!')" class="btn-secondary btn-sm"><Plus class="w-4 h-4 text-current" /> New Year</button>
        </AppCard>

        <!-- Roles -->
        <AppCard v-if="active==='roles'" title="Roles & Permissions" subtitle="Control access levels">
          <div class="space-y-3">
            <div v-for="role in roles" :key="role.name" class="flex items-center justify-between p-3 rounded-xl bg-dark-700/30">
              <div>
                <p class="text-white text-sm font-semibold">{{ role.name }}</p>
                <p class="text-xs text-dark-500">{{ role.permissions.join(', ') }}</p>
              </div>
              <button @click="toast.info('Permission editor coming soon!')" class="btn-secondary btn-sm"><Edit class="w-4 h-4 text-current" /> Edit</button>
            </div>
          </div>
        </AppCard>

        <!-- Security -->
        <AppCard v-if="active==='security'" title="Security Settings">
          <div class="space-y-4">
            <AppInput label="Current Password" type="password" placeholder="••••••••" />
            <AppInput label="New Password"     type="password" placeholder="••••••••" />
            <AppInput label="Confirm Password" type="password" placeholder="••••••••" />
            <div class="flex justify-end">
              <button @click="toast.success('Password updated!')" class="btn-primary"><Lock class="w-5 h-5 text-current" /> Update Password</button>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { School, Lock, Calendar, Edit, Plus, Shield, ShieldAlert, Save } from 'lucide-vue-next'

import { ref } from 'vue'
import AppCard   from '../../components/Card/AppCard.vue'
import AppInput  from '../../components/Form/AppInput.vue'
import { useToastStore } from '../../stores/ui'

const toast  = useToastStore()
const active = ref('school')

const sections = [
  { key:'school',   label:'School Info',    icon: School },
  { key:'academic', label:'Academic Years', icon: Calendar },
  { key:'roles',    label:'Roles & Access', icon: Shield },
  { key:'security', label:'Security',       icon: ShieldAlert },
]

const school = ref({ name:'National School', address:'Phnom Penh', phone:'023-456-789', email:'info@school.edu', website:'' })

const years = ref([
  { id:1, name:'2024–2025', start:'2024-09-01', end:'2025-06-30', active:true },
  { id:2, name:'2023–2024', start:'2023-09-01', end:'2024-06-30', active:false },
  { id:3, name:'2022–2023', start:'2022-09-01', end:'2023-06-30', active:false },
])

const roles = ref([
  { name:'Admin',   permissions:['All access'] },
  { name:'Teacher', permissions:['View students','Mark attendance','View grades'] },
  { name:'Staff',   permissions:['View students','Manage payments'] },
])
</script>
