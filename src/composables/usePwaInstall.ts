import { onBeforeUnmount, onMounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

const isInstallPromptAvailable = ref(false)
const deferredPromptEvent = ref<BeforeInstallPromptEvent | null>(null)

/**
 * Подготавливает обработчики для показа системного запроса установки PWA.
 */
export const usePwaInstall = () => {
  /**
   * Обрабатывает событие `beforeinstallprompt`, предотвращая стандартный показ баннера.
   * @param event Браузерное событие с возможностью отложить показ запроса установки.
   */
  const handleBeforeInstallPrompt = (event: Event): void => {
    const installEvent = event as BeforeInstallPromptEvent
    event.preventDefault()
    deferredPromptEvent.value = installEvent
    isInstallPromptAvailable.value = true
  }

  /**
   * Сбрасывает сохраненный запрос после успешной установки приложения.
   */
  const handleInstalled = (): void => {
    deferredPromptEvent.value = null
    isInstallPromptAvailable.value = false
  }

  /**
   * Отображает системное окно установки PWA, если оно доступно.
   */
  const promptInstall = async (): Promise<void> => {
    if (!deferredPromptEvent.value) return

    await deferredPromptEvent.value.prompt()
    await deferredPromptEvent.value.userChoice

    deferredPromptEvent.value = null
    isInstallPromptAvailable.value = false
  }

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleInstalled)
  })

  return {
    canInstallPwa: isInstallPromptAvailable,
    promptInstall,
  }
}
