<template lang="pug">
.counter(v-if="total && current")
  span {{ passed }} / {{ total }}
</template>

<script setup lang="ts">
defineProps<{ passed: number; total: number; current: boolean }>()
</script>

<style scoped lang="sass">
.counter
  font-size: 14px
  color: var(--c4)
  text-align: center
  margin-bottom: 8px
</style>
