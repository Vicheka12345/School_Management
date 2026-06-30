<template>
  <div class="space-y-6 animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Attendance</h1>
        <p class="page-subtitle">Track daily and monthly student attendance</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-secondary btn-sm"><FileText class="w-4 h-4 text-current" /> Export PDF</button>
        <button class="btn-secondary btn-sm"><LayoutDashboard class="w-5 h-5 text-current" /> Export Excel</button>
      </div>
    </div>

    <!-- Filters -->
    <AppCard padding="p-4">
      <div class="flex flex-wrap gap-3 items-center">
        <input v-model="store.viewDate" type="date" class="form-input w-44" />
        <AppSelect v-model="store.viewClass" :options="classOptions" class="w-44" />
        <!-- View toggle -->
        <div class="flex rounded-xl overflow-hidden border border-dark-600 ml-auto">
          <button v-for="v in views" :key="v"
            @click="activeView=v"
            :class="['px-4 py-2 text-sm font-medium transition-colors', activeView===v ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white hover:bg-dark-700']">
            {{ v }}
          </button>
        </div>
      </div>
    </AppCard>

    <!-- Summary Badges -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div v-for="s in summaryItems" :key="s.label" :class="['glass-card p-4 text-center border', s.border]">
        <p :class="['text-3xl font-bold', s.color]">{{ s.value }}</p>
        <p class="text-xs text-dark-400 mt-1">{{ s.label }}</p>
      </div>
    </div>

    <!-- Daily View -->
    <AppCard v-if="activeView==='Daily'" title="Mark Attendance" :subtitle="`${store.viewClass} · ${store.viewDate}`">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Excused</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in store.dailyRecords" :key="rec.id">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400">
                    {{ rec.studentName.split(' ').map(n=>n[0]).join('') }}
                  </div>
                  <span class="text-white text-sm">{{ rec.studentName }}</span>
                </div>
              </td>
              <td v-for="s in ['present','absent','late','excused']" :key="s" class="px-6 py-4">
                <button
                  @click="store.mark(rec.id, s)"
                  :class="['w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center', rec.status===s ? statusActive(s) : 'border-dark-600 hover:border-dark-400']"
                >
                  <span v-if="rec.status===s" class="text-xs">✓</span>
                </button>
              </td>
              <td class="px-6 py-4">
                <span :class="statusBadge(rec.status)">{{ rec.status }}</span>
              </td>
            </tr>
            <tr v-if="!store.dailyRecords.length">
              <td colspan="6" class="text-center py-10 text-dark-500">No records for this class and date.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <!-- Monthly View -->
    <AppCard v-if="activeView==='Monthly'" title="Monthly Overview" subtitle="June 2024">
      <div class="grid grid-cols-7 gap-1 text-center text-xs text-dark-500 mb-2">
        <div v-for="d in ['S','M','T','W','T','F','S']" :key="d" class="font-semibold">{{ d }}</div>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <div v-for="day in calendarDays" :key="day.date ?? day.empty"
          :class="['aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all',
            day.empty ? 'bg-transparent' :
            day.rate >= 90 ? 'bg-emerald-500/25 text-emerald-300' :
            day.rate >= 70 ? 'bg-amber-500/25 text-amber-300' :
            day.rate > 0  ? 'bg-red-500/25 text-red-300' : 'bg-dark-700/30 text-dark-600']"
          :title="day.empty ? '' : `${day.date}: ${day.rate}% attendance`"
        >
          {{ day.empty ? '' : day.day }}
        </div>
      </div>
      <div class="flex gap-4 mt-4 text-xs">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-500/30"></span> ≥90% Present</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-amber-500/30"></span> 70–89%</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-500/30"></span> &lt;70%</span>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { LayoutDashboard, FileText } from 'lucide-vue-next'

import { ref, computed } from 'vue'
import AppCard   from '../../components/Card/AppCard.vue'
import AppSelect from '../../components/Form/AppSelect.vue'
import { useAttendanceStore } from '../../stores/attendance'

const store = useAttendanceStore()
const classOptions = ['Grade 10A','Grade 10B','Grade 11A','Grade 11B','Grade 12A','Grade 12B']
const views = ['Daily','Monthly']
const activeView = ref('Daily')

const summaryItems = computed(() => [
  { label:'Present', value: store.summary.present, color:'text-emerald-400', border:'border-emerald-500/20' },
  { label:'Absent',  value: store.summary.absent,  color:'text-red-400',     border:'border-red-500/20' },
  { label:'Late',    value: store.summary.late,    color:'text-amber-400',   border:'border-amber-500/20' },
  { label:'Excused', value: store.summary.excused, color:'text-primary-400', border:'border-primary-500/20' },
])

const statusActive = (s) => ({
  present: 'border-emerald-500 bg-emerald-500/20 text-emerald-400',
  absent:  'border-red-500 bg-red-500/20 text-red-400',
  late:    'border-amber-500 bg-amber-500/20 text-amber-400',
  excused: 'border-primary-500 bg-primary-500/20 text-primary-400',
}[s])

const statusBadge = (s) => ({
  present: 'badge badge-success',
  absent:  'badge badge-danger',
  late:    'badge badge-warning',
  excused: 'badge badge-info',
}[s] || 'badge badge-gray')

// Generate calendar for current month
const calendarDays = computed(() => {
  const now = new Date()
  const year = now.getFullYear(), month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push({ empty: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    days.push({ day: d, date, rate: d <= now.getDate() ? Math.floor(Math.random()*30+70) : 0 })
  }
  return days
})
</script>
