<template lang="pug">
.word-display(ref="wrapperRef")
  transition(name="word-display")
    .word-display__word(:key="wordKey")
      h1.word-display__title(@click="toggleHelp" ref="headingRef" :style="headingStyle")
        | {{ isHelp ? help : word.text }}
      span.word-display__description {{ word.description }}
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'

import { useSwipeNavigation } from '@/composables/useSwipeNavigation'

const props = defineProps({
  word: { type: Object as PropType<{ text: string; description: string }>, required: true },
  wordKey: { type: String as PropType<string>, required: true },
  help: { type: String as PropType<string>, required: true },
})

const emit = defineEmits<{ (e: 'next'): void; (e: 'prev'): void }>()

const MAX_FONT_SIZE = 100
const MIN_FONT_SIZE = 30
const FONT_STEP = 2

const isHelp = ref(false)
const fontSize = ref(MAX_FONT_SIZE)
const headingRef = ref<HTMLHeadingElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

const headingStyle = ref({ fontSize: `${fontSize.value}px` })

/**
 * Вызывает переход к следующему слову при свайпе влево.
 */
const handleSwipeLeft = (): void => {
  emit('next')
}

/**
 * Возвращает предыдущее слово при свайпе вправо.
 */
const handleSwipeRight = (): void => {
  emit('prev')
}

/**
 * Переключает отображение подсказки или исходного слова.
 */
const toggleHelp = (): void => {
  isHelp.value = !isHelp.value
  nextTick(adjustFontSize)
}

/**
 * Подбирает размер шрифта заголовка так, чтобы текст помещался по высоте контейнера.
 */
const adjustFontSize = (): void => {
  const heading = headingRef.value
  const wrapper = wrapperRef.value

  if (!heading || !wrapper) return

  const availableHeight = wrapper.clientHeight
  let currentSize = MAX_FONT_SIZE

  heading.style.fontSize = `${currentSize}px`

  while (heading.scrollHeight > availableHeight && currentSize > MIN_FONT_SIZE) {
    currentSize -= FONT_STEP
    heading.style.fontSize = `${currentSize}px`
  }

  fontSize.value = currentSize
  headingStyle.value = { fontSize: `${currentSize}px` }
}

watch(
  () => props.word.text,
  () => {
    isHelp.value = false
    nextTick(adjustFontSize)
  },
)

onMounted(() => {
  nextTick(adjustFontSize)
  window.addEventListener('resize', adjustFontSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustFontSize)
})

useSwipeNavigation(wrapperRef, {
  onSwipeLeft: handleSwipeLeft,
  onSwipeRight: handleSwipeRight,
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.word-display {
  @include mixins.flex-center;

  position: relative;
  justify-content: space-between;
  padding: 0 100px;
  width: 100vw;
  height: 120px;

  &__word {
    @include mixins.stack;

    position: absolute;
    inset: 0;
    transition: all 0.3s ease;
    padding: 0 100px;
  }

  &__title {
    @include mixins.text(100px, var(--c5), 500);

    cursor: pointer;
    max-height: 100%;
    text-align: center;
    line-height: 1.1;
    word-break: break-word;
  }

  &__description {
    @include mixins.text(12px, var(--c4));
  }
}

.word-display-enter-active,
.word-display-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.word-display-enter-from,
.word-display-leave-to {
  opacity: 0;
}

.word-display-enter-to,
.word-display-leave-from {
  opacity: 1;
}

.word-display-enter-from {
  transform: translateY(100px);
}

.word-display-enter-to {
  transform: translateY(0);
}

.word-display-leave-to {
  transform: translateY(-100px);
}

.word-display-leave-from {
  transform: translateY(-100);
}
</style>
