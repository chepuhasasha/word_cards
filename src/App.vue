<template lang="pug">
main
  UploadPrompt(v-if="!current" @open="open")
  template(v-else)
    ModeBar(
      :mode="mode"
      :use-favorites="useFavorites"
      :has-favorites="hasFavorites"
      @update:mode="updateMode"
      @toggle:favorites="toggleFavorites"
      @open="open"
    )
    WordCounter(
      :passed="passedCount"
      :total="totalCount"
      :current="Boolean(current)"
      :liked="isCurrentLiked"
      @remove-like="removeLike"
    )
    WordDisplay(:word="displayedWord" :word-key="wordKey" :liked="isCurrentLiked" @like="likeCurrentWord")
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
  description: string
}

const mode = ref<'test' | 'learn' | 'write'>('learn')
const useFavorites = ref(false)
const list = ref<Word[]>([])
const favorites = ref<Word[]>([])
const current = ref<Word | null>(null)
const options = ref<string[]>([])
const selected = ref<string | null>(null)
const isCorrect = ref<boolean | null>(null)
const userAnswer = ref('')
const remaining = ref<Word[]>([])
const likedRemaining = ref<Word[]>([])

const fileInput = ref<HTMLInputElement | null>(null)

const hasFavorites = computed(() => favorites.value.length > 0)
const totalCount = computed(() => (useFavorites.value ? favorites.value.length : list.value.length))

const passedCount = computed(() => {
  const pool = useFavorites.value ? likedRemaining.value : remaining.value
  const listForMode = useFavorites.value ? favorites.value : list.value

  if (!listForMode.length || !current.value) return 0
  return listForMode.length - pool.length
})

const displayedWord = computed(() => {
  if (current.value) {
    return {
      text: mode.value === 'write' ? current.value.translation : current.value.word,
      description: mode.value === 'test' ? '' : current.value.description,
    }
  }
  return {
    text: '',
    description: '',
  }
})

const wordKey = computed(() => {
  if (!current.value) return ''
  return `${current.value.word}-${mode.value}-${useFavorites.value ? 'liked' : 'regular'}`
})

const FAVORITES_KEY = 'word-cards.favorites'

const isCurrentLiked = computed(() => {
  if (!current.value) return false
  return favorites.value.some((word) => word.word === current.value?.word)
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
 * Сохраняет список избранных слов в localStorage.
 */
const persistFavorites = (): void => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
}

/**
 * Загружает сохраненные избранные слова из localStorage.
 */
const loadFavorites = (): void => {
  const stored = localStorage.getItem(FAVORITES_KEY)

  if (!stored) return

  const parsed = JSON.parse(stored) as Word[]
  favorites.value = parsed
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
        description: item.description,
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
 * Возвращает актуальный список слов в зависимости от выбранного источника.
 */
const getActiveList = (): Word[] => {
  return useFavorites.value ? favorites.value : list.value
}

/**
 * Возвращает пул оставшихся слов для текущего источника.
 */
const getActivePool = (): typeof remaining => {
  return useFavorites.value ? likedRemaining : remaining
}

/**
 * Формирует новый вопрос и подставляет варианты ответа.
 */
const generateQuestion = (): void => {
  const listForMode = getActiveList()
  const pool = getActivePool()

  if (!listForMode.length) {
    current.value = null
    options.value = []
    selected.value = null
    isCorrect.value = null
    return
  }

  if (!pool.value.length) {
    pool.value = shuffle([...listForMode])
  }

  const word = pool.value.pop()
  if (!word) return

  current.value = word

  const others = listForMode.filter((w) => w !== word)
  const distractors = shuffle(others)
    .slice(0, Math.min(3, others.length))
    .map((w) => w.translation)
  const allOptions = mode.value === 'test' ? shuffle([...distractors, word.translation]) : []

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
  selected.value = null
  if (nextMode !== 'test') {
    options.value = []
  }
  generateQuestion()
}

/**
 * Добавляет текущее слово в избранное.
 */
const likeCurrentWord = (): void => {
  if (!current.value) return
  if (isCurrentLiked.value) return

  favorites.value = [...favorites.value, current.value]
  likedRemaining.value = []
  persistFavorites()
}

/**
 * Удаляет текущее слово из избранного.
 */
const removeLike = (): void => {
  if (!current.value) return

  favorites.value = favorites.value.filter((word) => word.word !== current.value?.word)
  likedRemaining.value = likedRemaining.value.filter((word) => word.word !== current.value?.word)
  persistFavorites()

  if (useFavorites.value) {
    if (!favorites.value.length) {
      setSource(false)
      return
    }

    generateQuestion()
  }
}

/**
 * Сбрасывает состояние после смены источника слов.
 */
const resetAfterSourceChange = (): void => {
  isCorrect.value = null
  userAnswer.value = ''
  selected.value = null

  if (mode.value !== 'test') {
    options.value = []
  }

  generateQuestion()
}

/**
 * Переключает источник слов между избранными и загруженным списком.
 * @param useFavoriteSource Флаг использования избранного списка слов.
 */
const setSource = (useFavoriteSource: boolean): void => {
  useFavorites.value = useFavoriteSource

  if (useFavoriteSource) {
    likedRemaining.value = []
  } else {
    remaining.value = []
  }

  resetAfterSourceChange()
}

/**
 * Переключает источник слов между избранными и загруженным списком.
 */
const toggleFavorites = (): void => {
  if (!useFavorites.value && !favorites.value.length) return

  setSource(!useFavorites.value)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  loadFavorites()
  generateQuestion()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
