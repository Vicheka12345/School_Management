<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Payments</h1>
        <p class="page-subtitle">Manage tuition fees, receipts, and debt tracking</p>
      </div>
      <button class="btn-primary" @click="openAdd"><Plus class="w-4 h-4 text-current" /> New Payment</button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass-card p-5 flex items-center gap-4 border-emerald-500/20">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-2xl"><DollarSign class="w-5 h-5 text-current" /></div>
        <div>
          <p class="text-2xl font-bold text-emerald-400">${{ store.totalRevenue.toLocaleString() }}</p>
          <p class="text-xs text-dark-400">Total Revenue</p>
        </div>
      </div>
      <div class="glass-card p-5 flex items-center gap-4 border-red-500/20">
        <div class="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center text-2xl"><AlertTriangle class="w-5 h-5 text-current" /></div>
        <div>
          <p class="text-2xl font-bold text-red-400">${{ store.totalDebt.toLocaleString() }}</p>
          <p class="text-xs text-dark-400">Outstanding Debt</p>
        </div>
      </div>
      <div class="glass-card p-5 flex items-center gap-4 border-primary-500/20">
        <div class="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center text-2xl"><Calendar class="w-5 h-5 text-current" /></div>
        <div>
          <p class="text-2xl font-bold text-primary-400">${{ store.todayRevenue }}</p>
          <p class="text-xs text-dark-400">Today's Revenue</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <AppCard padding="p-0">
      <div class="flex flex-wrap gap-3 p-5 border-b border-dark-700/40">
        <div class="relative flex-1 min-w-[200px]">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"><Search class="w-4 h-4 text-current" /></span>
          <input v-model="store.search" placeholder="Search student or receipt..." class="form-input pl-10" />
        </div>
        <AppSelect v-model="store.filterStatus" :options="['paid','debt','partial']" placeholder="All Status" class="w-36" />
        <AppSelect v-model="store.filterType"   :options="['Tuition','Books','Uniform','Other']" placeholder="All Types" class="w-36" />
      </div>

      <AppTable :columns="cols" :rows="store.paginated" empty-text="No payments found">
        <template #default="{ row }">
          <td class="px-6 py-4 text-primary-400 font-mono text-sm">{{ row.receipt }}</td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">{{ row.student[0] }}</div>
              <span class="text-white text-sm">{{ row.student }}</span>
            </div>
          </td>
          <td class="px-6 py-4"><span class="badge badge-purple">{{ row.type }}</span></td>
          <td class="px-6 py-4 text-dark-300 text-sm">${{ row.amount }}</td>
          <td class="px-6 py-4 text-amber-400 text-sm">{{ row.discount ? `-$${row.discount}` : '—' }}</td>
          <td class="px-6 py-4 text-emerald-400 font-semibold text-sm">${{ row.paid }}</td>
          <td class="px-6 py-4"><span :class="statusBadge(row.status)">{{ row.status }}</span></td>
          <td class="px-6 py-4 text-dark-400 text-xs">{{ row.date }}</td>
          <td class="px-6 py-4">
            <div class="flex gap-2">
              <button @click="viewReceipt(row)" class="btn-secondary btn-sm"><Receipt class="w-4 h-4 text-current" /></button>
              <button @click="openEdit(row)"    class="btn-secondary btn-sm"><Edit class="w-4 h-4 text-current" /></button>
              <button @click="deletePayment(row)" class="btn-danger btn-sm"><Trash2 class="w-4 h-4 text-current" /></button>
            </div>
          </td>
        </template>
      </AppTable>

      <div class="flex items-center justify-between px-6 py-4 border-t border-dark-700/40">
        <p class="text-sm text-dark-400">{{ store.filtered.length }} records</p>
        <div class="flex gap-2">
          <button :disabled="store.page===1" @click="store.page--" class="btn-secondary btn-sm" :class="store.page===1?'opacity-40':''">‹</button>
          <span class="text-sm text-dark-400 px-2">{{ store.page }}/{{ store.totalPages||1 }}</span>
          <button :disabled="store.page>=store.totalPages" @click="store.page++" class="btn-secondary btn-sm" :class="store.page>=store.totalPages?'opacity-40':''">›</button>
        </div>
      </div>
    </AppCard>

    <!-- Add/Edit Modal -->
    <AppModal v-model="showModal" :title="editing?'Edit Payment':'New Payment'" size="lg">
      <AppForm>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput v-model="form.student"      label="Student Name" required />
          <AppSelect v-model="form.type"        label="Payment Type" :options="['Tuition','Books','Uniform','Other']" required />
          <AppInput v-model.number="form.amount"  label="Amount ($)"   type="number" required />
          <AppInput v-model.number="form.discount" label="Discount ($)" type="number" />
          <AppInput v-model.number="form.paid"   label="Paid ($)"     type="number" required />
          <AppSelect v-model="form.status"      label="Status"       :options="['paid','partial','debt']" required />
          <AppInput v-model="form.note"         label="Note"         placeholder="Optional..." />
        </div>
      </AppForm>
      <template #footer>
        <button class="btn-secondary" @click="showModal=false">Cancel</button>
        <button class="btn-primary" @click="save" :disabled="saving">{{ saving?'Saving...':editing?'Update':'Save Payment' }}</button>
      </template>
    </AppModal>

    <!-- Receipt Modal -->
    <AppModal v-model="showReceipt" title="Payment Receipt" subtitle="Official receipt document" size="md">
      <div v-if="selectedPayment" class="space-y-4">
        <div class="text-center border-b border-dark-700/40 pb-4">
          <div class="text-3xl mb-2"><School class="w-5 h-5 text-current" /></div>
          <h3 class="text-lg font-bold text-white">School Management System</h3>
          <p class="text-xs text-dark-400">Academic Year 2024–2025</p>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-dark-400">Receipt No:</span><span class="text-primary-400 font-mono font-bold">{{ selectedPayment.receipt }}</span></div>
          <div class="flex justify-between"><span class="text-dark-400">Student:</span><span class="text-white">{{ selectedPayment.student }}</span></div>
          <div class="flex justify-between"><span class="text-dark-400">Type:</span><span class="text-white">{{ selectedPayment.type }}</span></div>
          <div class="flex justify-between"><span class="text-dark-400">Amount:</span><span class="text-white">${{ selectedPayment.amount }}</span></div>
          <div class="flex justify-between"><span class="text-dark-400">Discount:</span><span class="text-amber-400">-${{ selectedPayment.discount || 0 }}</span></div>
          <div class="flex justify-between border-t border-dark-700 pt-2 mt-2"><span class="text-dark-300 font-semibold">Paid:</span><span class="text-emerald-400 font-bold text-base">${{ selectedPayment.paid }}</span></div>
          <div class="flex justify-between"><span class="text-dark-400">Date:</span><span class="text-white">{{ selectedPayment.date }}</span></div>
          <div class="flex justify-between"><span class="text-dark-400">Status:</span><span :class="statusBadge(selectedPayment.status)">{{ selectedPayment.status }}</span></div>
        </div>
        <button @click="window.print()" class="btn-primary w-full"><Printer class="w-4 h-4 text-current" /> Print Receipt</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { School, Calendar, DollarSign, AlertTriangle, Search, Edit, Trash2, Plus, Receipt, Printer } from 'lucide-vue-next'

import { ref } from 'vue'
import AppCard   from '../../components/Card/AppCard.vue'
import AppTable  from '../../components/Table/AppTable.vue'
import AppModal  from '../../components/Modal/AppModal.vue'
import AppForm   from '../../components/Form/AppForm.vue'
import AppInput  from '../../components/Form/AppInput.vue'
import AppSelect from '../../components/Form/AppSelect.vue'
import { usePaymentStore } from '../../stores/payment'
import { useUiStore, useToastStore } from '../../stores/ui'

const store = usePaymentStore()
const ui    = useUiStore()
const toast = useToastStore()

const cols = [
  { key:'receipt', label:'Receipt', sortable:true },
  { key:'student', label:'Student', sortable:true },
  { key:'type',    label:'Type',    sortable:true },
  { key:'amount',  label:'Amount',  sortable:true },
  { key:'discount',label:'Discount' },
  { key:'paid',    label:'Paid',    sortable:true },
  { key:'status',  label:'Status',  sortable:true },
  { key:'date',    label:'Date',    sortable:true },
  { key:'actions', label:'Actions' },
]

const statusBadge = (s) => ({
  paid:    'badge badge-success',
  debt:    'badge badge-danger',
  partial: 'badge badge-warning',
}[s] || 'badge badge-gray')

const showModal=ref(false), editing=ref(null), saving=ref(false)
const blankForm=()=>({ student:'', type:'Tuition', amount:150, discount:0, paid:0, status:'paid', note:'' })
const form=ref(blankForm())
const showReceipt=ref(false), selectedPayment=ref(null)

function openAdd()  { editing.value=null; form.value=blankForm(); showModal.value=true }
function openEdit(row) { editing.value=row.id; form.value={...row}; showModal.value=true }
function viewReceipt(row) { selectedPayment.value=row; showReceipt.value=true }

async function save() {
  saving.value=true; await new Promise(r=>setTimeout(r,600))
  if (editing.value) { store.update(editing.value, form.value); toast.success('Payment updated!') }
  else               { store.add(form.value); toast.success('Payment saved!') }
  showModal.value=false; saving.value=false
}
async function deletePayment(row) {
  if (await ui.confirm('Delete Payment', `Remove receipt "${row.receipt}"?`)) {
    store.remove(row.id); toast.success('Payment deleted.')
  }
}
</script>
