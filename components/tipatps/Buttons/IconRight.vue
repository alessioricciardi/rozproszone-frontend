<template>
  <button
    class="icon-button"
    @click="$emit('click')"
    :class="{ active }"
    :title="'Align Right'"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
    <path fill-rule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm8.25 5.25a.75.75 0 0 1 .75-.75h8.25a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
    </svg>


  </button>
</template>

<script>
export default {
  name: 'IconRight',
  props: {
    active: { type: Boolean, default: false },
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
