<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Teachers</h1>
        <p class="page-subtitle">{{ store.teachers.length }} teachers on staff</p>
      </div>
      <button class="btn-primary" @click="openAdd"><Plus class="w-4 h-4 text-current" /> Add Teacher</button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-white">{{ store.teachers.length }}</p>
        <p class="text-xs text-dark-400 mt-1">Total</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">{{ store.teachers.filter(t=>t.status==='active').length }}</p>
        <p class="text-xs text-dark-400 mt-1">Active</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-primary-400">{{ store.teachers.filter(t=>t.gender==='Female').length }}</p>
        <p class="text-xs text-dark-400 mt-1">Female</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-amber-400">${{ avgSalary }}</p>
        <p class="text-xs text-dark-400 mt-1">Avg. Salary</p>
      </div>
    </div>

    <!-- Table -->
    <AppCard padding="p-0">
      <div class="flex flex-col sm:flex-row gap-3 p-5 border-b border-dark-700/40">
        <div class="relative flex-1">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"><Search class="w-4 h-4 text-current" /></span>
          <input v-model="store.search" type="text" placeholder="Search by name or code..." class="form-input pl-10" />
        </div>
        <AppSelect v-model="store.filterStatus" :options="['active','inactive']" placeholder="All Status" class="w-36" />
      </div>

      <AppTable :columns="cols" :rows="store.paginated" empty-text="No teachers found">
        <template #default="{ row }">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple/30 to-primary-500/30 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {{ row.name.split(' ').pop()[0] }}
              </div>
              <div>
                <p class="font-medium text-white text-sm">{{ row.name }}</p>
                <p class="text-xs text-dark-500">{{ row.code }}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-dark-300">{{ row.subject }}</td>
          <td class="px-6 py-4 text-sm text-dark-300">{{ row.phone }}</td>
          <td class="px-6 py-4 text-sm text-emerald-400 font-semibold">${{ row.salary }}/mo</td>
          <td class="px-6 py-4 text-sm text-dark-400">{{ row.hire_date }}</td>
          <td class="px-6 py-4">
            <span :class="row.status==='active'?'badge badge-success':'badge badge-danger'">{{ row.status }}</span>
          </td>
          <td class="px-6 py-4">
            <div class="flex gap-2">
              <button @click="openEdit(row)" class="btn-secondary btn-sm"><Edit class="w-4 h-4 text-current" /></button>
              <button @click="deleteTeacher(row)" class="btn-danger btn-sm"><Trash2 class="w-4 h-4 text-current" /></button>
            </div>
          </td>
        </template>
      </AppTable>

      <div class="flex items-center justify-between px-6 py-4 border-t border-dark-700/40">
        <p class="text-sm text-dark-400">Showing {{ store.filtered.length }} teachers</p>
        <div class="flex gap-2">
          <button :disabled="store.page===1" @click="store.page--" class="btn-secondary btn-sm" :class="store.page===1?'opacity-40':''">‹</button>
          <span class="text-sm text-dark-400 px-2">{{ store.page }} / {{ store.totalPages||1 }}</span>
          <button :disabled="store.page>=store.totalPages" @click="store.page++" class="btn-secondary btn-sm" :class="store.page>=store.totalPages?'opacity-40':''">›</button>
        </div>
      </div>
    </AppCard>

    <!-- Modal -->
    <AppModal v-model="showModal" :title="editing?'Edit Teacher':'Add Teacher'" size="lg">
      <AppForm>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput v-model="form.name"     label="Full Name"     placeholder="Mr. Sokha Heng" required />
          <AppSelect v-model="form.gender"  label="Gender"        :options="['Male','Female']"  required />
          <AppInput v-model="form.subject"  label="Subject"       placeholder="Mathematics"     required />
          <AppInput v-model="form.phone"    label="Phone"         placeholder="012-345-678" />
          <AppInput v-model="form.email"    label="Email"         type="email" />
          <AppInput v-model.number="form.salary" label="Salary ($)" type="number" placeholder="800" />
          <AppInput v-model="form.hire_date" label="Hire Date"   type="date" />
          <AppSelect v-model="form.status"  label="Status"        :options="['active','inactive']" />
        </div>
      </AppForm>
      <template #footer>
        <button class="btn-secondary" @click="showModal=false">Cancel</button>
        <button class="btn-primary" @click="save" :disabled="saving">{{ saving?'Saving...': editing?'Update':'Add Teacher' }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { Search, Edit, Trash2, Plus } from 'lucide-vue-next'

import { ref, computed } from 'vue'
import AppCard   from '../../components/Card/AppCard.vue'
import AppTable  from '../../components/Table/AppTable.vue'
import AppModal  from '../../components/Modal/AppModal.vue'
import AppForm   from '../../components/Form/AppForm.vue'
import AppInput  from '../../components/Form/AppInput.vue'
import AppSelect from '../../components/Form/AppSelect.vue'
import { useTeacherStore } from '../../stores/teacher'
import { useUiStore, useToastStore } from '../../stores/ui'

const store = useTeacherStore()
const ui    = useUiStore()
const toast = useToastStore()

const cols = [
  { key:'name',     label:'Teacher',  sortable:true },
  { key:'subject',  label:'Subject',  sortable:true },
  { key:'phone',    label:'Phone' },
  { key:'salary',   label:'Salary',   sortable:true },
  { key:'hire_date',label:'Hired',    sortable:true },
  { key:'status',   label:'Status',   sortable:true },
  { key:'actions',  label:'Actions' },
]

const avgSalary = computed(() => {
  const active = store.teachers.filter(t=>t.status==='active')
  return active.length ? Math.round(active.reduce((s,t)=>s+t.salary,0)/active.length) : 0
})

const showModal = ref(false), editing = ref(null), saving = ref(false)
const blankForm = () => ({ name:'', gender:'Male', subject:'', phone:'', email:'', salary:800, hire_date:'', status:'active' })
const form = ref(blankForm())

function openAdd()  { editing.value=null; form.value=blankForm(); showModal.value=true }
function openEdit(row) { editing.value=row.id; form.value={...row}; showModal.value=true }

async function save() {
  saving.value=true; await new Promise(r=>setTimeout(r,600))
  if (editing.value) { store.update(editing.value, form.value); toast.success('Teacher updated!') }
  else               { store.add(form.value); toast.success('Teacher added!') }
  showModal.value=false; saving.value=false
}
async function deleteTeacher(row) {
  if (await ui.confirm('Delete Teacher', `Remove "${row.name}"?`)) {
    store.remove(row.id); toast.success('Teacher removed.')
  }
}
</script>
