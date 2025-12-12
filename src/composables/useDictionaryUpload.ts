import { ref } from 'vue'

import type { Word } from '@/types/word'
import type { useWordsStore } from '@/stores/useWordsStore'

/**
 * Управляет загрузкой JSON-файла словаря через скрытый input.
 * @param onApply Стор, в который нужно сохранить разобранные данные.
 */
export const useDictionaryUpload = (onApply: ReturnType<typeof useWordsStore>['setWords']) => {
  const fileInput = ref<HTMLInputElement | null>(null)

  /**
   * Открывает системный диалог выбора файла словаря.
   */
  const open = (): void => {
    if (fileInput.value) {
      fileInput.value.click()
    }
  }

  /**
   * Проверяет структуру данных словаря и нормализует валидные записи.
   * @param data Данные, прочитанные из JSON-файла.
   * @returns Массив слов или null, если формат некорректен.
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
   * Разбирает выбранный пользователем JSON-файл и инициализирует словарь.
   * @param event Событие изменения значения input type="file".
   */
  const onFileChange = async (event: Event): Promise<void> => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const parsed = normalizeDictionary(data)

      if (!parsed) {
        alert('Ошибка при чтении файла словаря. Проверьте формат JSON.')
        return
      }

      onApply(parsed)
    } catch (error) {
      console.error('Не удалось обработать файл словаря', error)
      alert('Ошибка при чтении файла словаря. Проверьте формат JSON.')
    } finally {
      target.value = ''
    }
  }

  return {
    fileInput,
    open,
    onFileChange,
  }
}
