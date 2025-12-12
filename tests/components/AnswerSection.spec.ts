import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import AnswerSection from '@/components/AnswerSection.vue'

const baseProps = {
  mode: 'test' as const,
  options: ['вариант 1', 'вариант 2'],
  selected: null,
  isCorrect: null,
  translation: 'перевод',
  userAnswer: '',
}

describe('AnswerSection', () => {
  it('рендерит кнопки в тестовом режиме и испускает событие выбора', async () => {
    const { emitted } = render(AnswerSection, { props: baseProps })

    const option = screen.getByText('вариант 1')
    await fireEvent.click(option)

    expect(option).toHaveClass('answer__option')
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(emitted().select?.[0]).toEqual(['вариант 1'])
  })

  it('добавляет состояние корректности выбранной опции', async () => {
    const { getAllByText } = render(AnswerSection, {
      props: {
        ...baseProps,
        selected: 'вариант 2',
        isCorrect: false,
      },
    })

    const options = getAllByText('вариант 2')
    const activeOption = options.find((item) => item.className.includes('answer__option--error'))

    expect(activeOption).toBeDefined()
  })

  it('отображает перевод и поле ввода в соответствующих режимах', async () => {
    const { rerender, emitted } = render(AnswerSection, {
      props: {
        ...baseProps,
        mode: 'learn',
      },
    })

    expect(screen.getByText('перевод')).toBeInTheDocument()

    await rerender({ ...baseProps, mode: 'write' })
    const input = screen.getByPlaceholderText('Напишите слово по-корейски') as HTMLInputElement

    await fireEvent.update(input, 'ответ')
    expect(emitted()['update:userAnswer']?.[0]).toEqual(['ответ'])

    await fireEvent.keyUp(input, { key: 'Enter' })
    expect(emitted()['submit-write']).toBeTruthy()
  })
})
