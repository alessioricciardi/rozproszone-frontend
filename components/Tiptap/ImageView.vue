<template>
  <NodeViewWrapper
    class="group block w-fit max-w-full relative border border-gray-300 rounded shadow bg-white"
    draggable="true"
  >
    <img
      ref="imgEl"
      :src="node.attrs.src"
      :alt="node.attrs.alt || ''"
      :title="node.attrs.title || ''"
      :style="{ width: node.attrs.width, height: node.attrs.height }"
      class="block rounded pointer-events-auto select-none"
      draggable="false"
      @dragstart.prevent
      @mousedown.stop
    />

    <!-- Resize corner -->
    <div
      class="absolute bottom-0 right-0 w-3 h-3 bg-gray-600 rounded cursor-nwse-resize hidden group-hover:block z-10"
      @mousedown.prevent="startResize"
    />

    <!-- Drag handle (TipTap recognizes this automatically) -->
    <div
      class="drag-handle absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 rounded-full cursor-grab z-10 flex items-center justify-center text-white text-xs"
      title="Przeciągnij"
    >
      ☰
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { ref } from 'vue'

const props = defineProps<NodeViewProps>()
const { node, updateAttributes } = props

const imgEl = ref<HTMLImageElement | null>(null)

let resizeStartX = 0
let resizeStartY = 0
let startWidth = 0
let startHeight = 0

function onMouseMoveResize(e: MouseEvent) {
  const newWidth = Math.max(50, startWidth + (e.clientX - resizeStartX))
  const newHeight = Math.max(50, startHeight + (e.clientY - resizeStartY))

  if (imgEl.value) {
    imgEl.value.style.width = `${newWidth}px`
    imgEl.value.style.height = `${newHeight}px`
  }

  updateAttributes({
    width: `${newWidth}px`,
    height: `${newHeight}px`,
  })
}

function onMouseUpResize() {
  document.removeEventListener('mousemove', onMouseMoveResize)
  document.removeEventListener('mouseup', onMouseUpResize)
}

function startResize(e: MouseEvent) {
  if (!imgEl.value) return

  resizeStartX = e.clientX
  resizeStartY = e.clientY
  startWidth = imgEl.value.offsetWidth
  startHeight = imgEl.value.offsetHeight

  document.addEventListener('mousemove', onMouseMoveResize)
  document.addEventListener('mouseup', onMouseUpResize)
}
</script>

<style scoped>
.align-left {
  display: block;
  margin-left: 0;
  margin-right: auto;
}

.align-center {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.align-right {
  display: block;
  margin-left: auto;
  margin-right: 0;
}
</style>