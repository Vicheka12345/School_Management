<template>
  <div class="space-y-4">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  errors: { type: Object, default: () => ({}) }
})
</script>
