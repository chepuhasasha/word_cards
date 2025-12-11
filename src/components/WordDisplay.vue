<template lang="pug">
.word-wrapper
  transition(name="word")
    .word(:key="wordKey") {{ text }}
</template>

<script setup lang="ts">
defineProps<{ text: string; wordKey: string }>()
</script>
