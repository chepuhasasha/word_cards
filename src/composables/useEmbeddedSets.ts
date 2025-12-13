import { computed, ref } from 'vue'

import type { EmbeddedSet } from '@/types/set'
import type { Word } from '@/types/word'
import type { useWordsStore } from '@/stores/useWordsStore'

type RawModule = { default: unknown }

const rawSets = import.meta.glob('../assets/sets/**/*.json', {
  eager: true,
}) as Record<string, RawModule>

/**
 * Формирует человекочитаемое название набора из пути к файлу.
 * @param path Путь к JSON-файлу сета.
 * @returns Название в формате «start-end» или исходное имя файла, если извлечь диапазон не удалось.
 */
const getLabelFromPath = (path: string): string => {
  const match = path.match(/_(\d+)_(\d+)\.json$/)

  if (!match) {
    const filename = path.split('/').pop() || path
    return filename.replace('.json', '')
  }

  const [, from, to] = match
  return `${from}-${to}`
}

/**
 * Преобразует необработанные данные из JSON в корректный список слов.
 * @param data Данные, считанные из JSON-файла.
 * @returns Массив слов или null, если структура некорректна.
 */
const normalizeDictionary = (data: unknown): Word[] | null => {
  if (!Array.isArray(data)) {
    return null
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

  return parsed.length ? parsed : null
}

/**
 * Формирует наборы слов из данных конкретного файла.
 * @param path Путь к JSON-файлу набора.
 * @param data Сырые данные, загруженные из файла.
 * @returns Список корректных сетов, извлеченных из файла.
 */
const extractSetsFromModule = (path: string, data: unknown): EmbeddedSet[] => {
  const normalized = normalizeDictionary(data)

  if (normalized) {
    return [
      {
        id: path,
        label: getLabelFromPath(path),
        words: normalized,
        size: normalized.length,
      },
    ]
  }

  if (!Array.isArray(data)) return []

  return data
    .map((item, index) => {
      if (!item || typeof item !== 'object' || !('words' in item)) return null

      const section = item as { title?: unknown; words?: unknown }
      const words = normalizeDictionary(section.words)

      if (!words) return null

      const label =
        typeof section.title === 'string' && section.title.trim().length
          ? section.title
          : `${getLabelFromPath(path)} #${index + 1}`

      return {
        id: `${path}#${index}`,
        label,
        words,
        size: words.length,
      }
    })
    .filter((value): value is EmbeddedSet => Boolean(value))
}

/**
 * Собирает список доступных встроенных сетов и их метаданные.
 * @returns Список валидных сетов с размерами и названиями.
 */
const collectSets = (): EmbeddedSet[] => {
  return Object.entries(rawSets)
    .flatMap(([path, module]) => extractSetsFromModule(path, module.default))
    .sort((a, b) => {
      const [aStart] = a.label.split('-')
      const [bStart] = b.label.split('-')

      const aNumber = Number(aStart)
      const bNumber = Number(bStart)

      if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
        return aNumber - bNumber
      }

      return a.label.localeCompare(b.label)
    })
}

/**
 * Управляет выбором встроенных сетов слов и применением их к стору.
 * @param onApply Метод стора, который принимает выбранный набор слов.
 */
export const useEmbeddedSets = (onApply: ReturnType<typeof useWordsStore>['setWords']) => {
  const isSelectorOpen = ref(true)
  const availableSets = computed<EmbeddedSet[]>(() => collectSets())

  /**
   * Открывает модальное окно с выбором сета.
   */
  const openSelector = (): void => {
    isSelectorOpen.value = true
  }

  /**
   * Закрывает модальное окно выбора сета.
   */
  const closeSelector = (): void => {
    isSelectorOpen.value = false
  }

  /**
   * Применяет выбранный сет и закрывает модалку.
   * @param setId Идентификатор выбранного сета (путь к файлу).
   */
  const selectSet = (setId: string): void => {
    const set = availableSets.value.find(({ id }) => id === setId)

    if (!set) return

    onApply(set.words)
    closeSelector()
  }

  return {
    availableSets,
    isSelectorOpen,
    openSelector,
    closeSelector,
    selectSet,
  }
}
