<!-- components/Dropdown.vue -->
<template>
  <div class="relative" @mouseenter="onEnter" @mouseleave="onLeave">
    <div>
      <slot name="trigger" />
    </div>
    <div
      v-if="open"
      class="absolute flex items-center  left-1/2 top-full z-50 mt-2"
      :class="[widthClass, 'transform -translate-x-1/2 rounded-md bg-white shadow-lg flex flex-col']"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  width: {
    type: String,
    default: 'w-56',
  },
})

const open = ref(false)
let hoverCount = 0
let closeTimeout: ReturnType<typeof setTimeout> | null = null

function onEnter() {
  hoverCount++
  open.value = true
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
}

function onLeave() {
  hoverCount--
  if (hoverCount <= 0) {
    closeTimeout = setTimeout(() => {
      open.value = false
      hoverCount = 0
    }, 200)
  }
}

const widthClass = computed(() => props.width)
</script>
