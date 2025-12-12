<template lang="pug">
.word-wrapper
  transition(name="word")
    .word(:key="wordKey")
      h1(@click='isHelp = !isHelp') {{ isHelp ? help : word.text }}
      span {{ word.description }}
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'

const props = defineProps({
  word: { type: Object as PropType<{ text: string; description: string }>, required: true },
  wordKey: { type: String as PropType<string>, required: true },
  help: { type: String as PropType<string>, required: true },
})

const isHelp = ref(false)
watch(
  () => props.word.text,
  () => (isHelp.value = false),
)
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
  padding: 0 100px
  h1
    cursor: pointer
    font-size: 100px
    font-weight: 500
    text-align: center
    min-height: 130px
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
  justify-content: space-between
  padding: 0 100px

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
