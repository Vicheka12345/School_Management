<template>
  <button
    :class="['btn', variantClass, sizeClass, { 'opacity-60 cursor-not-allowed': disabled || loading }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | danger | success
  size:    { type: String, default: 'md' },      // sm | md | lg
  loading: { type: Boolean, default: false },
  disabled:{ type: Boolean, default: false },
})
const variantClass = computed(() => ({
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  success:   'btn-success',
}[props.variant] || 'btn-primary'))

const sizeClass = computed(() => ({ sm: 'btn-sm', lg: 'btn-lg' }[props.size] || ''))
</script>
