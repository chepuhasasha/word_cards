import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useWordsStore } from '@/stores/useWordsStore'
import type { Word } from '@/types/word'

const baseWords: Word[] = [
  {
    word: '안녕하세요',
    translation: 'Здравствуйте',
    transcription: 'annyeonghaseyo',
    audio: 'audio1.mp3',
    description: 'Приветствие',
  },
  {
    word: '사랑',
    translation: 'Любовь',
    transcription: 'sarang',
    audio: 'audio2.mp3',
    description: 'Чувство',
  },
]

/**
 * Создает стора слов с предсказуемым порядком слов.
 * @returns Инициализированный стор слов.
 */
const createStoreWithWords = () => {
  const store = useWordsStore()
  const randomMock = vi.spyOn(Math, 'random').mockReturnValue(0.5)
  store.setWords(baseWords)
  randomMock.mockRestore()
  return store
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useWordsStore', () => {
  it('инициализирует список слов и сбрасывает состояние', () => {
    const store = createStoreWithWords()

    expect(store.list).toHaveLength(baseWords.length)
    expect(store.useFavorites).toBe(false)
    expect(store.current).not.toBeNull()
    expect(store.options).toEqual([])
    expect(store.order).toHaveLength(baseWords.length)
  })

  it('переключает режимы и отображаемое слово', () => {
    const store = createStoreWithWords()

    store.updateMode('write')

    expect(store.displayedWord.text).toBe(store.current?.translation)
    expect(store.displayedWord.description).toBe(store.current?.description)

    store.updateMode('test')

    expect(store.displayedWord.text).toBe(store.current?.word)
    expect(store.displayedWord.description).toBe('')
  })

  it('проверяет варианты в режиме теста и переходит к следующему слову', async () => {
    const store = createStoreWithWords()

    store.updateMode('test')
    const startIndex = store.currentIndex
    const correctAnswer = store.current?.translation

    expect(correctAnswer).toBeDefined()

    store.check(correctAnswer!)

    expect(store.selected).toBe(correctAnswer)
    expect(store.isCorrect).toBe(true)

    await vi.runAllTimersAsync()

    expect(store.currentIndex).not.toBe(startIndex)
  })

  it('сравнивает ввод с нормализацией строки в режиме "Напиши"', () => {
    const store = createStoreWithWords()

    store.updateMode('write')
    store.updateUserAnswer(`  ${store.current?.word.toUpperCase()}  `)

    store.checkWrite()

    expect(store.isCorrect).toBe(true)

    vi.advanceTimersByTime(300)

    expect(store.currentIndex).toBe(1)
  })

  it('управляет избранными словами и источником данных', () => {
    const store = createStoreWithWords()

    store.toggleFavorites()
    expect(store.useFavorites).toBe(false)

    store.likeCurrentWord()
    expect(store.favorites).toHaveLength(1)

    store.toggleFavorites()
    expect(store.useFavorites).toBe(true)

    store.removeLike()
    expect(store.useFavorites).toBe(false)
  })
})
