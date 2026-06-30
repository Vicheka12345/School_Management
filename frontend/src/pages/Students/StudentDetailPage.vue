<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Back -->
    <button @click="router.back()" class="flex items-center gap-2 text-dark-400 hover:text-white text-sm transition-colors">
      ← Back to Students
    </button>

    <div v-if="student">
      <!-- Profile Header -->
      <div class="glass-card p-6 mb-6">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <!-- Avatar -->
          <div class="relative flex-shrink-0">
            <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center text-4xl font-bold text-white shadow-glow">
              {{ student.name[0] }}
            </div>
            <span :class="['absolute -bottom-2 -right-2 badge', student.status==='active'?'badge-success':'badge-danger']">
              {{ student.status }}
            </span>
          </div>

          <!-- Info -->
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-2xl font-bold text-white">{{ student.name }}</h1>
            <p class="text-primary-400 font-mono text-sm mt-1">{{ student.code }}</p>
            <div class="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start text-sm text-dark-400">
              <span><School class="w-5 h-5 text-current" /> {{ student.class }}</span>
              <span><Users class="w-4 h-4 text-current" /> {{ student.gender }}</span>
              <span><Calendar class="w-5 h-5 text-current" /> {{ student.dob }}</span>
              <span><MapPin class="w-5 h-5 text-current" /> {{ student.address }}</span>
            </div>
            <div class="flex flex-wrap gap-3 mt-2 justify-center sm:justify-start text-sm text-dark-400">
              <span><Phone class="w-4 h-4 text-current" /> {{ student.phone }}</span>
              <span><Mail class="w-4 h-4 text-current" /> {{ student.email }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 flex-shrink-0">
            <button class="btn-primary btn-sm"><Edit class="w-4 h-4 text-current" /> Edit</button>
            <button @click="printIdCard" class="btn-secondary btn-sm"><IdCard class="w-4 h-4 text-current" /> ID Card</button>
            <button @click="showQr=true" class="btn-secondary btn-sm"><QrCode class="w-4 h-4 text-current" /> QR Code</button>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AppCard title="Monthly Fee" padding="p-5">
          <p class="text-3xl font-bold text-emerald-400">${{ student.fee }}</p>
          <p class="text-xs text-dark-400 mt-1">Per month</p>
        </AppCard>
        <AppCard title="Enrolled Date" padding="p-5">
          <p class="text-xl font-bold text-white">{{ student.enrolled }}</p>
          <p class="text-xs text-dark-400 mt-1">Academic Year 2024–2025</p>
        </AppCard>
        <AppCard title="Attendance Rate" padding="p-5">
          <p class="text-3xl font-bold text-primary-400">94%</p>
          <p class="text-xs text-dark-400 mt-1">This semester</p>
        </AppCard>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-4">
        <button v-for="tab in tabs" :key="tab" @click="activeTab=tab"
          :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all', activeTab===tab ? 'bg-primary-600 text-white' : 'glass-card text-dark-400 hover:text-white']">
          {{ tab }}
        </button>
      </div>

      <!-- Tab: Grades -->
      <AppCard v-if="activeTab==='Grades'" title="Academic Grades">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="g in grades" :key="g.subject">
                <td class="px-6 py-3 text-white">{{ g.subject }}</td>
                <td class="px-6 py-3 text-dark-300">{{ g.score }}/100</td>
                <td class="px-6 py-3 font-bold" :class="gradeColor(g.grade)">{{ g.grade }}</td>
                <td class="px-6 py-3"><span :class="g.score>=50?'badge badge-success':'badge badge-danger'">{{ g.score>=50?'Pass':'Fail' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>

      <!-- Tab: Payments -->
      <AppCard v-if="activeTab==='Payments'" title="Payment History">
        <div class="space-y-3">
          <div v-for="p in mockPayments" :key="p.id" class="flex items-center gap-4 p-3 rounded-xl bg-dark-700/30">
            <div class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400"><CreditCard class="w-5 h-5 text-current" /></div>
            <div class="flex-1">
              <p class="text-sm text-white">{{ p.type }}</p>
              <p class="text-xs text-dark-500">{{ p.date }} · {{ p.receipt }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-emerald-400">${{ p.paid }}</p>
              <span :class="p.status==='paid'?'badge badge-success':'badge badge-warning'">{{ p.status }}</span>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Tab: Attendance -->
      <AppCard v-if="activeTab==='Attendance'" title="Attendance Record">
        <div class="grid grid-cols-7 gap-2 mb-4">
          <div v-for="d in attendanceDays" :key="d.date"
            :class="['aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all', statusColor(d.status)]"
            :title="`${d.date}: ${d.status}`">
            {{ new Date(d.date).getDate() }}
          </div>
        </div>
        <div class="flex gap-4 text-xs">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-500/40"></span> Present</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-500/40"></span> Absent</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-amber-500/40"></span> Late</span>
        </div>
      </AppCard>
    </div>

    <div v-else class="text-center py-20 text-dark-400">
      <p class="text-4xl mb-3"><Search class="w-4 h-4 text-current" /></p>
      <p>Student not found.</p>
    </div>

    <!-- QR Code Modal -->
    <AppModal v-model="showQr" title="Student QR Code" subtitle="Scan for student info">
      <div class="flex flex-col items-center gap-4">
        <canvas ref="qrCanvas" class="rounded-xl border border-dark-600 p-3 bg-white"></canvas>
        <p class="text-sm text-dark-400 text-center">{{ student?.name }} · {{ student?.code }}</p>
        <button @click="downloadQr" class="btn-primary"><Download class="w-4 h-4 text-current" /> Download QR</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { School, CreditCard, MapPin, Calendar, Search, Edit, Users, Phone, Mail, IdCard, QrCode, Download } from 'lucide-vue-next'

import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import AppCard  from '../../components/Card/AppCard.vue'
import AppModal from '../../components/Modal/AppModal.vue'
import { useStudentStore } from '../../stores/student'

const route  = useRoute()
const router = useRouter()
const store  = useStudentStore()

const student = computed(() => store.getById(route.params.id))
const activeTab = ref('Grades')
const tabs = ['Grades', 'Payments', 'Attendance']
const showQr = ref(false)
const qrCanvas = ref(null)

const grades = [
  { subject: 'Mathematics', score: 88, grade: 'A' },
  { subject: 'Khmer',       score: 75, grade: 'B' },
  { subject: 'English',     score: 92, grade: 'A+' },
  { subject: 'Physics',     score: 67, grade: 'C' },
  { subject: 'History',     score: 81, grade: 'B+' },
  { subject: 'Chemistry',   score: 73, grade: 'C+' },
]

const mockPayments = [
  { id:1, type:'Tuition', amount:150, paid:150, status:'paid', date:'2024-09-05', receipt:'RCP001' },
  { id:2, type:'Books',   amount:40,  paid:40,  status:'paid', date:'2024-09-06', receipt:'RCP002' },
  { id:3, type:'Uniform', amount:25,  paid:0,   status:'debt', date:'2024-10-01', receipt:'RCP003' },
]

// Attendance grid — last 28 days
const attendanceDays = computed(() => {
  const days = []
  const statuses = ['present','present','present','absent','present','late','present','present','present','absent','present','present','present','late','present','present','absent','present','present','present','present','late','present','present','present','present','present','present']
  for (let i=27; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i)
    days.push({ date: d.toISOString().split('T')[0], status: statuses[i] ?? 'present' })
  }
  return days
})

const gradeColor = (g) => ({ 'A+':'text-emerald-400','A':'text-emerald-400','B+':'text-primary-400','B':'text-primary-400','C+':'text-amber-400','C':'text-amber-400' }[g] || 'text-red-400')

const statusColor = (s) => ({
  present: 'bg-emerald-500/20 text-emerald-400',
  absent:  'bg-red-500/20 text-red-400',
  late:    'bg-amber-500/20 text-amber-400',
}[s] || 'bg-dark-700 text-dark-500')

watch(showQr, async (val) => {
  if (val && student.value) {
    await nextTick()
    if (qrCanvas.value) {
      QRCode.toCanvas(qrCanvas.value, `${student.value.code}|${student.value.name}|${student.value.class}`, {
        width: 220, color: { dark: '#1e293b', light: '#ffffff' }
      })
    }
  }
})

function downloadQr() {
  if (!qrCanvas.value) return
  const a = document.createElement('a')
  a.download = `${student.value?.code}-qr.png`
  a.href = qrCanvas.value.toDataURL()
  a.click()
}

function printIdCard() {
  window.print()
}
</script>
