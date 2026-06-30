<template>
  <div>
    <label v-if="label" :for="id" class="form-label">{{ label }} <span v-if="required" class="text-red-400">*</span></label>
    <div class="relative">
      <span v-if="prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">{{ prefix }}</span>
      <input
        :id="id"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="['form-input', prefix ? 'pl-8' : '', error ? 'border-red-500/60 focus:ring-red-500/40' : '']"
        :placeholder="placeholder"
        :type="type"
        :required="required"
      />
    </div>
    <p v-if="error" class="text-red-400 text-xs mt-1">{{ error }}</p>
    <p v-if="hint && !error" class="text-dark-500 text-xs mt-1">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { default: '' },
  label:      { type: String,  default: '' },
  placeholder:{ type: String,  default: '' },
  type:       { type: String,  default: 'text' },
  id:         { type: String,  default: () => `input-${Math.random().toString(36).slice(2)}` },
  required:   { type: Boolean, default: false },
  error:      { type: String,  default: '' },
  hint:       { type: String,  default: '' },
  prefix:     { type: String,  default: '' },
})
defineEmits(['update:modelValue'])
</script>
