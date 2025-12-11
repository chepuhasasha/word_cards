<template lang="pug">
.answer
  template(v-if="mode === 'test'")
    button(
      v-for="option in options"
      :key="option"
      @click="() => selectOption(option)"
      :class="{ ok: selected === option && isCorrect === true, error: selected === option && isCorrect === false }"
    ) {{ option }}

  template(v-else-if="mode === 'learn'")
    .answer__text {{ translation }}

  template(v-else)
    input(
      :value="userAnswer"
      @input="onInput"
      @keyup.enter="submitWrite"
      :class="{ ok: isCorrect === true, error: isCorrect === false }"
      placeholder="Напишите слово по-корейски"
    )
</template>

<script setup lang="ts">
const props = defineProps<{
  mode: 'test' | 'learn' | 'write'
  options: string[]
  selected: string | null
  isCorrect: boolean | null
  translation: string
  userAnswer: string
}>()

const emit = defineEmits<{
  (e: 'select', option: string): void
  (e: 'submit-write'): void
  (e: 'update:userAnswer', value: string): void
}>()

/**
 * Передает выбранный пользователем вариант ответа родительскому компоненту.
 * @param option Вариант перевода, который выбрал пользователь.
 */
const selectOption = (option: string): void => {
  emit('select', option)
}

/**
 * Сообщает о введенном тексте для режима "Напиши".
 * @param event Событие ввода, содержащее новое значение.
 */
const onInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  emit('update:userAnswer', target.value)
}

/**
 * Отправляет введенный ответ при нажатии Enter.
 */
const submitWrite = (): void => {
  if (props.mode === 'write') {
    emit('submit-write')
  }
}
</script>
