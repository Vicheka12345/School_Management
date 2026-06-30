<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Students</h1>
        <p class="page-subtitle">{{ store.students.length }} students enrolled · Academic Year 2024–2025</p>
      </div>
      <button class="btn-primary" @click="openAdd">
        <span><Plus class="w-4 h-4 text-current" /></span> Add Student
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-white">{{ store.students.length }}</p>
        <p class="text-xs text-dark-400 mt-1">Total</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-emerald-400">{{ store.students.filter(s=>s.status==='active').length }}</p>
        <p class="text-xs text-dark-400 mt-1">Active</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-red-400">{{ store.students.filter(s=>s.status==='inactive').length }}</p>
        <p class="text-xs text-dark-400 mt-1">Inactive</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-2xl font-bold text-primary-400">{{ store.students.filter(s=>s.gender==='Female').length }}</p>
        <p class="text-xs text-dark-400 mt-1">Female</p>
      </div>
    </div>

    <!-- Table Card -->
    <AppCard padding="p-0">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row gap-3 p-5 border-b border-dark-700/40">
        <div class="relative flex-1">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 text-sm"><Search class="w-4 h-4 text-current" /></span>
          <input v-model="store.search" type="text" placeholder="Search by name or code..." class="form-input pl-10" />
        </div>
        <AppSelect v-model="store.filterClass" :options="classOptions" placeholder="All Classes" class="w-44" />
        <AppSelect v-model="store.filterStatus" :options="['active','inactive']" placeholder="All Status" class="w-36" />
        <button v-if="store.search||store.filterClass||store.filterStatus" @click="clearFilters" class="btn-secondary btn-sm"><X class="w-4 h-4 text-current" /> Clear</button>
      </div>

      <AppTable :columns="cols" :rows="store.paginated" empty-text="No students match your search">
        <template #default="{ row }">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0', avatarBg(row.name)]">
                {{ row.name[0] }}
              </div>
              <div>
                <p class="font-medium text-white text-sm">{{ row.name }}</p>
                <p class="text-xs text-dark-500">{{ row.code }}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-dark-300">{{ row.gender }}</td>
          <td class="px-6 py-4 text-sm text-dark-300">{{ row.class }}</td>
          <td class="px-6 py-4 text-sm text-dark-300">{{ row.phone }}</td>
          <td class="px-6 py-4">
            <span :class="row.status==='active' ? 'badge badge-success' : 'badge badge-danger'">{{ row.status }}</span>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <button @click="router.push(`/students/${row.id}`)" class="btn-secondary btn-sm" title="View"><Eye class="w-5 h-5 text-current" /></button>
              <button @click="openEdit(row)" class="btn-secondary btn-sm" title="Edit"><Edit class="w-4 h-4 text-current" /></button>
              <button @click="deleteStudent(row)" class="btn-danger btn-sm" title="Delete"><Trash2 class="w-4 h-4 text-current" /></button>
            </div>
          </td>
        </template>
      </AppTable>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-dark-700/40">
        <p class="text-sm text-dark-400">
          Showing {{ (store.page - 1) * store.perPage + 1 }}–{{ Math.min(store.page * store.perPage, store.filtered.length) }} of {{ store.filtered.length }}
        </p>
        <div class="flex items-center gap-2">
          <button :disabled="store.page===1" @click="store.page--" class="btn-secondary btn-sm" :class="store.page===1?'opacity-40':''">‹ Prev</button>
          <span class="text-sm text-dark-400">{{ store.page }} / {{ store.totalPages || 1 }}</span>
          <button :disabled="store.page>=store.totalPages" @click="store.page++" class="btn-secondary btn-sm" :class="store.page>=store.totalPages?'opacity-40':''">Next ›</button>
        </div>
      </div>
    </AppCard>

    <!-- Add/Edit Modal -->
    <AppModal v-model="showModal" :title="editing ? 'Edit Student' : 'Add New Student'" subtitle="Fill in the student information" size="lg">
      <AppForm>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput v-model="form.name"     label="Full Name"    placeholder="Sophea Keo"   required />
          <AppSelect v-model="form.gender"  label="Gender"       :options="['Male','Female']" required />
          <AppSelect v-model="form.class"   label="Class"        :options="classOptions.filter(c=>c!=='')" required />
          <AppInput v-model="form.dob"      label="Date of Birth" type="date" />
          <AppInput v-model="form.phone"    label="Phone"        placeholder="012-345-678" />
          <AppInput v-model="form.email"    label="Email"        type="email" placeholder="student@school.edu" />
          <AppInput v-model="form.address"  label="Address"      placeholder="Phnom Penh" />
          <AppInput v-model.number="form.fee" label="Monthly Fee ($)" type="number" placeholder="150" />
        </div>
      </AppForm>
      <template #footer>
        <button class="btn-secondary" @click="showModal=false">Cancel</button>
        <button class="btn-primary" @click="saveStudent" :disabled="saving">
          <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          {{ saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { Eye, Search, Edit, Trash2, Plus, X } from 'lucide-vue-next'

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppCard   from '../../components/Card/AppCard.vue'
import AppTable  from '../../components/Table/AppTable.vue'
import AppModal  from '../../components/Modal/AppModal.vue'
import AppForm   from '../../components/Form/AppForm.vue'
import AppInput  from '../../components/Form/AppInput.vue'
import AppSelect from '../../components/Form/AppSelect.vue'
import { useStudentStore } from '../../stores/student'
import { useUiStore }     from '../../stores/ui'
import { useToastStore }  from '../../stores/ui'

const store  = useStudentStore()
const ui     = useUiStore()
const toast  = useToastStore()
const router = useRouter()

const cols = [
  { key: 'name',   label: 'Student',   sortable: true },
  { key: 'gender', label: 'Gender',    sortable: true },
  { key: 'class',  label: 'Class',     sortable: true },
  { key: 'phone',  label: 'Phone' },
  { key: 'status', label: 'Status',    sortable: true },
  { key: 'actions',label: 'Actions' },
]

const classOptions = ['Grade 10A','Grade 10B','Grade 11A','Grade 11B','Grade 12A','Grade 12B']
const colors = ['from-primary-500/30 to-primary-700/30','from-purple-500/30 to-purple-700/30','from-cyan-500/30 to-cyan-700/30','from-emerald-500/30 to-emerald-700/30','from-pink-500/30 to-pink-700/30']
const avatarBg = (name) => `bg-gradient-to-br ${colors[name.charCodeAt(0) % colors.length]} text-white`

const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)
const blankForm = () => ({ name:'', gender:'', class:'', dob:'', phone:'', email:'', address:'', fee:150 })
const form      = ref(blankForm())

function clearFilters() { store.search=''; store.filterClass=''; store.filterStatus=''; store.page=1 }
function openAdd()  { editing.value=null; form.value=blankForm(); showModal.value=true }
function openEdit(row) { editing.value=row.id; form.value={...row}; showModal.value=true }

async function saveStudent() {
  if (!form.value.name || !form.value.class) { toast.error('Name and class are required.'); return }
  saving.value = true
  await new Promise(r=>setTimeout(r,600))
  if (editing.value) { store.update(editing.value, form.value); toast.success('Student updated!') }
  else               { store.add(form.value); toast.success('Student added!') }
  showModal.value = false; saving.value = false; store.page = 1
}

async function deleteStudent(row) {
  const ok = await ui.confirm('Delete Student', `Remove "${row.name}" permanently?`)
  if (ok) { store.remove(row.id); toast.success('Student removed.') }
}
</script>
