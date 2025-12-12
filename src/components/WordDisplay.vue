<template lang="pug">
.word-wrapper(@click='like' :style='{cursor: liked ? "auto" : "pointer"}')
  transition(name="word")
    .word(:key="wordKey" :title='liked ? null : "Добавить в избранное"')
      span {{ word.description }}
      h1(:style='{opacity: likedEffect ? 0.5 : 1}') {{ word.text }}
  transition(name="bounce")
    .word-like(v-if='likedEffect')
      svg(width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z"
          fill='var(--error)')
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'

const props = defineProps({
  word: { type: Object as PropType<{ text: string; description: string }>, required: true },
  wordKey: { type: String as PropType<string>, required: true },
  liked: { type: Boolean as PropType<boolean>, default: false },
})

const emit = defineEmits<{
  (e: 'like'): void
}>()
const likedEffect = ref(false)
/**
 * Добавляет слово в избранное и запускает анимацию сердечка.
 */
const like = (): void => {
  if (props.liked) return
  emit('like')
  likedEffect.value = true
  setTimeout(() => {
    likedEffect.value = false
  }, 1000)
}
</script>

<style scoped lang="sass">
.word
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  flex-direction: column
  transition: all 0.3s ease
  h1
    font-size: 100px
    font-weight: 500
    text-align: center
  span
    font-size: 12px
    color: var(--c4)

  &-like
    cursor: pointer
    position: absolute
    display: flex
    align-items: center
    height: 100%

.word-wrapper
  position: relative
  width: 100vw
  height: 120px
  display: flex
  align-items: center
  justify-content: center

.word-enter-active, .word-leave-active
  transition: opacity 0.5s ease, transform 0.5s ease

.word-enter-from, .word-leave-to
  opacity: 0

.word-enter-to, .word-leave-from
  opacity: 1

.word-enter-from
  transform: translateY(100px)

.word-enter-to
  transform: translateY(0)

.word-leave-to
  transform: translateY(-100px)

.word-leave-from
  transform: translateY(-100)
</style>
