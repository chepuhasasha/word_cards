import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

interface StoreMock {
  mode: ReturnType<typeof ref<'test' | 'learn' | 'write'>>
  handleDigitSelection: ReturnType<typeof vi.fn>
  prev: ReturnType<typeof vi.fn>
  next: ReturnType<typeof vi.fn>
  toggleLike: ReturnType<typeof vi.fn>
  checkWrite: ReturnType<typeof vi.fn>
}

/**
 * Создает заглушку стора с указанным режимом.
 * @param mode Режим, который должен использоваться в тесте.
 * @returns Стор с реактивным mode и шпионскими методами.
 */
const createStore = (mode: 'test' | 'learn' | 'write'): StoreMock => ({
  mode: ref(mode),
  handleDigitSelection: vi.fn(),
  prev: vi.fn(),
  next: vi.fn(),
  toggleLike: vi.fn(),
  checkWrite: vi.fn(),
})

/**
 * Монтирует тестовый компонент для проверки работы composable.
 * @param store Исходный стор, используемый в composable.
 * @returns Объект с оберткой компонента и доступом к стору.
 */
const mountWithStore = (store: StoreMock) => {
  const wrapper = mount(
    defineComponent({
      setup() {
        const { activeKey } = useKeyboardShortcuts({ store })
        return () => h('div', { 'data-active': activeKey.value ?? '' })
      },
    }),
  )

  return { wrapper, store }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useKeyboardShortcuts', () => {
  it('обрабатывает цифровые клавиши в режиме теста', async () => {
    const { wrapper, store } = mountWithStore(createStore('test'))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(store.handleDigitSelection).toHaveBeenCalledWith('1')
    expect(wrapper.attributes()['data-active']).toBe('1')

    await vi.advanceTimersByTimeAsync(100)
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes()['data-active']).toBe('')
  })

  it('переходит между словами стрелками и переключает избранное', async () => {
    const { wrapper, store } = mountWithStore(createStore('learn'))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))

    await wrapper.vm.$nextTick()

    expect(store.prev).toHaveBeenCalled()
    expect(store.next).toHaveBeenCalled()
    expect(store.toggleLike).toHaveBeenCalled()
  })

  it('игнорирует стрелки при вводе текста', async () => {
    const { wrapper, store } = mountWithStore(createStore('learn'))
    const input = document.createElement('input')
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    Object.defineProperty(event, 'target', { value: input })

    window.dispatchEvent(event)

    await wrapper.vm.$nextTick()

    expect(store.next).not.toHaveBeenCalled()
  })

  it('выполняет действия по Enter в зависимости от режима', async () => {
    const learnContext = mountWithStore(createStore('learn'))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await learnContext.wrapper.vm.$nextTick()
    expect(learnContext.store.next).toHaveBeenCalled()

    const writeContext = mountWithStore(createStore('write'))
    const blurEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    Object.defineProperty(blurEvent, 'target', { value: document.body })

    window.dispatchEvent(blurEvent)
    await writeContext.wrapper.vm.$nextTick()

    expect(writeContext.store.checkWrite).toHaveBeenCalled()
  })
})
