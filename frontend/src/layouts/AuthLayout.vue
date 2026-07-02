<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark-950">
    <!-- Animated background blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay:1.5s"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay:3s"></div>
      <!-- Grid pattern -->
      <div class="absolute inset-0 opacity-[0.03]"
        style="background-image: linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-md px-4 animate-slide-up">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 mb-4">
          <img 
            src="/logo-sovannaphumi.svg" 
            alt="Sovannaphumi School Logo" 
            class="w-20 h-20 object-contain"
          />
        </div>
        <h1 class="text-2xl font-bold text-white dark:text-white text-dark-900">Sovannaphumi School</h1>
        <p class="text-sm font-medium text-dark-400 dark:text-dark-400 text-dark-600 mt-1">Management System</p>
        <p class="text-xs text-dark-500 dark:text-dark-500 text-dark-500 mt-1">Academic Year 2025-2026</p>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup>
// No imports needed for the logo
</script>
