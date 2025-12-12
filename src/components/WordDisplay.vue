<template lang="pug">
.word-wrapper(ref="wrapperRef")
  transition(name="word")
    .word(:key="wordKey")
      h1(@click="toggleHelp" ref="headingRef" :style="headingStyle") {{ isHelp ? help : word.text }}
      span {{ word.description }}
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'

const props = defineProps({
  word: { type: Object as PropType<{ text: string; description: string }>, required: true },
  wordKey: { type: String as PropType<string>, required: true },
  help: { type: String as PropType<string>, required: true },
})

const MAX_FONT_SIZE = 100
const MIN_FONT_SIZE = 30
const FONT_STEP = 2

const isHelp = ref(false)
const fontSize = ref(MAX_FONT_SIZE)
const headingRef = ref<HTMLHeadingElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)

const headingStyle = ref({ fontSize: `${fontSize.value}px` })

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
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.word {
  position: absolute;
  inset: 0;
  @include mixins.stack;

  transition: all 0.3s ease;
  padding: 0 100px;

  h1 {
    cursor: pointer;
    @include mixins.text(100px, var(--c5), 500);

    text-align: center;
    max-height: 100%;
    line-height: 1.1;
    word-break: break-word;
  }

  span {
    @include mixins.text(12px, var(--c4));
  }

  &-like {
    cursor: pointer;
    position: absolute;
    @include mixins.flex-center;

    height: 100%;
  }
}

.word-wrapper {
  position: relative;
  width: 100vw;
  height: 120px;
  @include mixins.flex-center;

  justify-content: space-between;
  padding: 0 100px;
}

.word-enter-active,
.word-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.word-enter-from,
.word-leave-to {
  opacity: 0;
}

.word-enter-to,
.word-leave-from {
  opacity: 1;
}

.word-enter-from {
  transform: translateY(100px);
}

.word-enter-to {
  transform: translateY(0);
}

.word-leave-to {
  transform: translateY(-100px);
}

.word-leave-from {
  transform: translateY(-100);
}
</style>
