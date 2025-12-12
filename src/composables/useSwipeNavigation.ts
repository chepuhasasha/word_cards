import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

interface SwipeHandlers {
  onSwipeLeft: () => void
  onSwipeRight: () => void
}

interface SwipeOptions {
  threshold?: number
}

const DEFAULT_THRESHOLD = 40

/**
 * Подключает обработку горизонтальных свайпов к переданному элементу.
 * Позволяет реагировать на свайпы влево и вправо с учётом порога смещения.
 * @param elementRef Ссылка на элемент, к которому нужно привязать обработчики.
 * @param handlers Колбэки, вызываемые при свайпе влево и вправо.
 * @param options Дополнительные настройки, такие как порог смещения.
 */
export const useSwipeNavigation = (
  elementRef: Ref<HTMLElement | null>,
  handlers: SwipeHandlers,
  options: SwipeOptions = {},
) => {
  const startX = ref(0)
  const startY = ref(0)
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  let attachedElement: HTMLElement | null = null

  /**
   * Запоминает координаты начала касания для последующего расчёта смещения.
   * @param event Событие начала касания.
   */
  const handleTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0]
    startX.value = touch!.clientX
    startY.value = touch!.clientY
  }

  /**
   * Определяет направление свайпа и вызывает соответствующий обработчик.
   * @param event Событие окончания касания.
   */
  const handleTouchEnd = (event: TouchEvent): void => {
    const touch = event.changedTouches[0]
    const deltaX = touch!.clientX - startX.value
    const deltaY = touch!.clientY - startY.value

    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return
    }

    if (deltaX < 0) {
      handlers.onSwipeLeft()
    } else {
      handlers.onSwipeRight()
    }
  }

  /**
   * Удаляет слушатели событий с текущего элемента.
   */
  const detachListeners = (): void => {
    if (!attachedElement) return

    attachedElement.removeEventListener('touchstart', handleTouchStart)
    attachedElement.removeEventListener('touchend', handleTouchEnd)
    attachedElement = null
  }

  /**
   * Добавляет слушатели событий к актуальному элементу из ссылки.
   * При смене элемента старые слушатели удаляются.
   * @param element Элемент, на который нужно навесить обработчики.
   */
  const attachListeners = (element: HTMLElement | null): void => {
    detachListeners()

    if (!element) return

    attachedElement = element
    attachedElement.addEventListener('touchstart', handleTouchStart)
    attachedElement.addEventListener('touchend', handleTouchEnd)
  }

  onMounted(() => {
    attachListeners(elementRef.value)
  })

  watch(elementRef, (element) => {
    attachListeners(element)
  })

  onBeforeUnmount(() => {
    detachListeners()
  })
}
