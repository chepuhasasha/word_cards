<template lang="pug">
.keyboard
  .keyboard__key
    .keyboard__value(:class="getValueClass('1')") 1
    .keyboard__value(:class="getValueClass('2')") 2
    .keyboard__value(:class="getValueClass('3')") 3
    .keyboard__value(:class="getValueClass('4')") 4
    .keyboard__hint выбрать ответ (в тесте)
  .keyboard__key
    .keyboard__value(:class="getValueClass('ArrowLeft')") ←
    .keyboard__value(:class="getValueClass('ArrowRight')") →
    .keyboard__hint навигация по словам
  .keyboard__key
    .keyboard__value(:class="getValueClass(' ')") Space
    .keyboard__hint лайк
  .keyboard__key
    .keyboard__value(:class="getValueClass('Enter')") Enter
    .keyboard__hint подтвердить или перейти
</template>

<script setup lang="ts">
const props = defineProps<{ activeKey: string | null }>()

/**
 * Возвращает объект классов для подсветки выбранной клавиши.
 * @param keyCode Код клавиши, подсветка которой требуется.
 */
const getValueClass = (keyCode: string): Record<string, boolean> => ({
  'keyboard__value--highlight': props.activeKey === keyCode,
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.keyboard {
  @include mixins.flex-center(10px, row, wrap);

  &__key {
    @include mixins.flex-center(4px);
  }

  &__value {
    @include mixins.capsule(0 10px);

    transition: all 0.3s ease;
    border: 1px solid var(--c3);
    border-bottom: 4px solid var(--c3);
    background: var(--c1);
    min-width: 30px;
    height: 30px;
    min-height: 30px;

    &--highlight {
      border-color: var(--accent);
      color: var(--accent);
    }
  }

  &__hint,
  &__value {
    @include mixins.text(12px, var(--c4));
  }
}
</style>
