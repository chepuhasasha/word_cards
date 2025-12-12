<template lang="pug">
.counter(v-if="total && current")
  span {{ passed }} / {{ total }}
  .counter-isliked(v-if='liked' @click="removeLike")
    svg(width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z"
        fill='var(--error)')
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'remove-like'): void
}>()

defineProps<{ passed: number; total: number; current: boolean; liked: boolean }>()

/**
 * Сообщает о запросе удалить текущее слово из избранного.
 */
const removeLike = (): void => {
  emit('remove-like')
}
</script>

<style scoped lang="sass">
.counter
  position: relative
  align-items: center
  font-size: 14px
  color: var(--c4)
  text-align: center
  margin-bottom: 8px
  &-isliked
    position: absolute
    bottom: 100%
    left: 50%
    transform: translateX(-50%)
    cursor: pointer
</style>
