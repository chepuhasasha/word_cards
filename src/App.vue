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
      @prev="prev"
      @next="next"
      @remove-like="removeLike"
      @like="likeCurrentWord"
    )
    WordDisplay(:word="displayedWord" :word-key="wordKey" :help='mode != "write" ? current?.translation : current?.word')
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
    .keyboard
      .keyboard_key
        .keyboard_value(:class='{keyboard_highlight: activeKey === "1"}') 1
        .keyboard_value(:class='{keyboard_highlight: activeKey === "2"}') 2
        .keyboard_value(:class='{keyboard_highlight: activeKey === "3"}') 3
        .keyboard_value(:class='{keyboard_highlight: activeKey === "4"}') 4
        .keyboard_hint выбрать ответ (в тесте)
      .keyboard_key
        .keyboard_value(:class='{keyboard_highlight: activeKey === "ArrowLeft"}') ←
        .keyboard_value(:class='{keyboard_highlight: activeKey === "ArrowRight"}') →
        .keyboard_hint навигация по словам
      .keyboard_key
        .keyboard_value(:class='{keyboard_highlight: activeKey == " "}') Space
        .keyboard_hint лайк
      .keyboard_key
        .keyboard_value(:class='{keyboard_highlight: activeKey == "Enter"}') Enter
        .keyboard_hint подтвердить или перейти
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
const order = ref<Word[]>([])
const currentIndex = ref(0)
const activeKey = ref<string | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)

const hasFavorites = computed(() => favorites.value.length > 0)
const totalCount = computed(() => (useFavorites.value ? favorites.value.length : list.value.length))

const passedCount = computed(() => {
  if (!order.value.length || !current.value) return 0

  return currentIndex.value + 1
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
 * Формирует варианты ответа и состояние для выбранного слова.
 * @param word Слово, которое нужно показать пользователю.
 */
const setupQuestionForWord = (word: Word): void => {
  const listForMode = getActiveList()
  const others = listForMode.filter((w) => w !== word)
  const distractors = shuffle(others)
    .slice(0, Math.min(3, others.length))
    .map((w) => w.translation)
  const allOptions = mode.value === 'test' ? shuffle([...distractors, word.translation]) : []

  current.value = word
  options.value = allOptions
  selected.value = null
  isCorrect.value = null

  if (mode.value === 'write') {
    userAnswer.value = ''
  }
}

/**
 * Перемешивает активный список и показывает первое слово.
 */
const generateQuestion = (): void => {
  const listForMode = getActiveList()

  if (!listForMode.length) {
    current.value = null
    options.value = []
    selected.value = null
    isCorrect.value = null
    order.value = []
    return
  }

  order.value = shuffle([...listForMode])
  currentIndex.value = 0

  const word = order.value[currentIndex.value]!
  setupQuestionForWord(word)
}

/**
 * Переходит к следующему слову, учитывая цикличную навигацию.
 */
const next = (): void => {
  if (!order.value.length) return

  currentIndex.value = (currentIndex.value + 1) % order.value.length
  setupQuestionForWord(order.value[currentIndex.value]!)
}

/**
 * Возвращает предыдущее показанное слово с учетом цикличной навигации.
 */
const prev = (): void => {
  if (!order.value.length) return

  currentIndex.value = (currentIndex.value - 1 + order.value.length) % order.value.length
  setupQuestionForWord(order.value[currentIndex.value]!)
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
      next()
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
 * Обрабатывает нажатия клавиш для навигации и выбора ответов.
 * @param e Событие клавиатуры.
 */
const handleKeydown = (e: KeyboardEvent): void => {
  activeKey.value = e.key
  setTimeout(() => {
    activeKey.value = null
  }, 100)
  const target = e.target as HTMLElement | null
  const isTextInput =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    Boolean(target?.isContentEditable)

  if (mode.value === 'test' && ['1', '2', '3', '4'].includes(e.key)) {
    e.preventDefault()
    handleDigitSelection(e.key)
    return
  }

  if (e.key === 'ArrowLeft' && !isTextInput) {
    e.preventDefault()
    prev()
    return
  }

  if (e.key === 'ArrowRight' && !isTextInput) {
    e.preventDefault()
    next()
    return
  }

  if (e.key === ' ' && !isTextInput) {
    e.preventDefault()
    toggleLike()
    return
  }

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
 * Обрабатывает выбор варианта ответа при нажатии цифровых клавиш.
 * @param keyPressed Нажатая пользователем клавиша (1–4).
 */
const handleDigitSelection = (keyPressed: string): void => {
  if (mode.value !== 'test') return

  const index = Number(keyPressed) - 1
  const option = options.value[index]

  if (!option) return

  check(option)
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
  persistFavorites()

  if (useFavorites.value) {
    generateQuestion()
  }
}

/**
 * Удаляет текущее слово из избранного.
 */
const removeLike = (): void => {
  if (!current.value) return

  favorites.value = favorites.value.filter((word) => word.word !== current.value?.word)
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
 * Переключает статус избранного для текущего слова.
 */
const toggleLike = (): void => {
  if (!current.value) return

  if (isCurrentLiked.value) {
    removeLike()
  } else {
    likeCurrentWord()
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

<style scoped lang="sass">
.keyboard
  position: absolute
  bottom: 10px
  width: 100vw
  padding: 0 40px
  flex-wrap: wrap
  align-items: center
  justify-content: center
  display: flex
  gap: 10px
  &_key
    display: flex
    align-items: center
    gap: 4px
  &_value
    transition: all 0.3s ease
    display: flex
    place-content: center
    place-items: center
    height: 30px
    min-height: 30px
    min-width: 30px
    padding: 0 10px
    border-radius: 10px
    background: var(--c1)
    border: 1px solid var(--c3)
    border-bottom: 4px solid var(--c3)

  &_hint, &_value
    color: var(--c4)
    font-size: 12px

  &_highlight
    color: var(--accent)
    border-color: var(--accent)
</style>
