<template lang="pug">
.audio(v-if="audioSrc")
  button(
    v-if="audioSrc !== 'error'"
    @click="togglePlayback"
    :class="{ audio__play: isPlaying }"
    :disabled="isLoading"
  )
    .audio__spinner(v-if="isLoading")
      span
    svg(
      v-else
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    )
      path(
        d="M14.2451 4.79289C15.036 5.92672 15.4998 7.30566 15.4998 8.79286C15.4998 10.2802 15.036 11.6591 14.2451 12.7929M8.1343 1.15857L4.96863 4.32426C4.79568 4.49721 4.7092 4.58369 4.60828 4.64553C4.51881 4.70036 4.42127 4.74076 4.31923 4.76526C4.20414 4.79289 4.08185 4.79289 3.83726 4.79289H2.1C1.53995 4.79289 1.25992 4.79289 1.04601 4.90188C0.85785 4.99775 0.70487 5.15073 0.60899 5.3389C0.5 5.55281 0.5 5.83283 0.5 6.39289V11.1929C0.5 11.753 0.5 12.033 0.60899 12.2469C0.70487 12.4351 0.85785 12.5881 1.04601 12.6839C1.25992 12.7929 1.53995 12.7929 2.1 12.7929H3.83726C4.08185 12.7929 4.20414 12.7929 4.31923 12.8206C4.42127 12.8451 4.51881 12.8855 4.60828 12.9403C4.7092 13.0021 4.79568 13.0886 4.96863 13.2616L8.1343 16.4272C8.5627 16.8556 8.7769 17.0698 8.9608 17.0843C9.1203 17.0968 9.2763 17.0322 9.3802 16.9105C9.5 16.7703 9.5 16.4674 9.5 15.8616V1.72426C9.5 1.11844 9.5 0.815534 9.3802 0.675274C9.2763 0.553574 9.1203 0.488985 8.9608 0.501545C8.7769 0.516015 8.5627 0.730205 8.1343 1.15857Z"
        stroke="var(--c4)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      )
  span {{ transcription }}
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const TTS_ENDPOINT = 'https://translate.google.com/translate_tts'
const TTS_LANG = 'ko'

const props = defineProps<{ audioSrc: string; transcription: string; autoplay?: boolean }>()

const isPlaying = ref(false)
const isLoading = ref(false)
const audioElement = ref<HTMLAudioElement | null>(null)
const currentAudioKey = ref<string | null>(null)
const audioCache = new Map<string, string>()

/**
 * Создает аудиоэлемент и вешает обработчики событий.
 */
const ensureAudioElement = (): void => {
  if (!audioElement.value) {
    audioElement.value = new Audio()
    audioElement.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
    audioElement.value.addEventListener('playing', () => {
      isPlaying.value = true
    })
    audioElement.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }
}

/**
 * Останавливает текущее воспроизведение и очищает ресурсы аудио.
 */
const cleanupAudio = (): void => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
    audioElement.value.load()
  }
  isPlaying.value = false
  currentAudioKey.value = null
}

/**
 * Убирает лишние пробелы и подготавливает текст к генерации TTS.
 * @param text Исходная строка.
 */
const normalizeText = (text: string): string => text.trim()

/**
 * Вычисляет длину строки в байтах для передачи параметра textlen.
 * @param text Строка для подсчета длины.
 */
const getTextByteLength = (text: string): number => new TextEncoder().encode(text).length

/**
 * Формирует URL для запроса озвучки через Google Translate TTS.
 * @param text Текст, который нужно озвучить.
 */
const buildTtsUrl = (text: string): string => {
  const normalized = normalizeText(text)

  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: normalized,
    tl: TTS_LANG,
    client: 'tw-ob',
    total: '1',
    idx: '0',
    textlen: String(getTextByteLength(normalized)),
  })

  return `${TTS_ENDPOINT}?${params.toString()}`
}

/**
 * Возвращает URL для озвучивания текста, кешируя сформированный адрес.
 * @param text Текст, который нужно озвучить.
 */
const getAudioUrl = async (text: string): Promise<string> => {
  const normalized = normalizeText(text)

  if (audioCache.has(normalized)) {
    return audioCache.get(normalized) as string
  }

  const ttsUrl = buildTtsUrl(normalized)
  audioCache.set(normalized, ttsUrl)
  return ttsUrl
}

/**
 * Ожидает полной загрузки источника аудио.
 * @param element Аудиоэлемент.
 */
const waitForCanPlay = (element: HTMLAudioElement): Promise<void> =>
  new Promise((resolve, reject) => {
    if (element.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      resolve()
      return
    }

    const cleanup = (): void => {
      element.removeEventListener('canplaythrough', onReady)
      element.removeEventListener('error', onError)
    }

    const onReady = (): void => {
      cleanup()
      resolve()
    }

    const onError = (): void => {
      cleanup()
      reject(new Error('Не удалось загрузить аудио'))
    }

    element.addEventListener('canplaythrough', onReady, { once: true })
    element.addEventListener('error', onError, { once: true })
  })

/**
 * Подготавливает аудиоэлемент к воспроизведению указанного текста.
 * @param text Текст, который необходимо озвучить.
 */
const prepareAudio = async (text: string): Promise<void> => {
  ensureAudioElement()

  const normalized = normalizeText(text)

  if (!normalized || !audioElement.value) return

  if (currentAudioKey.value === normalized && audioElement.value.src) {
    return
  }

  isLoading.value = true
  try {
    const source = await getAudioUrl(normalized)
    currentAudioKey.value = normalized
    audioElement.value.src = source
    audioElement.value.load()
    await waitForCanPlay(audioElement.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Запускает воспроизведение уже подготовленного аудио.
 */
const playPreparedAudio = async (): Promise<void> => {
  if (!audioElement.value) return

  try {
    await audioElement.value.play()
    isPlaying.value = true
  } catch (error) {
    console.error('Не удалось воспроизвести аудио', error)
    isPlaying.value = false
  }
}

/**
 * Запускает или приостанавливает воспроизведение аудио.
 */
const togglePlayback = async (): Promise<void> => {
  if (!props.audioSrc || props.audioSrc === 'error' || isLoading.value) return

  ensureAudioElement()

  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
    return
  }

  try {
    await prepareAudio(props.audioSrc)
    await playPreparedAudio()
  } catch (error) {
    console.error('Не удалось подготовить или воспроизвести аудио', error)
  }
}

watch(
  () => props.audioSrc,
  async (next) => {
    if (!next || next === 'error') {
      cleanupAudio()
      return
    }

    isPlaying.value = false
    try {
      await prepareAudio(next)

      if (props.autoplay !== false) {
        await playPreparedAudio()
      }
    } catch (error) {
      console.error('Не удалось загрузить аудио', error)
    }
  },
  { immediate: true },
)

watch(
  () => props.autoplay,
  (autoplay) => {
    if (autoplay === false && isPlaying.value && audioElement.value) {
      audioElement.value.pause()
      isPlaying.value = false
    }
  },
)

onBeforeUnmount(() => {
  cleanupAudio()
  if (audioElement.value) {
    audioElement.value = null
  }
})
</script>

<style scoped lang="sass">
.audio
  display: flex
  flex-direction: column
  gap: 10px
  place-items: center
  &__play
    outline: 2px solid var(--accent)

    path
      stroke: var(--accent)

  &__spinner
    width: 32px
    height: 32px
    border-radius: 50%
    border: 3px solid var(--c4)
    border-top-color: transparent
    animation: audio-spin 1s linear infinite

  span
    color: var(--c4)
    font-size: 12px

  button
    color: var(--c4)
    background: var(--c2)
    display: flex
    align-items: center
    justify-content: space-around
    min-height: 80px
    min-width: 80px
    max-width: 80px
    height: 80px
    border-radius: 20px
    transition: background 0.3s ease, color 0.3s ease, opacity 0.3s ease

    &:disabled
      opacity: 0.7
      cursor: wait

    &:hover
      background: var(--accent)
      color: var(--c1)

      path
        stroke: var(--c1)

@keyframes audio-spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)
</style>
