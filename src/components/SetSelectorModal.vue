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
  padding: 20px;
}

.selector {
  display: grid;
  gap: 16px;
  border: 1px solid var(--c2);
  border-radius: 40px;
  background: var(--c1);
  padding: 40px;
  width: min(480px, 100%);
}

.selector__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selector__title {
  margin: 0;
  color: var(--c4);
  font-size: 18px;
  font-weight: 300;
}

.selector__close {
  @include mixins.button-reset;

  border-radius: 50%;
  background: var(--c2);
  width: 32px;
  height: 32px;
  line-height: 1;
  color: var(--c4);
  font-size: 20px;

  &:hover {
    background: var(--accent);
    color: var(--c1);
  }
}

.selector__content {
  max-height: 360px;
  overflow: auto;
}

.selector__list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.selector__button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 10px;
  background: var(--c1);
  cursor: pointer;
  padding: 10px;
  width: 100%;
  color: var(--c5);

  &:hover {
    transform: none;
    background: var(--accent);
    color: var(--c1);

    span {
      color: var(--c1);
    }
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
