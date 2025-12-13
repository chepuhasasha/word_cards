<template lang="pug">
.answer
  template(v-if="mode === 'test'")
    button(
      v-for="option in options"
      :key="option"
      @click="() => selectOption(option)"
      :class="getOptionClass(option)"
    ) {{ option }}

  template(v-else-if="mode === 'learn'")
    .answer__text {{ translation }}

  template(v-else)
    input(
      :value="userAnswer"
      @input="onInput"
      @keyup.enter="submitWrite"
      :class="inputClass"
      placeholder="Напишите слово по-корейски"
    )
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const inputClass = computed(() => [
  'answer__input',
  {
    'answer__input--ok': props.isCorrect === true,
    'answer__input--error': props.isCorrect === false,
  },
])

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

/**
 * Возвращает список классов для опции ответа с учетом выбранного состояния.
 * @param option Значение отображаемой опции.
 */
const getOptionClass = (option: string): (string | Record<string, boolean>)[] => [
  'answer__option',
  {
    'answer__option--ok': props.selected === option && props.isCorrect === true,
    'answer__option--error': props.selected === option && props.isCorrect === false,
  },
]
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.answer {
  @include mixins.flex-center(10px, row, wrap);

  &__option {
    @include mixins.button-reset;
    @include mixins.text(20px);
    @include mixins.focus-ring(var(--accent));

    border-radius: 10px;
    padding: 0 10px 6px;
    width: max-content;
    text-align: center;

    &:hover {
      color: var(--accent);
    }

    &--ok {
      outline: 2px solid var(--ok);
      color: var(--ok);
    }

    &--error {
      outline: 2px solid var(--error);
      color: var(--error);
    }
  }

  &__input {
    @include mixins.text(50px);

    transition:
      border-color 0.3s ease,
      color 0.3s ease;
    outline: none;
    border: none;
    border-bottom: 2px solid var(--c2);
    background: none;
    text-align: center;

    &::placeholder {
      @include mixins.text(12px, var(--c3));
    }

    &:focus-visible {
      border-color: var(--accent);
    }

    &--ok {
      border-color: var(--ok);
      color: var(--ok);
    }

    &--error {
      border-color: var(--error);
      color: var(--error);
    }
  }

  &__text {
    @include mixins.text(20px);
  }
}
</style>
