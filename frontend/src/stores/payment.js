import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const today = new Date().toISOString().split('T')[0]

const MOCK_PAYMENTS = [
  { id: 1, receipt: 'RCP001', student: 'Sophea Keo',   studentId: 1, type: 'Tuition', amount: 150, discount: 0,  paid: 150, status: 'paid',    date: '2024-09-05', note: '' },
  { id: 2, receipt: 'RCP002', student: 'Dara Chan',    studentId: 2, type: 'Tuition', amount: 150, discount: 10, paid: 140, status: 'paid',    date: '2024-09-06', note: 'Scholarship' },
  { id: 3, receipt: 'RCP003', student: 'Maly Pov',     studentId: 3, type: 'Tuition', amount: 160, discount: 0,  paid: 0,   status: 'debt',    date: '2024-09-07', note: '' },
  { id: 4, receipt: 'RCP004', student: 'Bopha Ly',     studentId: 4, type: 'Uniform', amount: 25,  discount: 0,  paid: 25,  status: 'paid',    date: '2024-09-08', note: '' },
  { id: 5, receipt: 'RCP005', student: 'Rathana Sorn', studentId: 5, type: 'Tuition', amount: 180, discount: 0,  paid: 90,  status: 'partial', date: '2024-09-09', note: 'Half payment' },
  { id: 6, receipt: 'RCP006', student: 'Virak Tep',    studentId: 6, type: 'Tuition', amount: 150, discount: 0,  paid: 150, status: 'paid',    date: today,        note: '' },
  { id: 7, receipt: 'RCP007', student: 'Chanthy Noun', studentId: 7, type: 'Books',   amount: 40,  discount: 5,  paid: 35,  status: 'paid',    date: today,        note: '' },
]

export const usePaymentStore = defineStore('payments', () => {
  const payments = ref([...MOCK_PAYMENTS])
  const loading = ref(false)
  const search = ref('')
  const filterStatus = ref('')
  const filterType = ref('')
  const page = ref(1)
  const perPage = ref(8)

  const filtered = computed(() => {
    let p = payments.value
    if (search.value) p = p.filter(x => x.student.toLowerCase().includes(search.value.toLowerCase()) || x.receipt.includes(search.value))
    if (filterStatus.value) p = p.filter(x => x.status === filterStatus.value)
    if (filterType.value)   p = p.filter(x => x.type === filterType.value)
    return p
  })

  const paginated = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filtered.value.slice(start, start + perPage.value)
  })

  const totalPages = computed(() => Math.ceil(filtered.value.length / perPage.value))

  const totalRevenue = computed(() => payments.value.reduce((s, p) => s + p.paid, 0))
  const totalDebt     = computed(() => payments.value.reduce((s, p) => s + (p.amount - p.paid), 0))
  const todayRevenue  = computed(() => payments.value.filter(p => p.date === today).reduce((s, p) => s + p.paid, 0))

  function add(data) {
    const id = Math.max(...payments.value.map(p => p.id)) + 1
    payments.value.unshift({ id, receipt: `RCP${String(id).padStart(3,'0')}`, ...data, date: today })
    return id
  }

  function update(id, data) {
    const i = payments.value.findIndex(p => p.id === +id)
    if (i !== -1) payments.value[i] = { ...payments.value[i], ...data }
  }

  function remove(id) { payments.value = payments.value.filter(p => p.id !== +id) }

  return { payments, loading, search, filterStatus, filterType, page, perPage, filtered, paginated, totalPages, totalRevenue, totalDebt, todayRevenue, add, update, remove }
})
