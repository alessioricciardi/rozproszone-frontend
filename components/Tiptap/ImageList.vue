<template>
  <div>
    <h2>Obrazy:</h2>
    <ul class="flex flex-wrap gap-4">
      <li v-for="img in images" :key="img">
        <img
          :src="`${API_URL}/uploads/bulletins/${img}`"
          alt="Miniatura"
          class="w-24 h-24 object-cover rounded shadow"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ images: string[] }>()
const API_URL = useRuntimeConfig().public.API_URL
</script>
