import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import WordDisplay from '@/components/WordDisplay.vue'

const baseProps = {
  word: {
    text: '안녕',
    description: 'Короткое приветствие',
  },
  wordKey: '안녕-learn',
  help: 'hello',
}

/**
 * Возвращает последний заголовок из списка, который отображается пользователю.
 * @param getAllHeadings Функция для выборки всех заголовков в компоненте.
 * @returns Заголовок, отражающий актуальное слово.
 */
const getLastHeading = (getAllHeadings: () => HTMLElement[]): HTMLElement => {
  const headings = getAllHeadings()
  return headings[headings.length - 1]!
}

describe('WordDisplay', () => {
  it('отображает слово и подсказку по клику', async () => {
    render(WordDisplay, { props: baseProps })

    const heading = screen.getByRole('heading')
    expect(heading.textContent).toContain('안녕')

    await fireEvent.click(heading)
    expect(heading.textContent).toContain('hello')
  })

  it('сбрасывает подсказку при смене слова', async () => {
    const { rerender, getAllByRole } = render(WordDisplay, { props: baseProps })
    const heading = getLastHeading(() => getAllByRole('heading'))

    await fireEvent.click(heading)
    expect(heading.textContent).toContain('hello')

    await rerender({
      ...baseProps,
      word: { text: '감사', description: 'Спасибо' },
      wordKey: '감사-learn',
    })

    expect(getLastHeading(() => getAllByRole('heading')).textContent).toContain('감사')
  })
})
