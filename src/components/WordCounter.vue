<template lang="pug">
.counter(v-if="total && current")
  button(@click='prev')
    svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(
        d="M15 18L9 12L15 6"
        stroke="var(--c3)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round")
  .counter_content
    span {{ passed }} / {{ total }}
    .counter-isliked(@click='like')
      svg(width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z"
          stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
    transition(name="bounce")
      .counter-isliked(v-if='liked' @click="removeLike")
        svg(width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
          path(d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z"
            fill='var(--error)' stroke="var(--error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
  button(@click='next')
    svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(
        d="M9 18L15 12L9 6"
        stroke="var(--c3)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round")
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'remove-like'): void
  (e: 'like'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()

defineProps<{ passed: number; total: number; current: boolean; liked: boolean }>()

/**
 * Сообщает о запросе удалить текущее слово из избранного.
 */
const removeLike = (): void => {
  emit('remove-like')
}

/**
 * Добавляет слово в избранное и запускает анимацию сердечка.
 */
const like = (): void => {
  emit('like')
}

/**
 * Сообщает о запросе перейти к предыдущему слову.
 */
const prev = (): void => {
  emit('prev')
}

/**
 * Сообщает о запросе перейти к следующему слову.
 */
const next = (): void => {
  emit('next')
}
</script>

<style scoped lang="sass">
.counter
  display: flex
  align-items: center
  justify-content: center
  gap: 10px
  position: relative
  align-items: center
  font-size: 14px
  color: var(--c4)
  &-isliked
    position: absolute
    bottom: 100%
    left: calc(50% - 10px)
    cursor: pointer

  button
    background: none
    height: 40px
    width: 40px
    display: flex
    place-content: center
    place-items: center
    &:hover
      path
        stroke: var(--accent)
</style>
