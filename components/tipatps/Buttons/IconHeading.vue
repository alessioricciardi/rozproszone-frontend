<template>
  <button
    class="icon-button"
    @click="$emit('click')"
    :class="{ active }"
    :title="'Heading'"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M2.243 3.743a.75.75 0 0 1 .75.75v6.75h9v-6.75a.75.75 0 1 1 1.5 0v15.002a.75.75 0 1 1-1.5 0v-6.751h-9v6.75a.75.75 0 1 1-1.5 0v-15a.75.75 0 0 1 .75-.75Zm17.605 4.964a.75.75 0 0 1 .396.661v9.376h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5V10.77l-1.084.722a.75.75 0 1 1-.832-1.248l2.25-1.5a.75.75 0 0 1 .77-.037Z" clip-rule="evenodd" />
    </svg>
  </button>
</template>

<script>
export default {
  name: 'IconHeading',
  props: {
    active: Boolean,
  },
  emits: ['click'],
}
</script>

<style scoped>
.icon-button {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-button.active {
  background: #333;
  color: white;
  border-color: #333;
}
</style>
