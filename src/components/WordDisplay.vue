<template lang="pug">
.word-wrapper
  transition(name="word")
    .word(:key="wordKey")
      span {{ word.description }}
      |{{ word.text }}
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  word: { type: Object as PropType<{ text: string; description: string }>, required: true },
  wordKey: { type: String as PropType<string>, required: true },
})
</script>

<style scoped lang="sass">
.word
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  font-size: 100px
  font-weight: 500
  text-align: center
  flex-direction: column
  span
    font-size: 12px
    color: var(--c4)

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
