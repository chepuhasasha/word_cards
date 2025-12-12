import { describe, expect, it, vi } from 'vitest'

import { useDictionaryUpload } from '@/composables/useDictionaryUpload'
import type { Word } from '@/types/word'

/**
 * Создает JSON-файл со словами для имитации загрузки.
 * @param words Список слов для сериализации.
 * @returns Экземпляр файла с заданным содержимым.
 */
const createDictionaryFile = (words: Word[]): File =>
  ({
    name: 'dictionary.json',
    type: 'application/json',
    text: vi.fn().mockResolvedValue(JSON.stringify(words)),
  }) as unknown as File

/**
 * Формирует событие изменения для указанного input с подменой target.
 * @param input Элемент input type="file" для передачи в обработчик.
 * @returns Событие change с установленной целью.
 */
const createChangeEvent = (input: HTMLInputElement): Event => {
  const event = new Event('change', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'target', {
    value: input,
    writable: false,
  })

  return event
}

describe('useDictionaryUpload', () => {
  it('открывает диалог выбора файла', () => {
    const applySpy = vi.fn()
    const { open, fileInput } = useDictionaryUpload(applySpy)
    const input = document.createElement('input')
    fileInput.value = input
    const clickSpy = vi.spyOn(input, 'click')

    open()

    expect(clickSpy).toHaveBeenCalled()
  })

  it('читает корректный JSON и отправляет данные в стор', async () => {
    const applySpy = vi.fn()
    const { onFileChange } = useDictionaryUpload(applySpy)
    const file = createDictionaryFile([
      {
        word: '책',
        translation: 'Книга',
        transcription: 'chaek',
        audio: 'audio.mp3',
        description: 'Описание',
      },
    ])
    const input = document.createElement('input')

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })

    await onFileChange(createChangeEvent(input))

    expect(applySpy).toHaveBeenCalledTimes(1)
    expect((applySpy.mock.calls[0]?.[0] as Word[])[0]).toMatchObject({
      word: '책',
      translation: 'Книга',
    })
    expect(input.value).toBe('')
  })

  it('уведомляет об ошибке при некорректных данных', async () => {
    const applySpy = vi.fn()
    const { onFileChange } = useDictionaryUpload(applySpy)
    const file = createDictionaryFile([])
    ;(file.text as ReturnType<typeof vi.fn>).mockResolvedValue(JSON.stringify({ foo: 'bar' }))
    const input = document.createElement('input')

    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })

    await onFileChange(createChangeEvent(input))

    expect(window.alert).toHaveBeenCalled()
    expect(applySpy).not.toHaveBeenCalled()
    expect(input.value).toBe('')
  })
})
