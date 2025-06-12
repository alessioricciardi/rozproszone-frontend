<template>
  <button
    class="icon-button"
    @click="$emit('click')"
    :class="{ active }"
    :title="'Align Center'"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      class="w-5 h-5"
    >
      <path
        fill-rule="evenodd"
        d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75ZM6.75 9.75a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75ZM3.75 14.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75ZM6.75 18.75a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H6.75Z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</template>

<script>
export default {
  name: 'IconMiddle',
  props: {
    active: {
      type: Boolean,
      default: false,
    },
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
