import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const today = new Date().toISOString().split('T')[0]

const STUDENTS = ['Sophea Keo','Dara Chan','Maly Pov','Bopha Ly','Rathana Sorn','Virak Tep','Chanthy Noun','Piseth Chhun']

// Generate mock attendance for today
const mockToday = STUDENTS.map((name, i) => ({
  id: i + 1, studentId: i + 1, studentName: name,
  class: i < 4 ? 'Grade 10A' : 'Grade 11A',
  date: today,
  status: ['present','present','present','absent','present','late','present','excused'][i],
}))

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref([...mockToday])
  const loading  = ref(false)
  const viewDate = ref(today)
  const viewClass = ref('Grade 10A')

  const dailyRecords = computed(() =>
    records.value.filter(r => r.date === viewDate.value && r.class === viewClass.value)
  )

  const summary = computed(() => ({
    present: records.value.filter(r => r.date === viewDate.value && r.status === 'present').length,
    absent:  records.value.filter(r => r.date === viewDate.value && r.status === 'absent').length,
    late:    records.value.filter(r => r.date === viewDate.value && r.status === 'late').length,
    excused: records.value.filter(r => r.date === viewDate.value && r.status === 'excused').length,
  }))

  function mark(id, status) {
    const rec = records.value.find(r => r.id === +id)
    if (rec) rec.status = status
  }

  return { records, loading, viewDate, viewClass, dailyRecords, summary, mark }
})
