<template lang="pug">
template(v-if="!current")
  .open(@click='open')
    button
      svg(width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M9 15L12 18M12 18L15 15M12 18L12 12M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z"
        stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
    span Загрузите словарь
template(v-else)
  .bar
    button(:class='{bar__active: mode === "test"}' @click='mode = "test"')
      svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

    button(:class='{bar__active: mode === "learn"}' @click='mode = "learn"')
      svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M17 14.5001V11.4945C17 11.315 17 11.2253 16.9727 11.146C16.9485 11.076 16.9091 11.0122 16.8572 10.9592C16.7986 10.8993 16.7183 10.8592 16.5578 10.779L12 8.50006M4 9.50006V16.3067C4 16.6786 4 16.8645 4.05802 17.0274C4.10931 17.1713 4.1929 17.3016 4.30238 17.4082C4.42622 17.5287 4.59527 17.6062 4.93335 17.7612L11.3334 20.6945C11.5786 20.8069 11.7012 20.8631 11.8289 20.8853C11.9421 20.9049 12.0579 20.9049 12.1711 20.8853C12.2988 20.8631 12.4214 20.8069 12.6666 20.6945L19.0666 17.7612C19.4047 17.6062 19.5738 17.5287 19.6976 17.4082C19.8071 17.3016 19.8907 17.1713 19.942 17.0274C20 16.8645 20 16.6786 20 16.3067V9.50006M2 8.50006L11.6422 3.67895C11.7734 3.61336 11.839 3.58056 11.9078 3.56766C11.9687 3.55622 12.0313 3.55622 12.0922 3.56766C12.161 3.58056 12.2266 3.61336 12.3578 3.67895L22 8.50006L12.3578 13.3212C12.2266 13.3868 12.161 13.4196 12.0922 13.4325C12.0313 13.4439 11.9687 13.4439 11.9078 13.4325C11.839 13.4196 11.7734 13.3868 11.6422 13.3212L2 8.50006Z"
          stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

    button(:class='{bar__active: mode === "write"}' @click='mode = "write"')
      svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M18 2L22 6M2 22L3.2764 17.3199C3.35968 17.0145 3.40131 16.8619 3.46523 16.7195C3.52199 16.5931 3.59172 16.4729 3.67332 16.3609C3.76521 16.2348 3.87711 16.1229 4.1009 15.8991L14.4343 5.56569C14.6323 5.36768 14.7313 5.26867 14.8455 5.23158C14.9459 5.19895 15.0541 5.19895 15.1545 5.23158C15.2687 5.26867 15.3677 5.36768 15.5657 5.56569L18.4343 8.43431C18.6323 8.63232 18.7313 8.73133 18.7684 8.84549C18.8011 8.94591 18.8011 9.05409 18.7684 9.15451C18.7313 9.26867 18.6323 9.36768 18.4343 9.56569L8.1009 19.8991C7.87711 20.1229 7.76521 20.2348 7.63908 20.3267C7.52709 20.4083 7.40692 20.478 7.28052 20.5348C7.13815 20.5987 6.98548 20.6403 6.68014 20.7236L2 22Z"
          stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

    button(@click='open')
      svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M9 15L12 18M12 18L15 15M12 18L12 12M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z"
        stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

  //- СЧЁТЧИК НАД СЛОВОМ
  .counter(v-if="totalCount && current")
    span {{ passedCount }} / {{ totalCount }}

  .word-wrapper
    transition(name="word")
      .word(:key="current.word + '-' + mode") {{ mode === 'write' ? current.translation : current.word }}

  .audio(v-if="mode !== 'write'")
    button(v-if='current.audio && current.audio != "error"' @click='play(current.audio)' :class='{audio__play:isPlaying}')
      svg(width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg")
        path(d="M14.2451 4.79289C15.036 5.92672 15.4998 7.30566 15.4998 8.79286C15.4998 10.2802 15.036 11.6591 14.2451 12.7929M8.1343 1.15857L4.96863 4.32426C4.79568 4.49721 4.7092 4.58369 4.60828 4.64553C4.51881 4.70036 4.42127 4.74076 4.31923 4.76526C4.20414 4.79289 4.08185 4.79289 3.83726 4.79289H2.1C1.53995 4.79289 1.25992 4.79289 1.04601 4.90188C0.85785 4.99775 0.70487 5.15073 0.60899 5.3389C0.5 5.55281 0.5 5.83283 0.5 6.39289V11.1929C0.5 11.753 0.5 12.033 0.60899 12.2469C0.70487 12.4351 0.85785 12.5881 1.04601 12.6839C1.25992 12.7929 1.53995 12.7929 2.1 12.7929H3.83726C4.08185 12.7929 4.20414 12.7929 4.31923 12.8206C4.42127 12.8451 4.51881 12.8855 4.60828 12.9403C4.7092 13.0021 4.79568 13.0886 4.96863 13.2616L8.1343 16.4272C8.5627 16.8556 8.7769 17.0698 8.9608 17.0843C9.1203 17.0968 9.2763 17.0322 9.3802 16.9105C9.5 16.7703 9.5 16.4674 9.5 15.8616V1.72426C9.5 1.11844 9.5 0.815534 9.3802 0.675274C9.2763 0.553574 9.1203 0.488985 8.9608 0.501545C8.7769 0.516015 8.5627 0.730205 8.1343 1.15857Z"
          stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
    span {{ current.transcription }}

  .answer
    template(v-if="mode === 'test'")
      button(
        v-for="option in options"
        :key="option"
        @click="check(option)"
        :class="{ok: selected === option && isCorrect === true, error: selected === option && isCorrect === false}"
      ) {{ option }}

    template(v-else-if="mode === 'learn'")
      .answer__text {{ current.translation }}

    template(v-else)
      input(
        v-model="userAnswer"
        @keyup.enter="checkWrite"
        :class="{ok: isCorrect === true, error: isCorrect === false}"
        placeholder="Напишите слово по-корейски"
      )

input(
  type="file"
  ref="fileInput"
  accept="application/json"
  @change="onFileChange"
  style="display: none"
)
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, computed } from 'vue'

export interface Word {
  word: string
  translation: string
  transcription: string
  audio: string
  rating?: number
}

const mode = ref<'test' | 'learn' | 'write'>('test')

const list = ref<Word[]>([])

const current = ref<Word | null>(null)
const options = ref<string[]>([])
const selected = ref<string | null>(null)
const isCorrect = ref<boolean | null>(null)
const userAnswer = ref('')
const remaining = ref<Word[]>([])

const fileInput = ref<HTMLInputElement | null>(null)

// всего слов
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const totalCount = computed(() => list.value.length)

// сколько уже показано в текущем круге
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const passedCount = computed(() => {
  if (!list.value.length || !current.value) return 0
  return list.value.length - remaining.value.length
})

const shuffle = <T,>(arr: T[]): T[] => {
  return [...arr].sort(() => Math.random() - 0.5)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const open = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!Array.isArray(data)) {
      throw new Error('Invalid format')
    }

    const parsed: Word[] = data
      .filter(
        (item) =>
          item &&
          typeof item.word === 'string' &&
          typeof item.translation === 'string' &&
          typeof item.audio === 'string',
      )
      .map((item) => ({
        word: String(item.word),
        translation: String(item.translation),
        transcription: item.transcription ? String(item.transcription) : '',
        audio: String(item.audio),
        rating:
          typeof item.rating === 'number'
            ? item.rating
            : item.rating != null
              ? Number(item.rating)
              : undefined,
      }))

    if (!parsed.length) {
      throw new Error('Empty list')
    }

    list.value = parsed
    current.value = null
    isCorrect.value = null
    userAnswer.value = ''
    options.value = []

    remaining.value = shuffle([...list.value])

    generateQuestion()
  } catch (err) {
    console.error(err)
    alert('Ошибка при чтении файла словаря. Проверьте формат JSON.')
  } finally {
    target.value = ''
  }
}

const isPlaying = ref(false)
const audio = ref<HTMLAudioElement | null>(null)

const play = (src: string) => {
  if (!audio.value) {
    audio.value = new Audio(src)
    audio.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }

  if (audio.value.src !== src) {
    audio.value.src = src
  }

  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  } else {
    audio.value
      .play()
      .then(() => {
        isPlaying.value = true
      })
      .catch(() => {
        // ignore
      })
  }
}

const generateQuestion = () => {
  if (!list.value.length) return

  if (!remaining.value.length) {
    remaining.value = shuffle([...list.value])
  }

  const word = remaining.value.pop()
  if (!word) return

  current.value = word

  const others = list.value.filter((w) => w !== word)
  const distractors = shuffle(others)
    .slice(0, Math.min(3, others.length))
    .map((w) => w.translation)
  const allOptions = shuffle([...distractors, word.translation])

  options.value = allOptions
  selected.value = null
  isCorrect.value = null

  if (mode.value !== 'write') {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
      isPlaying.value = false
    }
    play(current.value.audio)
  }
}

const next = () => {
  if (mode.value === 'write') {
    userAnswer.value = ''
  }
  generateQuestion()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const check = (answer: string) => {
  if (mode.value !== 'test') return
  if (!current.value) return

  selected.value = answer
  isCorrect.value = answer === current.value.translation

  if (isCorrect.value) {
    setTimeout(() => {
      generateQuestion()
    }, 300)
  }
}

const normalize = (s: string) => s.trim().toLowerCase()

const checkWrite = () => {
  if (mode.value !== 'write') return
  if (!current.value) return

  const correct = normalize(userAnswer.value) === normalize(current.value.word)
  isCorrect.value = correct

  if (correct) {
    setTimeout(() => {
      next()
    }, 300)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return

  if (mode.value === 'learn') {
    e.preventDefault()
    next()
  } else if (mode.value === 'write') {
    e.preventDefault()
    checkWrite()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  generateQuestion()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (audio.value) {
    audio.value.pause()
    audio.value = null
  }
})
</script>

<style lang="sass">
#app
  background: var(--c1)
  height: 100vh
  width: 100vw

  display: flex
  flex-direction: column
  place-items: center
  place-content: center
  gap: 40px

button
  cursor: pointer
  border: none
  transition: transform 0.3s ease, background 0.3s ease, color 0.3s ease
  &::active
    transform: scale(0.7)
  &:hover
    transform: scale(0.95)
  &:focus-visible
    outline: 2px solid var(--accent)

.ok
  color: var(--ok) !important
  outline: 2px solid var(--ok)
.error
  color: var(--error) !important
  outline: 2px solid var(--error)

.open
  display: flex
  flex-direction: column
  gap: 20px
  button
    background: none
    &:hover
      path
        stroke: var(--accent)
  span
    font-size: 12px
    color: var(--c4)

.bar
  display: flex
  gap: 10px
  &__active
    path
      stroke: var(--accent)
  button
    color: var(--c4)
    background: var(--c1)

    display: flex
    align-items: center
    justify-content: space-around
    min-height: 80px
    min-width: 80px
    height: 80px
    border-radius: 20px
    &:hover
      outline: 2px solid var(--accent)
      path
        stroke: var(--accent)
.counter
  font-size: 14px
  color: var(--c4)
  text-align: center
  margin-bottom: 8px

.word
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  font-size: 100px
  font-weight: 500
  text-align: center
  &-wrapper
    position: relative
    width: 100vw
    height: 120px
    display: flex
    align-items: center
    justify-content: center

  &-enter-active, &-leave-active
    transition: opacity 0.5s ease, transform 0.5s ease
  &-enter-from, &-leave-to
    opacity: 0
  &-enter-to, &-leave-from
    opacity: 1
  &-enter-from
    transform: translateY(100px)
  &-enter-to
    transform: translateY(0)
  &-leave-to
    transform: translateY(-100px)
  &-leave-from
    transform: translateY(-100)

.audio
  &__play
    outline: 2px solid var(--accent)
    path
      stroke: var(--accent)

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
    height: 80px
    border-radius: 20px

    &:hover
      background: var(--accent)
      color: var(--c1)
      path
        stroke: var(--c1)

.answer
  display: flex
  gap: 20px
  place-content: center
  place-items: center
  flex-wrap: wrap
  width: 100vw
  padding: 0 10vw

  button
    text-align: center
    padding: 0 10px
    padding-bottom: 6px
    border-radius: 10px
    font-size: 40px
    width: max-content
    background: none
    color: var(--c5)
    &:hover
      color: var(--accent)
    &:focus-visible
      color: var(--accent)

  input
    font-size: 50px
    text-align: center
    background: none
    border: none
    border-bottom: 2px solid var(--c2)
    color: var(--c5)
    outline: none
    &::placeholder
      font-size: 12px
      color: var(--c3)
    &:focus-visible
      border-color: var(--accent)

  &__text
    font-size: 40px
    color: var(--c5)
</style>
