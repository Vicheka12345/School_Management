import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const MOCK_TEACHERS = [
  { id: 1, code: 'TCH001', name: 'Mr. Sokha Heng',   gender: 'Male',   subject: 'Mathematics',  phone: '012-111-222', email: 'sokha@school.edu',  salary: 800,  hire_date: '2020-01-15', status: 'active',   photo: null },
  { id: 2, code: 'TCH002', name: 'Ms. Sreymom Sar',  gender: 'Female', subject: 'Khmer',         phone: '012-222-333', email: 'sreymom@school.edu',salary: 750,  hire_date: '2019-09-01', status: 'active',   photo: null },
  { id: 3, code: 'TCH003', name: 'Mr. Veasna Khem',  gender: 'Male',   subject: 'Physics',       phone: '012-333-444', email: 'veasna@school.edu', salary: 820,  hire_date: '2021-03-10', status: 'active',   photo: null },
  { id: 4, code: 'TCH004', name: 'Ms. Channary Ros', gender: 'Female', subject: 'English',       phone: '012-444-555', email: 'channary@school.edu',salary: 780, hire_date: '2018-08-20', status: 'active',   photo: null },
  { id: 5, code: 'TCH005', name: 'Mr. Bunna Lim',    gender: 'Male',   subject: 'History',       phone: '012-555-666', email: 'bunna@school.edu',  salary: 700,  hire_date: '2022-01-05', status: 'inactive', photo: null },
  { id: 6, code: 'TCH006', name: 'Ms. Dara Pich',    gender: 'Female', subject: 'Chemistry',     phone: '012-666-777', email: 'dara@school.edu',   salary: 810,  hire_date: '2020-06-15', status: 'active',   photo: null },
]

export const useTeacherStore = defineStore('teachers', () => {
  const teachers = ref([...MOCK_TEACHERS])
  const loading = ref(false)
  const search = ref('')
  const filterStatus = ref('')
  const page = ref(1)
  const perPage = ref(8)

  const filtered = computed(() => {
    let t = teachers.value
    if (search.value) t = t.filter(x => x.name.toLowerCase().includes(search.value.toLowerCase()) || x.code.includes(search.value))
    if (filterStatus.value) t = t.filter(x => x.status === filterStatus.value)
    return t
  })

  const paginated = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filtered.value.slice(start, start + perPage.value)
  })

  const totalPages = computed(() => Math.ceil(filtered.value.length / perPage.value))

  function getById(id) { return teachers.value.find(t => t.id === +id) }

  function add(data) {
    const id = Math.max(...teachers.value.map(t => t.id)) + 1
    teachers.value.unshift({ id, code: `TCH${String(id).padStart(3,'0')}`, ...data, status: 'active', photo: null })
    return id
  }

  function update(id, data) {
    const i = teachers.value.findIndex(t => t.id === +id)
    if (i !== -1) teachers.value[i] = { ...teachers.value[i], ...data }
  }

  function remove(id) {
    teachers.value = teachers.value.filter(t => t.id !== +id)
  }

  return { teachers, loading, search, filterStatus, page, perPage, filtered, paginated, totalPages, getById, add, update, remove }
})
