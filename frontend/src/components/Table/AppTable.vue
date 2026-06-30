<template>
  <div class="overflow-hidden rounded-2xl border border-dark-700/50">
    <!-- Toolbar -->
    <div v-if="$slots.toolbar" class="px-4 py-3 border-b border-dark-700/40 bg-dark-800/40">
      <slot name="toolbar" />
    </div>

    <!-- Table wrapper -->
    <div class="overflow-x-auto">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key"
              :class="['select-none', col.sortable ? 'cursor-pointer hover:text-dark-300 transition-colors' : '']"
              @click="col.sortable && toggleSort(col.key)"
            >
              <div class="flex items-center gap-1.5">
                {{ col.label }}
                <span v-if="col.sortable" class="text-dark-600">
                  <span v-if="sortKey === col.key">{{ sortDir === 'asc' ? '<ArrowUp class="w-4 h-4 text-current" />' : '<ArrowDown class="w-4 h-4 text-current" />' }}</span>
                  <span v-else class="opacity-40"><ArrowUpDown class="w-4 h-4 text-current" /></span>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td :colspan="columns.length" class="text-center py-12 text-dark-500">
              <div class="flex flex-col items-center gap-2">
                <span class="text-4xl"><Inbox class="w-12 h-12 text-current" /></span>
                <span>{{ emptyText }}</span>
              </div>
            </td>
          </tr>
          <tr v-for="(row, i) in sortedRows" :key="row.id ?? i" class="animate-fade-in">
            <slot :row="row" :index="i" />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from 'lucide-vue-next'

import { ref, computed } from 'vue'

const props = defineProps({
  columns:   { type: Array,  default: () => [] },
  rows:      { type: Array,  default: () => [] },
  emptyText: { type: String, default: 'No records found' },
})

const sortKey = ref('')
const sortDir = ref('asc')

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value], bv = b[sortKey.value]
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})
</script>
