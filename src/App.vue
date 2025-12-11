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
  audio: string | null
}

const mode = ref<'test' | 'learn' | 'write'>('learn')
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
