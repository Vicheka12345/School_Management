<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Payments</h1>
        <p class="page-subtitle">Manage tuition fees, receipts, and debt tracking</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary" @click="openKhqrGenerator"><QrCode class="w-4 h-4 text-current" /> KHQR Pay</button>
        <button class="btn-primary" @click="openAdd"><Plus class="w-4 h-4 text-current" /> New Payment</button>
      </div>
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
        <div class="flex gap-2 mt-4">
          <button @click="payWithKhqr(selectedPayment)" class="btn-secondary flex-1 flex items-center justify-center gap-2">
            <QrCode class="w-4 h-4 text-current" /> Pay with KHQR
          </button>
          <button @click="printReceipt" class="btn-primary flex-1 flex items-center justify-center gap-2">
            <Printer class="w-4 h-4 text-current" /> Print Receipt
          </button>
        </div>
      </div>
    </AppModal>

    <!-- KHQR Modal -->
    <AppModal v-model="showKhqrModal" title="KHQR Payment Generator" subtitle="Generate Cambodia Standard KHQR code" size="lg">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Side: Inputs -->
        <div class="space-y-4 text-left">
          <AppInput v-model="khqrForm.studentName" label="Student Name" required />
          <div class="grid grid-cols-2 gap-3">
            <AppSelect v-model="khqrForm.currency" label="Currency" :options="['USD', 'KHR']" required />
            <AppSelect v-model="khqrForm.paymentType" label="Type" :options="['Tuition', 'Books', 'Uniform', 'Other']" required />
          </div>
          <AppInput v-model.number="khqrForm.amount" label="Amount" type="number" required />
          
          <div class="border-t border-dark-700/40 my-3 pt-3">
            <h4 class="text-xs font-semibold text-white mb-2">Merchant Details</h4>
            <div class="grid grid-cols-2 gap-3">
              <AppInput v-model="khqrForm.merchantName" label="Merchant Name" />
              <AppInput v-model="khqrForm.merchantId" label="Bakong ID" />
            </div>
          </div>
          
          <div class="border-t border-dark-700/40 my-3 pt-3">
            <h4 class="text-xs font-semibold text-white mb-2">Transaction Details (Optional)</h4>
            <div class="grid grid-cols-2 gap-3">
              <AppInput v-model="khqrForm.receiptNo" label="Receipt No." placeholder="Auto-generated" />
              <AppInput v-model="khqrForm.purpose" label="Purpose" />
            </div>
          </div>
          
          <!-- Simulated Payment Actions -->
          <div class="pt-2">
            <button 
              @click="simulatePayment" 
              :disabled="confirming"
              class="w-full btn bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 flex items-center justify-center gap-2 text-sm font-bold shadow-lg py-2.5 px-4 rounded-xl transition-all duration-200"
            >
              <template v-if="confirming">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Verifying transaction...</span>
              </template>
              <template v-else>
                <CheckCircle class="w-4 h-4 text-current" />
                <span>Simulate Pay & Notify Admin</span>
              </template>
            </button>
          </div>
        </div>

        <!-- Right Side: Live KHQR Card Preview -->
        <div class="flex flex-col items-center justify-center p-6 bg-dark-900/60 rounded-2xl border border-dark-700/50 relative overflow-hidden backdrop-blur-md">
          <!-- Glass effect glow overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>

          <!-- Standee Card Container -->
          <div class="relative w-full max-w-[280px] p-[2px] bg-gradient-to-b from-rose-500 via-slate-200 to-blue-600 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
            <div class="bg-white rounded-[22px] overflow-hidden text-center flex flex-col text-gray-800 p-1">
              
              <!-- KHQR Header -->
              <div class="bg-gradient-to-r from-red-600 to-rose-700 text-white pt-4 pb-3 px-4 rounded-t-[18px] relative">
                <div class="absolute top-0 right-0 left-0 bottom-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div class="flex items-center justify-between relative z-10">
                  <div class="text-2xl font-extrabold tracking-wider font-sans drop-shadow-md">KHQR</div>
                  <div class="text-[9px] font-semibold leading-tight text-right opacity-90 tracking-wide font-sans">
                    Scan to Pay<br/>ស្កែនដើម្បីទូទាត់
                  </div>
                </div>
              </div>
              
              <!-- QR Canvas Holder with brackets -->
              <div class="p-5 bg-white relative flex justify-center items-center">
                <!-- Red top brackets -->
                <div class="absolute top-3 left-3 w-4 h-4 border-t-[2.5px] border-l-[2.5px] border-rose-600 rounded-tl-sm"></div>
                <div class="absolute top-3 right-3 w-4 h-4 border-t-[2.5px] border-r-[2.5px] border-rose-600 rounded-tr-sm"></div>
                <!-- Blue bottom brackets -->
                <div class="absolute bottom-3 left-3 w-4 h-4 border-b-[2.5px] border-l-[2.5px] border-blue-600 rounded-bl-sm"></div>
                <div class="absolute bottom-3 right-3 w-4 h-4 border-b-[2.5px] border-r-[2.5px] border-blue-600 rounded-br-sm"></div>
                
                <!-- Actual QR canvas -->
                <div class="bg-slate-50 p-1.5 rounded-lg border border-slate-100/80">
                  <canvas ref="khqrCanvas" class="w-full max-w-[190px] aspect-square block rounded"></canvas>
                </div>
              </div>

              <!-- Merchant Details & Amount -->
              <div class="px-5 pb-5 pt-0.5 bg-white">
                <h3 class="text-xs font-extrabold text-slate-800 truncate tracking-wide uppercase">{{ khqrForm.merchantName }}</h3>
                <p class="text-[9px] text-slate-400 font-mono truncate tracking-tight mb-2.5">{{ khqrForm.merchantId }}</p>
                
                <div class="border-t border-slate-100 pt-3 flex flex-col items-center justify-center">
                  <p class="text-2xl font-black text-emerald-600 tracking-tight leading-none">
                    <span v-if="khqrForm.currency === 'USD'" class="text-xl mr-0.5 font-extrabold">$</span>
                    <span>{{ khqrForm.currency === 'KHR' ? khqrForm.amount.toLocaleString() : Number(khqrForm.amount).toFixed(2) }}</span>
                    <span v-if="khqrForm.currency === 'KHR'" class="text-sm ml-0.5 font-bold">៛</span>
                  </p>
                  <span class="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-widest">{{ khqrForm.currency }} DYNAMIC</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Standee Acrylic Base Effect -->
          <div class="w-44 h-2 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500 rounded-b-xl border-t border-white/20 shadow-md relative -top-[1px] opacity-90 z-0"></div>

          <!-- Actions for QR Code -->
          <div class="flex gap-3 mt-6 w-full max-w-[280px] z-10">
            <button @click="downloadKhqr" class="btn-secondary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5">
              <Download class="w-3.5 h-3.5 text-current" /> Download
            </button>
            <button @click="printKhqr" class="btn-primary flex-1 py-2 px-3 text-xs flex items-center justify-center gap-1.5">
              <Printer class="w-3.5 h-3.5 text-current" /> Print Standee
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-secondary" @click="showKhqrModal=false">Close</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { School, Calendar, DollarSign, AlertTriangle, Search, Edit, Trash2, Plus, Receipt, Printer, QrCode, Download } from 'lucide-vue-next'

import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import AppCard   from '../../components/Card/AppCard.vue'
import AppTable  from '../../components/Table/AppTable.vue'
import AppModal  from '../../components/Modal/AppModal.vue'
import AppForm   from '../../components/Form/AppForm.vue'
import AppInput  from '../../components/Form/AppInput.vue'
import AppSelect from '../../components/Form/AppSelect.vue'
import { usePaymentStore } from '../../stores/payment'
import { useUiStore, useToastStore } from '../../stores/ui'
import { generateKHQRString } from '../../utils/khqr'

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

const showKhqrModal = ref(false)
const khqrCanvas = ref(null)
const confirming = ref(false)
const khqrForm = ref({
  studentName: '',
  paymentType: 'Tuition',
  amount: 100,
  currency: 'USD',
  merchantId: 'school_admin@aba',
  merchantName: 'School Management System',
  receiptNo: '',
  purpose: 'Tuition Fee'
})

const printReceipt = () => window.print()

function openKhqrGenerator() {
  khqrForm.value = {
    studentName: '',
    paymentType: 'Tuition',
    amount: 100,
    currency: 'USD',
    merchantId: 'school_admin@aba',
    merchantName: 'School Management System',
    receiptNo: '',
    purpose: 'School Fee'
  }
  confirming.value = false
  showKhqrModal.value = true
}

function payWithKhqr(payment) {
  khqrForm.value = {
    studentName: payment.student,
    paymentType: payment.type,
    amount: payment.amount - payment.paid,
    currency: 'USD',
    merchantId: 'school_admin@aba',
    merchantName: 'School Management System',
    receiptNo: payment.receipt,
    purpose: `${payment.type} - ${payment.student}`
  }
  if (khqrForm.value.amount <= 0) {
    khqrForm.value.amount = payment.amount
  }
  confirming.value = false
  showReceipt.value = false
  showKhqrModal.value = true
}

const generateQR = async () => {
  await nextTick()
  if (!khqrCanvas.value) return
  
  const qrString = generateKHQRString({
    merchantId: khqrForm.value.merchantId,
    merchantName: khqrForm.value.merchantName,
    amount: khqrForm.value.amount,
    currency: khqrForm.value.currency,
    receiptNo: khqrForm.value.receiptNo,
    purpose: khqrForm.value.purpose
  })
  
  QRCode.toCanvas(khqrCanvas.value, qrString, {
    width: 240,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  }, (err) => {
    if (err) {
      console.error(err)
      return
    }
    
    // Custom center logo drawing for a premium look
    const canvas = khqrCanvas.value
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const logoSize = 40
    
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, (logoSize / 2) + 3, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.fillStyle = '#e11d48'
    ctx.beginPath()
    ctx.arc(size / 2 - 5, size / 2, 9, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.fillStyle = '#2563eb'
    ctx.beginPath()
    ctx.arc(size / 2 + 5, size / 2, 9, 0, 2 * Math.PI)
    ctx.fill()
    
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('S', size / 2, size / 2)
  })
}

watch([showKhqrModal, khqrForm], () => {
  if (showKhqrModal.value) {
    generateQR()
  }
}, { deep: true })

async function simulatePayment() {
  if (!khqrForm.value.studentName) {
    toast.error('Please enter the Student Name first.')
    return
  }
  if (!khqrForm.value.amount || khqrForm.value.amount <= 0) {
    toast.error('Please enter a valid payment amount.')
    return
  }
  
  confirming.value = true
  // Simulate 2 seconds transaction check
  await new Promise(r => setTimeout(r, 2000))
  
  const existing = store.payments.find(p => p.receipt === khqrForm.value.receiptNo)
  let receiptObj = null
  
  if (existing) {
    // Update existing payment
    store.update(existing.id, {
      paid: existing.amount,
      status: 'paid'
    })
    receiptObj = store.payments.find(p => p.id === existing.id)
    toast.success(`Admin Alert: Payment of ${khqrForm.value.currency === 'USD' ? '$' + khqrForm.value.amount : khqrForm.value.amount.toLocaleString() + ' ៛'} received from ${khqrForm.value.studentName} (Receipt: ${khqrForm.value.receiptNo})!`)
  } else {
    // Add new payment record
    const newId = store.add({
      student: khqrForm.value.studentName,
      type: khqrForm.value.paymentType,
      amount: khqrForm.value.amount,
      discount: 0,
      paid: khqrForm.value.amount,
      status: 'paid',
      note: khqrForm.value.purpose || 'Paid via KHQR'
    })
    receiptObj = store.payments.find(p => p.id === newId)
    toast.success(`Admin Alert: New Payment of ${khqrForm.value.currency === 'USD' ? '$' + khqrForm.value.amount : khqrForm.value.amount.toLocaleString() + ' ៛'} received from ${khqrForm.value.studentName} (Receipt: ${receiptObj.receipt})!`)
  }
  
  showKhqrModal.value = false
  confirming.value = false
  
  setTimeout(() => {
    selectedPayment.value = receiptObj
    showReceipt.value = true
  }, 300)
}

function downloadKhqr() {
  if (!khqrCanvas.value) return
  const a = document.createElement('a')
  a.download = `khqr-${khqrForm.value.receiptNo || 'payment'}-${khqrForm.value.amount}.png`
  a.href = khqrCanvas.value.toDataURL('image/png')
  a.click()
}

function printKhqr() {
  if (!khqrCanvas.value) return
  const dataUrl = khqrCanvas.value.toDataURL('image/png')
  const win = window.open('', '_blank')
  win.document.write(`
    <html>
      <head>
        <title>Print KHQR Standee</title>
        <style>
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .card-container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .card {
            width: 300px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
            overflow: hidden;
            border: 2px solid #e2e8f0;
            text-align: center;
            padding: 4px;
          }
          .header {
            background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 18px 18px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 1px;
          }
          .header p {
            margin: 0;
            font-size: 9px;
            opacity: 0.9;
            line-height: 1.2;
            text-align: right;
          }
          .qr-container {
            padding: 24px;
            display: flex;
            justify-content: center;
            background: white;
            position: relative;
          }
          .qr-border-tl { position: absolute; top: 12px; left: 12px; width: 16px; height: 16px; border-top: 3px solid #e11d48; border-left: 3px solid #e11d48; }
          .qr-border-tr { position: absolute; top: 12px; right: 12px; width: 16px; height: 16px; border-top: 3px solid #e11d48; border-right: 3px solid #e11d48; }
          .qr-border-bl { position: absolute; bottom: 12px; left: 12px; width: 16px; height: 16px; border-bottom: 3px solid #2563eb; border-left: 3px solid #2563eb; }
          .qr-border-br { position: absolute; bottom: 12px; right: 12px; width: 16px; height: 16px; border-bottom: 3px solid #2563eb; border-right: 3px solid #2563eb; }
          .qr-img {
            width: 200px;
            height: 200px;
          }
          .merchant-info {
            padding: 4px 20px 24px 20px;
            background: white;
          }
          .name {
            font-weight: 800;
            color: #1e293b;
            font-size: 13px;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .id {
            font-size: 9px;
            color: #94a3b8;
            margin-bottom: 16px;
            font-family: monospace;
          }
          .divider {
            border-top: 1px solid #f1f5f9;
            margin-bottom: 16px;
          }
          .amount {
            font-size: 26px;
            font-weight: 900;
            color: #059669;
            line-height: 1;
          }
          .currency {
            display: inline-block;
            margin-top: 8px;
            padding: 2px 10px;
            background: #f1f5f9;
            border-radius: 9999px;
            font-size: 9px;
            font-weight: 800;
            color: #64748b;
            letter-spacing: 1px;
          }
          .base {
            width: 180px;
            height: 8px;
            background: linear-gradient(90deg, #94a3b8, #cbd5e1, #64748b);
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="card-container">
          <div class="card">
            <div class="header">
              <h1>KHQR</h1>
              <p>Scan to Pay<br/>ស្កែនដើម្បីទូទាត់</p>
            </div>
            <div class="qr-container">
              <div class="qr-border-tl"></div>
              <div class="qr-border-tr"></div>
              <div class="qr-border-bl"></div>
              <div class="qr-border-br"></div>
              <img src="${dataUrl}" class="qr-img" />
            </div>
            <div class="merchant-info">
              <div class="name">${khqrForm.value.merchantName}</div>
              <div class="id">${khqrForm.value.merchantId}</div>
              <div class="divider"></div>
              <div class="amount">
                ${khqrForm.value.currency === 'KHR' ? khqrForm.value.amount.toLocaleString() + ' ៛' : '$' + Number(khqrForm.value.amount).toFixed(2)}
              </div>
              <div class="currency">${khqrForm.value.currency} DYNAMIC</div>
            </div>
          </div>
          <div class="base"></div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        <\/script>
      </body>
    </html>
  `)
  win.document.close()
}

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
