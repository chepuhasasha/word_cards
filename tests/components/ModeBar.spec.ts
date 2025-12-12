import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ModeBar from '@/components/ModeBar.vue'

const baseProps = {
  mode: 'learn' as const,
  useFavorites: false,
  hasFavorites: true,
}

describe('ModeBar', () => {
  it('подсвечивает активный режим и не испускает событие при повторном выборе', async () => {
    const { emitted } = render(ModeBar, { props: baseProps })

    const learnButton = screen.getByLabelText('Режим: Учить')
    expect(learnButton.className).toContain('bar__button--active')

    await fireEvent.click(learnButton)
    expect(emitted()['update:mode']).toBeUndefined()
  })

  it('меняет режим и переключает избранное', async () => {
    const { emitted } = render(ModeBar, { props: baseProps })

    const testButton = screen.getByLabelText('Режим: Тест')
    await fireEvent.click(testButton)

    expect(emitted()['update:mode']?.[0]).toEqual(['test'])

    const favoritesButton = screen.getByLabelText('Переключить избранное')
    await fireEvent.click(favoritesButton)

    expect(emitted()['toggle:favorites']).toHaveLength(1)
    expect(favoritesButton.className).not.toContain('bar__button--active')
  })

  it('скрывает кнопку избранного, если нет избранных слов', () => {
    render(ModeBar, {
      props: {
        ...baseProps,
        hasFavorites: false,
      },
    })

    expect(screen.queryByLabelText('Переключить избранное')).toBeNull()
  })
})
