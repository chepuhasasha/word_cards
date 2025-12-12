<template lang="pug">
main
  UploadPrompt(v-if="!current" @open="open")
  template(v-else)
    ModeBar(
      :mode="mode"
      :use-favorites="useFavorites"
      :has-favorites="hasFavorites"
      @update:mode="updateMode"
      @toggle:favorites="toggleFavorites"
      @open="open"
    )
    WordCounter(
      :passed="passedCount"
      :total="totalCount"
      :current="Boolean(current)"
      :liked="isCurrentLiked"
      @prev="prev"
      @next="next"
      @remove-like="removeLike"
      @like="likeCurrentWord"
    )
    WordDisplay(:word="displayedWord" :word-key="wordKey" :help="helpText")
    AudioPlayer(
      v-if="mode !== 'write' && current?.audio"
      :audio-src="current?.audio || ''"
      :transcription="current?.transcription || ''"
      :autoplay="mode !== 'write'"
    )
    AnswerSection(
      :mode="mode"
      :options="options"
      :selected="selected"
      :is-correct="isCorrect"
      :translation="current?.translation || ''"
      :user-answer="userAnswer"
      @select="check"
      @submit-write="checkWrite"
      @update:userAnswer="updateUserAnswer"
    )
    KeyboardHints(:active-key="activeKey")
  input(type="file" ref="fileInput" accept="application/json" @change="onFileChange" style="display: none")
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import AnswerSection from '@/components/AnswerSection.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import KeyboardHints from '@/components/KeyboardHints.vue'
import ModeBar from '@/components/ModeBar.vue'
import UploadPrompt from '@/components/UploadPrompt.vue'
import WordCounter from '@/components/WordCounter.vue'
import WordDisplay from '@/components/WordDisplay.vue'
import { useDictionaryUpload } from '@/composables/useDictionaryUpload'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useWordsStore } from '@/stores/useWordsStore'

const wordStore = useWordsStore()

const {
  mode,
  useFavorites,
  current,
  options,
  selected,
  isCorrect,
  userAnswer,
  hasFavorites,
  totalCount,
  passedCount,
  displayedWord,
  wordKey,
  isCurrentLiked,
} = storeToRefs(wordStore)

const {
  next,
  prev,
  updateMode,
  toggleFavorites,
  removeLike,
  likeCurrentWord,
  check,
  checkWrite,
  updateUserAnswer,
} = wordStore

const { fileInput, open, onFileChange } = useDictionaryUpload(wordStore.setWords)
const { activeKey } = useKeyboardShortcuts({ store: wordStore })

const helpText = computed(() =>
  mode.value !== 'write' ? current.value?.translation || '' : current.value?.word || '',
)

onMounted(() => {
  wordStore.loadFavorites()
  wordStore.generateQuestion()
})
</script>
