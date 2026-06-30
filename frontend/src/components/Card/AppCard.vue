<template>
  <div class="glass-card" :class="[padding, hover ? 'hover:border-primary-500/30 transition-all duration-300' : '']">
    <div v-if="title || $slots.header" class="flex items-center justify-between mb-5">
      <div>
        <h3 v-if="title" class="font-semibold text-white text-base">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-dark-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title:    { type: String,  default: '' },
  subtitle: { type: String,  default: '' },
  padding:  { type: String,  default: 'p-6' },
  hover:    { type: Boolean, default: false },
})
</script>
