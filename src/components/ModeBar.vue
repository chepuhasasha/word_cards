<template lang="pug">
.bar
  button(
    :class="getModeClass('learn')"
    aria-label="Режим: Учить"
    @click="() => changeMode('learn')"
  )
    svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M17 14.5001V11.4945C17 11.315 17 11.2253 16.9727 11.146C16.9485 11.076 16.9091 11.0122 16.8572 10.9592C16.7986 10.8993 16.7183 10.8592 16.5578 10.779L12 8.50006M4 9.50006V16.3067C4 16.6786 4 16.8645 4.05802 17.0274C4.10931 17.1713 4.1929 17.30016 4.30238 17.4082C4.42622 17.5287 4.59527 17.6062 4.93335 17.7612L11.3334 20.6945C11.5786 20.8069 11.7012 20.8631 11.8289 20.8853C11.9421 20.9049 12.0579 20.9049 12.1711 20.8853C12.2988 20.8631 12.4214 20.8069 12.6666 20.6945L19.0666 17.7612C19.4047 17.6062 19.5738 17.5287 19.6976 17.4082C19.8071 17.3016 19.8907 17.1713 19.942 17.0274C20 16.8645 20 16.6786 20 16.3067V9.50006M2 8.50006L11.6422 3.67895C11.7734 3.61336 11.839 3.58056 11.9078 3.56766C11.9687 3.55622 12.0313 3.55622 12.0922 3.56766C12.161 3.58056 12.2266 3.61336 12.3578 3.67895L22 8.50006L12.3578 13.3212C12.2266 13.3868 12.161 13.4196 12.0922 13.4325C12.0313 13.4439 11.9687 13.4439 11.9078 13.4325C11.839 13.4196 11.7734 13.3868 11.6422 13.3212L2 8.50006Z"
      stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

  button(
    :class="getModeClass('test')"
    aria-label="Режим: Тест"
    @click="() => changeMode('test')"
  )
    svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

  button(
    :class="getModeClass('write')"
    aria-label="Режим: Напиши"
    @click="() => changeMode('write')"
  )
    svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M18 2L22 6M2 22L3.2764 17.3199C3.35968 17.0145 3.40131 16.8619 3.46523 16.7195C3.52199 16.5931 3.59172 16.4729 3.67332 16.3609C3.76521 16.2348 3.87711 16.1229 4.1009 15.8991L14.4343 5.56569C14.6323 5.36768 14.7313 5.26867 14.8455 5.23158C14.9459 5.19895 15.0541 5.19895 15.1545 5.23158C15.2687 5.26867 15.3677 5.36768 15.5657 5.56569L18.4343 8.43431C18.6323 8.63232 18.7313 8.73133 18.7684 8.84549C18.8011 8.94591 18.8011 9.05409 18.7684 9.15451C18.7313 9.26867 18.6323 9.36768 18.4343 9.56569L8.1009 19.8991C7.87711 20.1229 7.76521 20.2348 7.63908 20.3267C7.52709 20.4083 7.40692 20.478 7.28052 20.5348C7.13815 20.5987 6.98548 20.6403 6.68014 20.7236L2 22Z" stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

  button(
    v-if="hasFavorites"
    :class="favoritesButtonClass"
    aria-label="Переключить избранное"
    @click="toggleFavorites"
  )
    svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z" stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")

  button(@click="emit('open')" class="bar__button" aria-label="Загрузить словарь")
    svg(width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg")
      path(d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M9 15L12 18M12 18L15 15M12 18L12 12M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" stroke="var(--c4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  mode: 'test' | 'learn' | 'write'
  useFavorites: boolean
  hasFavorites: boolean
}>()
const emit = defineEmits<{
  (e: 'update:mode', mode: 'test' | 'learn' | 'write'): void
  (e: 'toggle:favorites'): void
  (e: 'open'): void
  (e: 'install:pwa'): void
}>()

const favoritesButtonClass = computed(() => [
  'bar__button',
  { 'bar__button--active': props.useFavorites },
])

/**
 * Меняет текущий режим работы приложения.
 * @param nextMode Новый режим, выбранный пользователем.
 */
const changeMode = (nextMode: 'test' | 'learn' | 'write'): void => {
  if (props.mode === nextMode) return
  emit('update:mode', nextMode)
}

/**
 * Включает или отключает просмотр только избранных слов.
 */
const toggleFavorites = (): void => {
  emit('toggle:favorites')
}

/**
 * Возвращает список классов для кнопки режима с учетом активного состояния.
 * @param targetMode Режим, к которому относится кнопка.
 */
const getModeClass = (targetMode: 'test' | 'learn' | 'write') => [
  'bar__button',
  { 'bar__button--active': props.mode === targetMode },
]
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as mixins;

.bar {
  @include mixins.flex-center(10px);
  padding: 40px 0;
  flex-wrap: wrap;

  &__button {
    @include mixins.button-reset;
    @include mixins.control-surface(60px, 20px, var(--c1));
    @include mixins.focus-ring(var(--accent));

    color: var(--c4);

    &:hover {
      outline: 2px solid var(--accent);

      svg {
        transform: rotate(-20deg);
      }

      path {
        stroke: var(--accent);
      }
    }

    &--active {
      path {
        stroke: var(--accent);
      }
    }

    svg {
      transition: all 0.3s ease;
    }
  }
}
</style>
