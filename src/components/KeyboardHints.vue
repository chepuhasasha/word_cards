<template lang="pug">
.keyboard
  .keyboard_key
    .keyboard_value(:class="{ keyboard_highlight: activeKey === '1' }") 1
    .keyboard_value(:class="{ keyboard_highlight: activeKey === '2' }") 2
    .keyboard_value(:class="{ keyboard_highlight: activeKey === '3' }") 3
    .keyboard_value(:class="{ keyboard_highlight: activeKey === '4' }") 4
    .keyboard_hint выбрать ответ (в тесте)
  .keyboard_key
    .keyboard_value(:class="{ keyboard_highlight: activeKey === 'ArrowLeft' }") ←
    .keyboard_value(:class="{ keyboard_highlight: activeKey === 'ArrowRight' }") →
    .keyboard_hint навигация по словам
  .keyboard_key
    .keyboard_value(:class="{ keyboard_highlight: activeKey === ' ' }") Space
    .keyboard_hint лайк
  .keyboard_key
    .keyboard_value(:class="{ keyboard_highlight: activeKey === 'Enter' }") Enter
    .keyboard_hint подтвердить или перейти
</template>

<script setup lang="ts">
const props = defineProps<{ activeKey: string | null }>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.keyboard {
  position: absolute;
  bottom: 10px;
  width: 100vw;
  padding: 0 40px;
  @include mixins.flex-center(10px, row, wrap);

  &_key {
    @include mixins.flex-center(4px);
  }

  &_value {
    @include mixins.capsule(0 10px);

    transition: all 0.3s ease;
    height: 30px;
    min-height: 30px;
    min-width: 30px;
    background: var(--c1);
    border: 1px solid var(--c3);
    border-bottom: 4px solid var(--c3);
  }

  &_hint,
  &_value {
    @include mixins.text(12px, var(--c4));
  }

  &_highlight {
    color: var(--accent);
    border-color: var(--accent);
  }
}
</style>
