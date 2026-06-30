<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Classes</h1>
        <p class="page-subtitle">Manage class rooms and assignments</p>
      </div>
      <button class="btn-primary" @click="openAdd"><Plus class="w-4 h-4 text-current" /> Add Class</button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="cls in classes" :key="cls.id" class="glass-card p-5 hover:border-primary-500/30 transition-all duration-300 group">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-purple/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"><Building class="w-5 h-5 text-current" /></div>
          <div class="flex gap-2">
            <button @click="openEdit(cls)" class="btn-secondary btn-sm"><Edit class="w-4 h-4 text-current" /></button>
            <button @click="deleteClass(cls)" class="btn-danger btn-sm"><Trash2 class="w-4 h-4 text-current" /></button>
          </div>
        </div>
        <h3 class="text-lg font-bold text-white mb-1">{{ cls.name }}</h3>
        <p class="text-sm text-dark-400 mb-3">👨‍<School class="w-5 h-5 text-current" /> {{ cls.teacher }}</p>
        <div class="flex items-center justify-between text-sm">
          <span class="text-dark-400"><Users class="w-4 h-4 text-current" /> {{ cls.students }} students</span>
          <span class="badge badge-info">{{ cls.year }}</span>
        </div>
        <div class="mt-3 w-full bg-dark-700 rounded-full h-1.5">
          <div class="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-purple transition-all"
            :style="`width:${Math.min(100,(cls.students/cls.capacity)*100)}%`"></div>
        </div>
        <p class="text-xs text-dark-500 mt-1">{{ cls.students }} / {{ cls.capacity }} capacity</p>
      </div>

      <!-- Add card placeholder -->
      <div @click="openAdd" class="glass-card p-5 border-dashed border-dark-600 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary-500/40 hover:bg-primary-500/5 transition-all min-h-[180px]">
        <div class="w-12 h-12 rounded-xl bg-dark-700/50 flex items-center justify-center text-2xl text-dark-500"><Plus class="w-4 h-4 text-current" /></div>
        <p class="text-dark-400 text-sm">Add New Class</p>
      </div>
    </div>

    <!-- Modal -->
    <AppModal v-model="showModal" :title="editing?'Edit Class':'Add Class'">
      <AppForm>
        <div class="space-y-4">
          <AppInput v-model="form.name"     label="Class Name"   placeholder="Grade 10A" required />
          <AppInput v-model="form.teacher"  label="Class Teacher" placeholder="Mr. Sokha Heng" />
          <AppInput v-model.number="form.capacity" label="Capacity" type="number" placeholder="35" />
          <AppSelect v-model="form.year"    label="Academic Year" :options="['2024-2025','2025-2026']" />
        </div>
      </AppForm>
      <template #footer>
        <button class="btn-secondary" @click="showModal=false">Cancel</button>
        <button class="btn-primary" @click="save">{{ editing?'Update':'Add Class' }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { School, Building, Edit, Trash2, Users, Plus } from 'lucide-vue-next'

import { ref } from 'vue'
import AppModal  from '../../components/Modal/AppModal.vue'
import AppForm   from '../../components/Form/AppForm.vue'
import AppInput  from '../../components/Form/AppInput.vue'
import AppSelect from '../../components/Form/AppSelect.vue'
import { useUiStore, useToastStore } from '../../stores/ui'

const ui    = useUiStore()
const toast = useToastStore()

const classes = ref([
  { id:1, name:'Grade 10A', teacher:'Mr. Sokha Heng',   students:32, capacity:35, year:'2024-2025' },
  { id:2, name:'Grade 10B', teacher:'Ms. Channary Ros', students:30, capacity:35, year:'2024-2025' },
  { id:3, name:'Grade 11A', teacher:'Ms. Sreymom Sar',  students:28, capacity:35, year:'2024-2025' },
  { id:4, name:'Grade 11B', teacher:'Mr. Veasna Khem',  students:33, capacity:35, year:'2024-2025' },
  { id:5, name:'Grade 12A', teacher:'Ms. Dara Pich',    students:25, capacity:30, year:'2024-2025' },
  { id:6, name:'Grade 12B', teacher:'Mr. Bunna Lim',    students:22, capacity:30, year:'2024-2025' },
])

const showModal=ref(false), editing=ref(null)
const blankForm=()=>({ name:'', teacher:'', capacity:35, year:'2024-2025' })
const form=ref(blankForm())

function openAdd()  { editing.value=null; form.value=blankForm(); showModal.value=true }
function openEdit(cls) { editing.value=cls.id; form.value={...cls}; showModal.value=true }

function save() {
  if (!form.value.name) { toast.error('Class name required'); return }
  if (editing.value) {
    const i=classes.value.findIndex(c=>c.id===editing.value)
    if (i!==-1) classes.value[i]={...classes.value[i],...form.value}
    toast.success('Class updated!')
  } else {
    classes.value.push({ id:Date.now(), students:0, ...form.value })
    toast.success('Class added!')
  }
  showModal.value=false
}
async function deleteClass(cls) {
  if (await ui.confirm('Delete Class', `Remove "${cls.name}"?`)) {
    classes.value=classes.value.filter(c=>c.id!==cls.id); toast.success('Class removed.')
  }
}
</script>
