<template lang="pug">
.audio(v-if="audioSrc")
  button(v-if="audioSrc !== 'error'" @click="togglePlayback" :class="{ audio__play: isPlaying }")
    svg(width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg")
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

const props = defineProps<{ audioSrc: string; transcription: string; autoplay?: boolean }>()

const isPlaying = ref(false)
const audioElement = ref<HTMLAudioElement | null>(null)

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
}

/**
 * Запускает или приостанавливает воспроизведение аудио.
 */
const togglePlayback = (): void => {
  if (!props.audioSrc || props.audioSrc === 'error') return

  if (!audioElement.value) {
    audioElement.value = new Audio(props.audioSrc)
    audioElement.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }

  if (audioElement.value.src !== props.audioSrc) {
    audioElement.value.src = props.audioSrc
  }

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
    return
  }

  audioElement.value
    .play()
    .then(() => {
      isPlaying.value = true
    })
    .catch(() => {
      isPlaying.value = false
    })
}

watch(
  () => props.audioSrc,
  (next) => {
    if (!next || next === 'error') {
      cleanupAudio()
      return
    }

    if (!audioElement.value) {
      audioElement.value = new Audio(next)
      audioElement.value.addEventListener('ended', () => {
        isPlaying.value = false
      })
    } else {
      audioElement.value.pause()
      audioElement.value.currentTime = 0
    }

    audioElement.value.src = next

    if (props.autoplay !== false) {
      audioElement.value
        .play()
        .then(() => {
          isPlaying.value = true
        })
        .catch(() => {
          isPlaying.value = false
        })
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

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.audio {
  @include mixins.stack(10px);

  place-items: center;

  &__play {
    outline: 2px solid var(--accent);

    path {
      stroke: var(--accent);
    }
  }

  span {
    @include mixins.text(12px, var(--c4));
  }

  button {
    @include mixins.button-reset;
    @include mixins.control-surface;
    @include mixins.focus-ring(var(--accent));

    color: var(--c4);
    max-width: 80px;

    &:hover {
      background: var(--accent);
      color: var(--c1);

      path {
        stroke: var(--c1);
      }
    }
  }
}
</style>
