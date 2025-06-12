<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div>
    <NuxtLayout>
      <UApp>
        <Navbar v-if="route.path !== '/login'" />
        <NuxtPage />
      </UApp>
    </NuxtLayout>
  </div>
</template>
