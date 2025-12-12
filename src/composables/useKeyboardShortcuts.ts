import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { useWordsStore } from '@/stores/useWordsStore'

interface UseKeyboardShortcutsOptions {
  store: ReturnType<typeof useWordsStore>
}

/**
 * Назначает горячие клавиши для теста и управляет визуальной подсветкой.
 * @param options Store с бизнес-логикой и состоянием карточек.
 */
export const useKeyboardShortcuts = ({ store }: UseKeyboardShortcutsOptions) => {
  const activeKey = ref<string | null>(null)
  const { mode } = storeToRefs(store)

  /**
   * Возвращает true, если пользователь набирает текст в поле ввода.
   * @param event Событие клавиатуры.
   */
  const isTextInput = (event: KeyboardEvent): boolean => {
    const target = event.target as HTMLElement | null
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      Boolean(target?.isContentEditable)
    )
  }

  /**
   * Обрабатывает нажатия клавиш для навигации и выбора ответов.
   * @param event Событие клавиатуры.
   */
  const handleKeydown = (event: KeyboardEvent): void => {
    activeKey.value = event.key
    setTimeout(() => {
      activeKey.value = null
    }, 100)

    if (mode.value === 'test' && ['1', '2', '3', '4'].includes(event.key)) {
      event.preventDefault()
      store.handleDigitSelection(event.key)
      return
    }

    if (event.key === 'ArrowLeft' && !isTextInput(event)) {
      event.preventDefault()
      store.prev()
      return
    }

    if (event.key === 'ArrowRight' && !isTextInput(event)) {
      event.preventDefault()
      store.next()
      return
    }

    if (event.key === ' ' && !isTextInput(event)) {
      event.preventDefault()
      store.toggleLike()
      return
    }

    if (isTextInput(event) && mode.value === 'write' && event.key === 'Enter') {
      return
    }

    if (event.key !== 'Enter') return

    if (mode.value === 'learn') {
      event.preventDefault()
      store.next()
    } else if (mode.value === 'write') {
      event.preventDefault()
      store.checkWrite()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    activeKey,
  }
}
