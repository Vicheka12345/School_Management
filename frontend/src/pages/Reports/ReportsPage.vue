<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Reports</h1>
        <p class="page-subtitle">Analytics and data exports</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 flex-wrap">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab=tab.key"
          :class="['px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
            activeTab===tab.key ? 'bg-primary-600 text-white shadow-glow-sm' : 'glass-card text-dark-400 hover:text-white']">
          <component :is="tab.icon" class="w-5 h-5 flex-shrink-0" /> {{ tab.label }}
        </button>
    </div>

    <!-- Student Report -->
    <template v-if="activeTab==='students'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard title="Students by Class">
          <div class="h-64"><Bar :data="classDist" :options="barOpts" /></div>
        </AppCard>
        <AppCard title="Gender Distribution">
          <div class="h-64 flex items-center justify-center"><Doughnut :data="genderDist" :options="doughnutOpts" /></div>
        </AppCard>
      </div>
    </template>

    <!-- Payment Report -->
    <template v-if="activeTab==='payments'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard title="Monthly Revenue Trend">
          <div class="h-64"><Line :data="revData" :options="lineOpts" /></div>
        </AppCard>
        <AppCard title="Payment Status Breakdown">
          <div class="h-64 flex items-center justify-center"><Doughnut :data="payStatus" :options="doughnutOpts" /></div>
        </AppCard>
      </div>
      <AppCard title="Payment Summary">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="s in paymentSummary" :key="s.label" class="p-4 rounded-xl bg-dark-700/30 text-center">
            <p :class="['text-2xl font-bold', s.color]">{{ s.value }}</p>
            <p class="text-xs text-dark-400 mt-1">{{ s.label }}</p>
          </div>
        </div>
      </AppCard>
    </template>

    <!-- Attendance Report -->
    <template v-if="activeTab==='attendance'">
      <AppCard title="Weekly Attendance Rate">
        <div class="h-64"><Bar :data="weeklyAtt" :options="barOpts" /></div>
      </AppCard>
    </template>

    <!-- Income Report -->
    <template v-if="activeTab==='income'">
      <AppCard title="Annual Income Overview">
        <div class="h-64"><Line :data="annualIncome" :options="lineOpts" /></div>
      </AppCard>
    </template>

    <!-- Export Row -->
    <AppCard padding="p-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <p class="text-sm text-dark-400">Export <span class="text-white font-medium">{{ tabs.find(t=>t.key===activeTab)?.label }}</span> report</p>
        <div class="flex gap-2">
          <button class="btn-secondary btn-sm"><FileText class="w-4 h-4 text-current" /> Export PDF</button>
          <button class="btn-secondary btn-sm"><LayoutDashboard class="w-5 h-5 text-current" /> Export Excel</button>
          <button class="btn-primary btn-sm"><Printer class="w-4 h-4 text-current" /> Print</button>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { LayoutDashboard, GraduationCap, ClipboardCheck, CreditCard, DollarSign, FileText, Printer } from 'lucide-vue-next'

import { ref, computed } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import AppCard from '../../components/Card/AppCard.vue'
import { usePaymentStore } from '../../stores/payment'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const store = usePaymentStore()
import { useUiStore } from '../../stores/ui'
const ui = useUiStore()

const activeTab = ref('students')
const tabs = [
  { key:'students',   label:'Student Report',    icon: GraduationCap },
  { key:'payments',   label:'Payment Report',    icon: CreditCard },
  { key:'attendance', label:'Attendance Report', icon: ClipboardCheck },
  { key:'income',     label:'Income Report',     icon: DollarSign },
]

const lineOpts = computed(() => {
  const isDark = ui.isDark
  const gridColor = isDark ? 'rgba(51,65,85,0.4)' : 'rgba(226,232,240,0.8)'
  const tickColor = isDark ? '#64748b' : '#94a3b8'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipText = isDark ? '#e2e8f0' : '#1e293b'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  return { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }, tooltip:{ backgroundColor: tooltipBg, titleColor: tooltipText, bodyColor: tooltipText, borderColor: tooltipBorder, borderWidth: 1 } }, scales:{ x:{ grid:{ color:gridColor }, ticks:{ color:tickColor, font:{ size:11 } } }, y:{ grid:{ color:gridColor }, ticks:{ color:tickColor, font:{ size:11 } } } } }
})
const barOpts = computed(() => lineOpts.value)
const doughnutOpts = computed(() => {
  const isDark = ui.isDark
  const tickColor = isDark ? '#64748b' : '#94a3b8'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipText = isDark ? '#e2e8f0' : '#1e293b'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'
  return { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ color:tickColor, font:{ size:11 } } }, tooltip:{ backgroundColor: tooltipBg, titleColor: tooltipText, bodyColor: tooltipText, borderColor: tooltipBorder, borderWidth: 1 } }, cutout:'65%' }
})

const classDist = {
  labels: ['Grade 10A','Grade 10B','Grade 11A','Grade 11B','Grade 12A','Grade 12B'],
  datasets: [{ label:'Students', data:[32,30,28,33,25,22], backgroundColor:'rgba(99,102,241,0.7)', borderColor:'#6366f1', borderWidth:2, borderRadius:6 }]
}
const genderDist = {
  labels: ['Male','Female'],
  datasets: [{ data:[42,38], backgroundColor:['rgba(99,102,241,0.8)','rgba(236,72,153,0.8)'], borderColor:['#6366f1','#ec4899'], borderWidth:2 }]
}
const revData = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  datasets: [{ label:'Revenue', data:[3200,3800,3500,4200,4800,4500,5100,4900,5600,5200,4800,5900], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.08)', borderWidth:2.5, tension:0.4, fill:true }]
}
const payStatus = {
  labels: ['Paid','Partial','Debt'],
  datasets: [{ data:[5,1,1], backgroundColor:['rgba(16,185,129,0.8)','rgba(245,158,11,0.8)','rgba(239,68,68,0.8)'], borderColor:['#10b981','#f59e0b','#ef4444'], borderWidth:2 }]
}
const paymentSummary = [
  { label:'Total Revenue', value:`$${store.totalRevenue}`,  color:'text-emerald-400' },
  { label:'Total Debt',    value:`$${store.totalDebt}`,     color:'text-red-400'     },
  { label:'Today',         value:`$${store.todayRevenue}`, color:'text-primary-400' },
]
const weeklyAtt = {
  labels: ['Mon','Tue','Wed','Thu','Fri','Sat'],
  datasets: [{ label:'Attendance %', data:[94,91,88,96,93,78], backgroundColor:'rgba(6,182,212,0.6)', borderColor:'#06b6d4', borderWidth:2, borderRadius:6 }]
}
const annualIncome = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  datasets: [
    { label:'Income',   data:[3200,3800,3500,4200,4800,4500,5100,4900,5600,5200,4800,5900], borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.1)', tension:0.4, fill:true },
    { label:'Expenses', data:[2000,2100,2000,2300,2500,2400,2600,2700,2900,2800,2600,3000], borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,0.05)',   tension:0.4, fill:true },
  ]
}
</script>
