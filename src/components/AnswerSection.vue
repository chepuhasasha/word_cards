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

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.answer {
  @include mixins.flex-center(20px, row, wrap);

  width: 100vw;
  padding: 0 10vw;

  button {
    @include mixins.button-reset;
    @include mixins.text(40px);
    @include mixins.focus-ring(var(--accent));

    text-align: center;
    padding: 0 10px 6px;
    border-radius: 10px;
    width: max-content;

    &:hover {
      color: var(--accent);
    }
  }

  input {
    @include mixins.text(50px);

    text-align: center;
    background: none;
    border: none;
    border-bottom: 2px solid var(--c2);
    outline: none;
    transition:
      border-color 0.3s ease,
      color 0.3s ease;

    &::placeholder {
      @include mixins.text(12px, var(--c3));
    }

    &:focus-visible {
      border-color: var(--accent);
    }
  }

  &__text {
    @include mixins.text(40px);
  }
}
</style>
