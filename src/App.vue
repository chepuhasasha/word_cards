<template lang="pug">
main
  UploadPrompt(v-if="!current" @open="open")
  template(v-else)
    ModeBar(:mode="mode" @update:mode="updateMode" @open="open")
    WordCounter(:passed="passedCount" :total="totalCount" :current="Boolean(current)")
    WordDisplay(:text="displayedWord" :word-key="wordKey")
    AudioPlayer(
      v-if="mode !== 'write' && current?.audio"
      :audio-src="current?.audio || ''"
      :transcription="current?.transcription || ''"
      :autoplay="mode !== 'write'"
    )
    AnswerSection(
      :mode="mode"
      :options="options"
      :selected="selected"
      :is-correct="isCorrect"
      :translation="current?.translation || ''"
      :user-answer="userAnswer"
      @select="check"
      @submit-write="checkWrite"
      @update:userAnswer="(value: string) => (userAnswer = value)"
    )
  input(type="file" ref="fileInput" accept="application/json" @change="onFileChange" style="display: none")
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AnswerSection from './components/AnswerSection.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import ModeBar from './components/ModeBar.vue'
import UploadPrompt from './components/UploadPrompt.vue'
import WordCounter from './components/WordCounter.vue'
import WordDisplay from './components/WordDisplay.vue'

export interface Word {
  word: string
  translation: string
  transcription: string
  audio: string
  rating?: number
}

const mode = ref<'test' | 'learn' | 'write'>('test')
const list = ref<Word[]>([])
const current = ref<Word | null>(null)
const options = ref<string[]>([])
const selected = ref<string | null>(null)
const isCorrect = ref<boolean | null>(null)
const userAnswer = ref('')
const remaining = ref<Word[]>([])

const fileInput = ref<HTMLInputElement | null>(null)

const totalCount = computed(() => list.value.length)

const passedCount = computed(() => {
  if (!list.value.length || !current.value) return 0
  return list.value.length - remaining.value.length
})

const displayedWord = computed(() => {
  if (!current.value) return ''
  return mode.value === 'write' ? current.value.translation : current.value.word
})

const wordKey = computed(() => {
  if (!current.value) return ''
  return `${current.value.word}-${mode.value}`
})

/**
 * Перемешивает элементы переданного массива.
 * @param arr Массив, порядок элементов которого нужно случайно изменить.
 */
const shuffle = <T,>(arr: T[]): T[] => {
  return [...arr].sort(() => Math.random() - 0.5)
}

/**
 * Открывает системный диалог выбора файла словаря.
 */
const open = (): void => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

/**
 * Разбирает выбранный пользователем JSON-файл и инициализирует словарь.
 * @param e Событие изменения значения input type="file".
 */
const onFileChange = async (e: Event): Promise<void> => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!Array.isArray(data)) {
      throw new Error('Invalid format')
    }

    const parsed: Word[] = data
      .filter(
        (item) =>
          item &&
          typeof item.word === 'string' &&
          typeof item.translation === 'string' &&
          typeof item.audio === 'string',
      )
      .map((item) => ({
        word: String(item.word),
        translation: String(item.translation),
        transcription: item.transcription ? String(item.transcription) : '',
        audio: String(item.audio),
        rating:
          typeof item.rating === 'number'
            ? item.rating
            : item.rating != null
              ? Number(item.rating)
              : undefined,
      }))

    if (!parsed.length) {
      throw new Error('Empty list')
    }

    list.value = parsed
    current.value = null
    isCorrect.value = null
    userAnswer.value = ''
    options.value = []

    remaining.value = shuffle([...list.value])

    generateQuestion()
  } catch (err) {
    console.error(err)
    alert('Ошибка при чтении файла словаря. Проверьте формат JSON.')
  } finally {
    target.value = ''
  }
}

/**
 * Формирует новый вопрос и подставляет варианты ответа.
 */
const generateQuestion = (): void => {
  if (!list.value.length) return

  if (!remaining.value.length) {
    remaining.value = shuffle([...list.value])
  }

  const word = remaining.value.pop()
  if (!word) return

  current.value = word

  const others = list.value.filter((w) => w !== word)
  const distractors = shuffle(others)
    .slice(0, Math.min(3, others.length))
    .map((w) => w.translation)
  const allOptions = shuffle([...distractors, word.translation])

  options.value = allOptions
  selected.value = null
  isCorrect.value = null

  if (mode.value !== 'write') {
    isCorrect.value = null
  }
}

/**
 * Переходит к следующему слову, очищая пользовательский ввод при необходимости.
 */
const next = (): void => {
  if (mode.value === 'write') {
    userAnswer.value = ''
  }
  generateQuestion()
}

/**
 * Проверяет выбранный вариант в режиме теста.
 * @param answer Вариант ответа, выбранный пользователем.
 */
const check = (answer: string): void => {
  if (mode.value !== 'test') return
  if (!current.value) return

  selected.value = answer
  isCorrect.value = answer === current.value.translation

  if (isCorrect.value) {
    setTimeout(() => {
      generateQuestion()
    }, 300)
  }
}

/**
 * Нормализует строку для сравнения ответов.
 * @param s Строка, которую нужно привести к единому формату.
 */
const normalize = (s: string): string => s.trim().toLowerCase()

/**
 * Проверяет введенный ответ в режиме "Напиши" и переходит к следующему слову при успехе.
 */
const checkWrite = (): void => {
  if (mode.value !== 'write') return
  if (!current.value) return

  const correct = normalize(userAnswer.value) === normalize(current.value.word)
  isCorrect.value = correct

  if (correct) {
    setTimeout(() => {
      next()
    }, 300)
  }
}

/**
 * Обрабатывает нажатия Enter в разных режимах обучения.
 * @param e Событие клавиатуры.
 */
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key !== 'Enter') return

  if (mode.value === 'learn') {
    e.preventDefault()
    next()
  } else if (mode.value === 'write') {
    e.preventDefault()
    checkWrite()
  }
}

/**
 * Устанавливает новый режим обучения и сбрасывает состояние ввода.
 * @param nextMode Режим, выбранный пользователем.
 */
const updateMode = (nextMode: 'test' | 'learn' | 'write'): void => {
  mode.value = nextMode
  isCorrect.value = null
  userAnswer.value = ''
  if (current.value) {
    generateQuestion()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  generateQuestion()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass">
main
  background: var(--c1)
  height: 100vh
  width: 100vw
  display: flex
  flex-direction: column
  place-items: center
  place-content: center
  gap: 40px

button
  cursor: pointer
  border: none
  transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease
  &::active
    transform: scale(0.7)
  &:hover
    transform: scale(0.95)
  &:focus-visible
    outline: 2px solid var(--accent)

.ok
  color: var(--ok) !important
  outline: 2px solid var(--ok)
.error
  color: var(--error) !important
  outline: 2px solid var(--error)

.open
  display: flex
  flex-direction: column
  gap: 20px
  button
    background: none
    &:hover
      path
        stroke: var(--accent)
  span
    font-size: 12px
    color: var(--c4)

.bar
  display: flex
  gap: 10px
  &__active
    path
      stroke: var(--accent)
  button
    color: var(--c4)
    background: var(--c1)
    display: flex
    align-items: center
    justify-content: space-around
    min-height: 80px
    min-width: 80px
    height: 80px
    border-radius: 20px
    &:hover
      outline: 2px solid var(--accent)
      path
        stroke: var(--accent)

.counter
  font-size: 14px
  color: var(--c4)
  text-align: center
  margin-bottom: 8px

.word
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  font-size: 100px
  font-weight: 500
  text-align: center
  &-wrapper
    position: relative
    width: 100vw
    height: 120px
    display: flex
    align-items: center
    justify-content: center

  &-enter-active, &-leave-active
    transition: opacity 0.5s ease, transform 0.5s ease
  &-enter-from, &-leave-to
    opacity: 0
  &-enter-to, &-leave-from
    opacity: 1
  &-enter-from
    transform: translateY(100px)
  &-enter-to
    transform: translateY(0)
  &-leave-to
    transform: translateY(-100px)
  &-leave-from
    transform: translateY(-100)

.audio
  &__play
    outline: 2px solid var(--accent)
    path
      stroke: var(--accent)

  span
    color: var(--c4)
    font-size: 12px

  button
    color: var(--c4)
    background: var(--c2)
    display: flex
    align-items: center
    justify-content: space-around
    min-height: 80px
    min-width: 80px
    height: 80px
    border-radius: 20px

    &:hover
      background: var(--accent)
      color: var(--c1)
      path
        stroke: var(--c1)

.answer
  display: flex
  gap: 20px
  place-content: center
  place-items: center
  flex-wrap: wrap
  width: 100vw
  padding: 0 10vw

  button
    text-align: center
    padding: 0 10px
    padding-bottom: 6px
    border-radius: 10px
    font-size: 40px
    width: max-content
    background: none
    color: var(--c5)
    &:hover
      color: var(--accent)
    &:focus-visible
      color: var(--accent)

  input
    font-size: 50px
    text-align: center
    background: none
    border: none
    border-bottom: 2px solid var(--c2)
    color: var(--c5)
    outline: none
    &::placeholder
      font-size: 12px
      color: var(--c3)
    &:focus-visible
      border-color: var(--accent)

  &__text
    font-size: 40px
    color: var(--c5)
</style>
