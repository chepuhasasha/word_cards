import { onBeforeUnmount, onMounted, ref } from 'vue'

const DESKTOP_MEDIA_QUERY = '(hover: hover) and (pointer: fine)'

/**
 * Отслеживает, является ли текущее устройство десктопом по медиавыражению.
 * Возвращает реактивный флаг `isDesktop`.
 */
export const useDeviceType = () => {
  const isDesktop = ref(true)
  let mediaQueryList: MediaQueryList | null = null

  /**
   * Обновляет значение `isDesktop` в соответствии с текущим медиавыражением.
   */
  const updateIsDesktop = (): void => {
    mediaQueryList ??= window.matchMedia(DESKTOP_MEDIA_QUERY)
    isDesktop.value = mediaQueryList.matches
  }

  onMounted(() => {
    updateIsDesktop()
    mediaQueryList?.addEventListener('change', updateIsDesktop)
  })

  onBeforeUnmount(() => {
    mediaQueryList?.removeEventListener('change', updateIsDesktop)
  })

  return { isDesktop }
}
