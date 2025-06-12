<script setup lang="ts">
//Types
import type { ExecutiveMember, Cadence } from '~/types'

//Props
const props = defineProps<{
  cadencesLength: number
}>()

//Emits
const emit = defineEmits<{
  (e: 'reload'): void
}>()

//Variables
const API_URL = useRuntimeConfig().public.API_URL
const toast = useToast()
const showModalEditMember = ref<boolean>(false)
const showModalEditCadence = ref<boolean>(false)

//Functions
const toggleModalEditMember = (): void => {
  showModalEditMember.value = !showModalEditMember.value
}

const toggleModalEditCadence = (): void => {
  showModalEditCadence.value = !showModalEditCadence.value
}

//Create new executive member
const createMember = async (newMember: ExecutiveMember): Promise<void> => {
  try {
    await $fetch(`${API_URL}/api/executiveMember`, {
      method: 'POST',
      body: JSON.stringify(newMember),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    toast.add({
      icon: 'mdi:account-check',
      title: 'Success',
      description: 'Member added successfully.',
      color: 'success',
    })
  } catch {
    useFetchError()
  }
  emit('reload')
}

//Create new cadence
const createCadence = async (newCadence: Cadence) => {
  try {
    await $fetch(`${API_URL}/api/cadences`, {
      method: 'POST',
      body: JSON.stringify(newCadence),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    toast.add({
      icon: 'mdi:calendar-check',
      title: 'Success',
      description: 'Cadence created successfully.',
      color: 'success',
    })
  } catch {
    useFetchError()
  }
  emit('reload')
}
</script>

<template>
  <div class="flex w-full gap-5">
    <!-- Add new member -->
    <div
      class="flex h-24 w-1/2 cursor-pointer flex-row items-center justify-center rounded-lg border border-gray-200 bg-gray-200/60 text-gray-900 shadow-xl transition-colors duration-200 ease-out hover:bg-gradient-to-r hover:from-blue-800 hover:from-20% hover:to-blue-500 hover:text-white active:scale-99"
      @click.stop="toggleModalEditMember"
    >
      Add new member
      <UIcon name="mdi:account-plus" size="22" class="ml-1" />
    </div>

    <ExecutiveBoardMemberEditor
      :is-new-member="true"
      :open="showModalEditMember"
      @close="toggleModalEditMember"
      @create="createMember"
    />

    <!-- Add new cadence -->
    <div
      class="flex h-24 w-1/2 cursor-pointer flex-row items-center justify-center rounded-lg border border-gray-200 bg-gray-200/60 text-gray-900 shadow-xl transition-colors duration-200 ease-out hover:bg-gradient-to-r hover:from-blue-800 hover:from-20% hover:to-blue-500 hover:text-white active:scale-99"
      @click.stop="toggleModalEditCadence"
    >
      Add new cadence
      <UIcon name="mdi:calendar-plus" size="22" class="ml-1" />
    </div>

    <ExecutiveBoardCadenceEditor
      :is-new-cadence="true"
      :cadences-length="props.cadencesLength"
      :open="showModalEditCadence"
      @close="toggleModalEditCadence"
      @create="createCadence"
    />
  </div>
</template>
