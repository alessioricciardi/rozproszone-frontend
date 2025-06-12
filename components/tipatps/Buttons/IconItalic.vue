<template>
  <button
    class="icon-button"
    @click="$emit('click')"
    :class="{ active }"
    :title="'Italic'"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-5 h-5"
    >
      <path
        fill-rule="evenodd"
        d="M10.497 3.744a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-3.275l-5.357 15.002h2.632a.75.75 0 1 1 0 1.5h-7.5a.75.75 0 1 1 0-1.5h3.275l5.357-15.002h-2.632a.75.75 0 0 1-.75-.75Z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</template>

<script>
export default {
  name: 'IconItalic',
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
