<script setup lang="ts">
const emit = defineEmits<{
  (event: 'closeDropdown'): void
}>()

const closeDropdown = (): void => {
  emit('closeDropdown')
}
</script>

<template>
  <div class="dropdown lg:hidden">
    <div tabindex="0" role="button">
      <IconsNavbarDropdown class="fill-gray-900" />
    </div>
    <ul
      tabindex="0"
      class="dropdown-content menu z-1 w-45 rounded-lg bg-gradient-to-r from-blue-800 to-blue-500 text-lg text-nowrap text-white shadow-2xl"
    >
      <li @click="closeDropdown">
        <NuxtLink to="/">Home</NuxtLink>
      </li>
      <li @click="closeDropdown">
        <NuxtLink to="/bulletin">Bulletin</NuxtLink>
      </li>
      <li @click="closeDropdown"><NuxtLink to="/events">Events</NuxtLink></li>
      <li @click="closeDropdown">
        <NuxtLink to="/executive-board">Executive Board</NuxtLink>
      </li>
      <li @click="closeDropdown"><NuxtLink to="/members">Members</NuxtLink></li>
      <li @click="closeDropdown"><NuxtLink to="/history">History</NuxtLink></li>
      <li @click="closeDropdown"><NuxtLink to="/bylaws">Bylaws</NuxtLink></li>
    </ul>
  </div>
</template>

<style scoped>
ul {
  font-size: 17px;
  font-weight: 500;
}
</style>
