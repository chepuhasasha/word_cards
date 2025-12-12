import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Word } from '@/types/word'

const FAVORITES_KEY = 'word-cards.favorites'

type StudyMode = 'test' | 'learn' | 'write'

/**
 * Хранит состояние словаря и управляет сценариями обучения.
 */
export const useWordsStore = defineStore('words', () => {
  const mode = ref<StudyMode>('learn')
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

  const hasFavorites = computed(() => favorites.value.length > 0)
  const totalCount = computed(() =>
    useFavorites.value ? favorites.value.length : list.value.length,
  )

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

  const isCurrentLiked = computed(() => {
    if (!current.value) return false
    return favorites.value.some((word) => word.word === current.value?.word)
  })

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
   * Перемешивает элементы переданного массива.
   * @param arr Массив, порядок элементов которого нужно случайно изменить.
   */
  const shuffle = <T>(arr: T[]): T[] => {
    return [...arr].sort(() => Math.random() - 0.5)
  }

  /**
   * Возвращает актуальный список слов в зависимости от выбранного источника.
   */
  const getActiveList = (): Word[] => {
    return useFavorites.value ? favorites.value : list.value
  }

  /**
   * Обновляет список слов и сбрасывает состояние.
   * @param words Новый список слов.
   */
  const setWords = (words: Word[]): void => {
    list.value = words
    useFavorites.value = false
    resetSession()
    generateQuestion()
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
   * @param value Строка, которую нужно привести к единому формату.
   */
  const normalize = (value: string): string => value.trim().toLowerCase()

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
  const updateMode = (nextMode: StudyMode): void => {
    mode.value = nextMode
    resetSession()
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
    resetSession()
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

  /**
   * Обновляет введенный пользователем ответ.
   * @param value Текст ответа.
   */
  const updateUserAnswer = (value: string): void => {
    userAnswer.value = value
  }

  /**
   * Выполняет полный сброс состояния с учетом выбранного режима.
   */
  const resetSession = (): void => {
    isCorrect.value = null
    userAnswer.value = ''
    selected.value = null

    if (mode.value !== 'test') {
      options.value = []
    }
  }

  return {
    mode,
    useFavorites,
    list,
    favorites,
    current,
    options,
    selected,
    isCorrect,
    userAnswer,
    order,
    currentIndex,
    hasFavorites,
    totalCount,
    passedCount,
    displayedWord,
    wordKey,
    isCurrentLiked,
    loadFavorites,
    setWords,
    generateQuestion,
    next,
    prev,
    check,
    checkWrite,
    handleDigitSelection,
    updateMode,
    likeCurrentWord,
    removeLike,
    toggleLike,
    setSource,
    toggleFavorites,
    resetAfterSourceChange,
    updateUserAnswer,
  }
})
