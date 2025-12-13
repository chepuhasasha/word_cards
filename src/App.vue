<template lang="pug">
main
  UploadPrompt(v-if="!current" @open="openSelector")
  template(v-else)
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
    .card
      WordDisplay(
        :word="displayedWord"
        :word-key="wordKey"
        :help="helpText"
        @next="next"
        @prev="prev"
      )
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
    ModeBar(
      :mode="mode"
      :use-favorites="useFavorites"
      :has-favorites="hasFavorites"
      @update:mode="updateMode"
      @toggle:favorites="toggleFavorites"
      @open="openSelector"
    )
    KeyboardHints(v-if="isDesktop" :active-key="activeKey")
  SetSelectorModal(
    :is-open="isSelectorOpen"
    :sets="availableSets"
    @close="closeSelector"
    @select="selectSet"
  )
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
import SetSelectorModal from '@/components/SetSelectorModal.vue'
import { useEmbeddedSets } from '@/composables/useEmbeddedSets'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useDeviceType } from '@/composables/useDeviceType'
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

const { availableSets, isSelectorOpen, openSelector, closeSelector, selectSet } = useEmbeddedSets(
  wordStore.setWords,
)
const { activeKey } = useKeyboardShortcuts({ store: wordStore })
const { isDesktop } = useDeviceType()

const helpText = computed(() =>
  mode.value !== 'write' ? current.value?.translation || '' : current.value?.word || '',
)

onMounted(() => {
  wordStore.loadFavorites()
  wordStore.generateQuestion()
})
</script>
