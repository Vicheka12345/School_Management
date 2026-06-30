<template>
  <div>
    <label v-if="label" class="form-label">{{ label }} <span v-if="required" class="text-red-400">*</span></label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="['form-input', error ? 'border-red-500/60' : '']"
      v-bind="$attrs"
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value ?? opt" :value="opt.value ?? opt">
        {{ opt.label ?? opt }}
      </option>
    </select>
    <p v-if="error" class="text-red-400 text-xs mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { default: '' },
  label:      { type: String, default: '' },
  placeholder:{ type: String, default: 'Select...' },
  options:    { type: Array,  default: () => [] },
  required:   { type: Boolean,default: false },
  error:      { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>
