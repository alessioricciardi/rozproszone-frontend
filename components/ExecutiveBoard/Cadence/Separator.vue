<script setup lang="ts">
//Types
import type { Cadence } from '~/types'

//Emits
const emit = defineEmits<{
  (e: 'reload'): void
}>()

//Props
const props = defineProps<{
  cadenceName: string
  cadencePosition: number
  cadenceId: number
  cadencesLength: number
}>()

//Variables
const showModalEdit = ref<boolean>(false)
const API_URL = useRuntimeConfig().public.API_URL
const toast = useToast()
const loggedIn = useState<boolean>('loggedIn')

//Functions
const toggleModalEdit = (): void => {
  showModalEdit.value = !showModalEdit.value
}

//Crud

//Get cadence by id
const getCadence = async (): Promise<Cadence | null> => {
  try {
    return await $fetch(`${API_URL}/api/cadences/${props.cadenceId}`)
  } catch {
    useFetchError()
    return null
  }
}

//Move up or down cadence
const moveCadence = async (direction: 'up' | 'down'): Promise<void> => {
  const cadenceBeforeUpdate: Cadence | null = await getCadence()

  if (!cadenceBeforeUpdate) return

  let newPosition: number = -1

  if (direction === 'up') newPosition = cadenceBeforeUpdate.position - 1
  if (direction === 'down') newPosition = cadenceBeforeUpdate.position + 1

  if (newPosition < 0 || newPosition >= props.cadencesLength) return

  const updatedCadence: Cadence = {
    ...cadenceBeforeUpdate,
    position: newPosition,
  }

  await updateCadence(updatedCadence)
}

//Update Cadence
const updateCadence = async (updatedCadence: Cadence): Promise<void> => {
  try {
    await $fetch(`${API_URL}/api/cadences/${updatedCadence.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedCadence),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    toast.add({
      icon: 'mdi:calendar-check',
      title: 'Success',
      description: 'Cadence updated successfully.',
      color: 'success',
    })
  } catch {
    useFetchError()
  }

  emit('reload')
}

//Delete cadence
const deleteCadence = async (): Promise<void> => {
  try {
    await $fetch(`${API_URL}/api/cadences/${props.cadenceId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    toast.add({
      icon: 'mdi:calendar-remove',
      title: 'Success',
      description: 'Cadence deleted successfully.',
      color: 'success',
    })
  } catch {
    useFetchError()
  }

  emit('reload')
}
</script>

<template>
  <USeparator
    size="xs"
    class="lg:w-6xl"
    :ui="{
      border: 'border-gray-900',
    }"
  >
    <div v-if="loggedIn" class="flex items-center gap-2">
      <!-- Move cadence down -->
      <UButton
        v-if="cadencePosition < cadencesLength - 1"
        class="rounded-2xl text-xl text-gray-900 hover:cursor-pointer hover:bg-gray-900 hover:text-white active:scale-97"
        variant="ghost"
        icon="i-material-symbols-arrow-downward-rounded"
        @click.stop="moveCadence('down')"
      />
      <div v-else class="w-[32px]" />

      <!-- Open cadence editor -->
      <UButton
        :label="`Cadence ${cadenceName}`"
        variant="outline"
        trailing-icon="material-symbols:edit-calendar-outline-rounded"
        class="hover:text-whit cursor-pointer rounded-xl text-gray-900 ring-gray-900 hover:bg-gray-900 hover:text-white active:scale-95"
        :ui="{
          label: 'text-lg  lg:text-xle',
          trailingIcon: 'text-xl',
        }"
        @click.stop="toggleModalEdit"
      />

      <!-- Move cadence up -->
      <UButton
        v-if="cadencePosition > 0"
        class="rounded-2xl text-xl text-gray-900 hover:cursor-pointer hover:bg-gray-900 hover:text-white active:scale-95"
        variant="ghost"
        icon="i-material-symbols-arrow-upward-rounded"
        @click.stop="moveCadence('up')"
      />
      <div v-else class="w-[32px]" />
    </div>
    <div v-else class="text-lg text-gray-900 lg:text-xl">
      Cadence {{ cadenceName }}
    </div>
  </USeparator>

  <ExecutiveBoardCadenceEditor
    :cadence-id="cadenceId"
    :is-new-cadence="false"
    :open="showModalEdit"
    @close="toggleModalEdit"
    @update="updateCadence"
    @delete="deleteCadence"
  />
</template>
