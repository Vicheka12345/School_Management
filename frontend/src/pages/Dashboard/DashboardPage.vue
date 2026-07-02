<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">{{ greeting }}, Admin! Welcome to Sovannaphumi School dashboard.</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-dark-400 glass-card px-4 py-2">
        <Calendar class="w-5 h-5 text-current" /> {{ todayFull }}
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="stat-card group">
        <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110', stat.bg]">
          <component :is="stat.icon" class="w-6 h-6 text-current" />
        </div>
        <div class="min-w-0">
          <p class="text-dark-400 text-xs font-medium uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-white mt-0.5">{{ stat.value }}</p>
          <p :class="['text-xs mt-0.5 font-medium flex items-center gap-1', stat.up ? 'text-emerald-400' : 'text-red-400']">
            <ArrowUp v-if="stat.up" class="w-4 h-4 text-current" />
            <ArrowDown v-else class="w-4 h-4 text-current" />
            {{ stat.change }} vs last month
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Monthly Revenue Chart -->
      <AppCard class="lg:col-span-2" title="Monthly Revenue" subtitle="Income trend for 2024">
        <template #header>
          <span class="badge badge-success">+12.4%</span>
        </template>
        <div class="h-64">
          <Line :data="revenueData" :options="chartOptions" />
        </div>
      </AppCard>

      <!-- Attendance Doughnut -->
      <AppCard title="Today's Attendance" subtitle="All classes combined">
        <div class="h-48 flex items-center justify-center">
          <Doughnut :data="attendanceData" :options="doughnutOptions" />
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4">
          <div v-for="item in attendanceLegend" :key="item.label" class="flex items-center gap-2 text-xs">
            <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', item.dot]"></span>
            <span class="text-dark-400">{{ item.label }}</span>
            <span class="ml-auto font-semibold text-white">{{ item.count }}</span>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Bottom Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Payments -->
      <AppCard title="Recent Payments" subtitle="Last 5 transactions">
        <template #header>
          <router-link to="/payments" class="text-xs text-primary-400 hover:text-primary-300">View all →</router-link>
        </template>
        <div class="space-y-3">
          <div v-for="p in recentPayments" :key="p.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-dark-700/30 hover:bg-dark-700/50 transition-colors">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-purple/30 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {{ p.student[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ p.student }}</p>
              <p class="text-xs text-dark-500">{{ p.type }} · {{ p.date }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-emerald-400">${{ p.paid }}</p>
              <span :class="badgeFor(p.status)">{{ p.status }}</span>
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Today's Attendance List -->
      <AppCard title="Today's Attendance" subtitle="Real-time class status">
        <template #header>
          <router-link to="/attendance" class="text-xs text-primary-400 hover:text-primary-300">Manage →</router-link>
        </template>
        <div class="space-y-2">
          <div v-for="rec in todayAttendance" :key="rec.id"
            class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-700/30 transition-colors">
            <div class="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold text-dark-300 flex-shrink-0">
              {{ rec.studentName.split(' ').map(n=>n[0]).join('') }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white truncate">{{ rec.studentName }}</p>
              <p class="text-xs text-dark-500">{{ rec.class }}</p>
            </div>
            <span :class="statusBadge(rec.status)">{{ rec.status }}</span>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { School, GraduationCap, Calendar, DollarSign, AlertTriangle, ArrowUp, ArrowDown, Users } from 'lucide-vue-next'
import { computed } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'
import AppCard from '../../components/Card/AppCard.vue'
import { useStudentStore } from '../../stores/student'
import { useTeacherStore } from '../../stores/teacher'
import { usePaymentStore } from '../../stores/payment'
import { useAttendanceStore } from '../../stores/attendance'
import { useUiStore } from '../../stores/ui'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const ui              = useUiStore()
const studentStore    = useStudentStore()
const teacherStore    = useTeacherStore()
const paymentStore    = usePaymentStore()
const attendanceStore = useAttendanceStore()

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
const todayFull = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

const stats = computed(() => [
  { label: 'Total Students', value: studentStore.students.length, icon: GraduationCap, bg: 'bg-primary-500/15', up: true,  change: '+4' },
  { label: 'Total Teachers', value: teacherStore.teachers.length, icon: Users, bg: 'bg-accent-purple/15', up: true, change: '+1' },
  { label: 'Revenue (Month)', value: `$${paymentStore.totalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'bg-emerald-500/15', up: true, change: '12.4%' },
  { label: 'Outstanding Debt', value: `$${paymentStore.totalDebt.toLocaleString()}`, icon: AlertTriangle, bg: 'bg-amber-500/15', up: false, change: '$90' },
])

const recentPayments = computed(() => paymentStore.payments.slice(0, 5))
const todayAttendance = computed(() => attendanceStore.records.slice(0, 6))

// Revenue chart
const revenueData = {
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  datasets: [{
    label: 'Revenue ($)',
    data: [3200,3800,3500,4200,4800,4500,5100,4900,5600,5200,4800,5900],
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderWidth: 2.5,
    tension: 0.4,
    fill: true,
    pointBackgroundColor: '#6366f1',
    pointRadius: 4,
    pointHoverRadius: 6,
  }]
}

const chartOptions = computed(() => {
  const isDark = ui.isDark
  const gridColor = isDark ? 'rgba(51,65,85,0.4)' : 'rgba(226,232,240,0.8)'
  const tickColor = isDark ? '#64748b' : '#94a3b8'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipText = isDark ? '#e2e8f0' : '#1e293b'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: tooltipBg, titleColor: tooltipText, bodyColor: tooltipText, borderColor: tooltipBorder, borderWidth: 1 } },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: v => `$${v}` } },
    }
  }
})

const { summary } = attendanceStore
const attendanceData = {
  labels: ['Present','Absent','Late','Excused'],
  datasets: [{
    data: [summary.present, summary.absent, summary.late, summary.excused],
    backgroundColor: ['rgba(16,185,129,0.8)','rgba(239,68,68,0.8)','rgba(245,158,11,0.8)','rgba(99,102,241,0.8)'],
    borderColor: ['#10b981','#ef4444','#f59e0b','#6366f1'],
    borderWidth: 2,
  }]
}
const doughnutOptions = computed(() => {
  const isDark = ui.isDark
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipText = isDark ? '#e2e8f0' : '#1e293b'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: tooltipBg, titleColor: tooltipText, bodyColor: tooltipText, borderColor: tooltipBorder, borderWidth: 1 } },
    cutout: '72%',
  }
})
const attendanceLegend = [
  { label: 'Present', dot: 'bg-emerald-500', count: summary.present },
  { label: 'Absent',  dot: 'bg-red-500',     count: summary.absent  },
  { label: 'Late',    dot: 'bg-amber-500',   count: summary.late    },
  { label: 'Excused', dot: 'bg-primary-500', count: summary.excused },
]

const badgeFor = (s) => ({
  paid:    'badge badge-success text-xs',
  debt:    'badge badge-danger text-xs',
  partial: 'badge badge-warning text-xs',
}[s] || 'badge badge-gray text-xs')

const statusBadge = (s) => ({
  present: 'badge badge-success',
  absent:  'badge badge-danger',
  late:    'badge badge-warning',
  excused: 'badge badge-info',
}[s] || 'badge badge-gray')
</script>
