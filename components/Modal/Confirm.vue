<script setup lang="ts">
//Props
const props = defineProps<{
  open: boolean
}>()

//Emits
const emit = defineEmits<{
  (e: 'close' | 'confirm'): void
}>()
</script>

<template>
  <UModal
    description="This action cannot be undone."
    :open="props.open"
    :close="false"
    @close="emit('close')"
  >
    <template #title
      ><div class="flex items-center">
        <UIcon
          class="mr-2 flex text-red-700"
          size="45"
          name="i-material-symbols-warning-rounded"
        />
        <div>Are you sure?</div>
      </div>
    </template>
    <template #body>
      <div class="flex w-full justify-end gap-5">
        <UButton
          class="flex cursor-pointer bg-red-700 hover:bg-red-800"
          @click.stop="(emit('confirm'), emit('close'))"
        >
          Confirm
        </UButton>

        <UButton
          class="flex cursor-pointer bg-blue-700 hover:bg-blue-800"
          @click.stop="emit('close')"
        >
          Cancel action
        </UButton>
      </div>
    </template>
  </UModal>
</template>
