<template lang="pug">
.counter(v-if="total && current")
  span {{ passed }} / {{ total }}
</template>

<script setup lang="ts">
defineProps<{ passed: number; total: number; current: boolean }>()
</script>
