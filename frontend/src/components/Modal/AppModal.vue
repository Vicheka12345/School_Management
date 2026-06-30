<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="modal-box" :class="sizeClass">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-dark-700/40">
            <div>
              <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
              <p v-if="subtitle" class="text-sm text-dark-400 mt-0.5">{{ subtitle }}</p>
            </div>
            <button
              @click="$emit('update:modelValue', false)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-dark-400 hover:text-white hover:bg-dark-700/50 transition-all"
            ><X class="w-4 h-4 text-current" /></button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 pb-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String,  default: '' },
  subtitle:   { type: String,  default: '' },
  size:       { type: String,  default: 'md' }, // sm | md | lg | xl
})
defineEmits(['update:modelValue'])

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}[props.size] || 'max-w-lg'))
</script>

<style scoped>
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from   { opacity: 0; }
.modal-leave-to     { opacity: 0; }
.modal-enter-from .modal-box   { transform: scale(0.95) translateY(10px); }
.modal-leave-to   .modal-box   { transform: scale(0.95) translateY(10px); }
</style>
