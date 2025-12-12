<template lang="pug">
.keyboard
  .keyboard__key
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === '1' }") 1
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === '2' }") 2
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === '3' }") 3
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === '4' }") 4
    .keyboard__hint выбрать ответ (в тесте)
  .keyboard__key
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === 'ArrowLeft' }") ←
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === 'ArrowRight' }") →
    .keyboard__hint навигация по словам
  .keyboard__key
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === ' ' }") Space
    .keyboard__hint лайк
  .keyboard__key
    .keyboard__value(:class="{ 'keyboard__value--highlight': activeKey === 'Enter' }") Enter
    .keyboard__hint подтвердить или перейти
</template>

<script setup lang="ts">
const props = defineProps<{ activeKey: string | null }>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.keyboard {
  @include mixins.flex-center(10px, row, wrap);

  position: absolute;
  bottom: 10px;
  padding: 0 40px;
  width: 100vw;

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
