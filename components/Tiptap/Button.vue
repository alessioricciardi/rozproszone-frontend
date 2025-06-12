<script setup lang="ts">
defineProps<{
  disabledBinding?: boolean
  tooltip: string
  icon: string
  classBinding: object
}>()
</script>

<template>
  <div>
    <UTooltip
      :text="tooltip"
      class="text-3xl text-gray-900 hover:bg-gray-300/80"
    >
      <UButton
        :icon="icon"
        :class="classBinding"
        :disabled="disabledBinding"
        style="outline: none"
        variant="ghost"
        square
        padded
        trailing
      />
    </UTooltip>
  </div>
</template>
