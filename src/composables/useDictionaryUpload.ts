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

      onApply(parsed)
    } catch (error) {
      console.error(error)
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
