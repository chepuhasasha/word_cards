<template lang="pug">
Teleport(to="body")
  Transition(name="fade")
    .selector-overlay(v-if="isOpen" @click.self="handleClose")
      .selector
        .selector__header
          h2.selector__title Выберите набор слов
          button.selector__close(type="button" @click="handleClose" aria-label="Закрыть окно выбора")
            span ×
        .selector__content
          ul.selector__list
            li.selector__item(v-for="set in sets" :key="set.id")
              button.selector__button(type="button" @click="handleSelect(set.id)")
                span.selector__label {{ set.label }}
                span.selector__size {{ set.size }} слов
</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import type { ComputedRef } from 'vue'

import type { EmbeddedSet } from '@/types/set'

const props = defineProps<{
  isOpen: boolean
  sets: ComputedRef<EmbeddedSet[]>
}>()

const { isOpen, sets } = toRefs(props)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', setId: string): void
}>()

/**
 * Закрывает окно выбора набора слов.
 */
const handleClose = (): void => {
  emit('close')
}

/**
 * Устанавливает выбранный пользователем сет.
 * @param setId Идентификатор выбранного набора.
 */
const handleSelect = (setId: string): void => {
  emit('select', setId)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.selector-overlay {
  display: grid;
  position: fixed;
  inset: 0;
  place-items: center;
  z-index: 1000;
  background: rgb(0 0 0 / 40%);
  padding: 20px;
}

.selector {
  display: grid;
  gap: 16px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 15%);
  background: var(--background);
  padding: 24px;
  width: min(480px, 100%);
}

.selector__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selector__title {
  margin: 0;
  color: var(--c1);
  font-size: 18px;
}

.selector__close {
  @include mixins.button-reset;

  border-radius: 50%;
  background: var(--c5);
  width: 32px;
  height: 32px;
  line-height: 1;
  color: var(--c1);
  font-size: 20px;

  &:hover {
    background: var(--c4);
  }
}

.selector__content {
  max-height: 360px;
  overflow: auto;
}

.selector__list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.selector__button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--c6);
  cursor: pointer;
  padding: 12px 14px;
  width: 100%;
  color: var(--c1);

  &:hover {
    border-color: var(--accent);
    background: var(--background);
  }
}

.selector__label {
  font-weight: 600;
}

.selector__size {
  color: var(--c4);
  font-size: 12px;
}
</style>
