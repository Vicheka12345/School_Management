import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const MOCK_STUDENTS = [
  { id: 1, code: 'STU001', name: 'Sophea Keo',     gender: 'Female', class: 'Grade 10A', dob: '2008-03-15', phone: '012-345-678', email: 'sophea@school.edu', status: 'active',   photo: null, address: 'Phnom Penh', enrolled: '2024-09-01', fee: 150 },
  { id: 2, code: 'STU002', name: 'Dara Chan',      gender: 'Male',   class: 'Grade 10B', dob: '2008-07-22', phone: '012-456-789', email: 'dara@school.edu',   status: 'active',   photo: null, address: 'Siem Reap',  enrolled: '2024-09-01', fee: 150 },
  { id: 3, code: 'STU003', name: 'Maly Pov',       gender: 'Female', class: 'Grade 11A', dob: '2007-11-08', phone: '012-567-890', email: 'maly@school.edu',   status: 'active',   photo: null, address: 'Battambang', enrolled: '2023-09-01', fee: 160 },
  { id: 4, code: 'STU004', name: 'Bopha Ly',       gender: 'Female', class: 'Grade 11B', dob: '2007-05-30', phone: '012-678-901', email: 'bopha@school.edu',  status: 'inactive', photo: null, address: 'Phnom Penh', enrolled: '2023-09-01', fee: 160 },
  { id: 5, code: 'STU005', name: 'Rathana Sorn',   gender: 'Male',   class: 'Grade 12A', dob: '2006-09-12', phone: '012-789-012', email: 'rathana@school.edu',status: 'active',   photo: null, address: 'Kampot',     enrolled: '2022-09-01', fee: 180 },
  { id: 6, code: 'STU006', name: 'Virak Tep',      gender: 'Male',   class: 'Grade 10A', dob: '2008-01-20', phone: '012-890-123', email: 'virak@school.edu',  status: 'active',   photo: null, address: 'Phnom Penh', enrolled: '2024-09-01', fee: 150 },
  { id: 7, code: 'STU007', name: 'Chanthy Noun',   gender: 'Female', class: 'Grade 12B', dob: '2006-04-17', phone: '012-901-234', email: 'chanthy@school.edu', status: 'active',  photo: null, address: 'Kandal',     enrolled: '2022-09-01', fee: 180 },
  { id: 8, code: 'STU008', name: 'Piseth Chhun',   gender: 'Male',   class: 'Grade 11A', dob: '2007-08-25', phone: '012-012-345', email: 'piseth@school.edu',  status: 'active',  photo: null, address: 'Takeo',      enrolled: '2023-09-01', fee: 160 },
]

export const useStudentStore = defineStore('students', () => {
  const students = ref([...MOCK_STUDENTS])
  const loading = ref(false)
  const search = ref('')
  const filterClass = ref('')
  const filterStatus = ref('')
  const page = ref(1)
  const perPage = ref(8)

  const filtered = computed(() => {
    let s = students.value
    if (search.value) s = s.filter(x => x.name.toLowerCase().includes(search.value.toLowerCase()) || x.code.includes(search.value))
    if (filterClass.value) s = s.filter(x => x.class === filterClass.value)
    if (filterStatus.value) s = s.filter(x => x.status === filterStatus.value)
    return s
  })

  const paginated = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filtered.value.slice(start, start + perPage.value)
  })

  const totalPages = computed(() => Math.ceil(filtered.value.length / perPage.value))

  function getById(id) { return students.value.find(s => s.id === +id) }

  function add(data) {
    const id = Math.max(...students.value.map(s => s.id)) + 1
    students.value.unshift({ id, code: `STU${String(id).padStart(3,'0')}`, ...data, status: 'active', photo: null })
    return id
  }

  function update(id, data) {
    const i = students.value.findIndex(s => s.id === +id)
    if (i !== -1) students.value[i] = { ...students.value[i], ...data }
  }

  function remove(id) {
    students.value = students.value.filter(s => s.id !== +id)
  }

  return { students, loading, search, filterClass, filterStatus, page, perPage, filtered, paginated, totalPages, getById, add, update, remove }
})
