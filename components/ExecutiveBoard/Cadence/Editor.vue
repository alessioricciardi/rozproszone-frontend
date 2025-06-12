<script setup lang="ts">
//Types
import type { Cadence } from '~/types'

//Props
const props = defineProps<{
  open: boolean
  cadenceId?: number
  cadencesLength?: number
  isNewCadence: boolean
}>()

//Emits
const emit = defineEmits<{
  (e: 'close' | 'delete'): void
  (e: 'update' | 'create', value: Cadence): void
}>()

//Variables
const API_URL = useRuntimeConfig().public.API_URL
const newCadence: Cadence = reactive({
  id: -1,
  name: '',
  position: props.cadencesLength ?? -1,
  memberIds: [],
})

const showModalDelete = ref<boolean>(false)
const validatorText = ref<string>('')

//Functions

//Reload Editor
const reloadEditor = (): void => {
  //Don't fetch when new member is being created
  if (!props.isNewCadence) {
    loadCadence()
  } else {
    Object.assign(newCadence, {
      id: -1,
      name: '',
      position: props.cadencesLength ?? -1,
      memberIds: [],
    })
  }
}

const loadCadence = async (): Promise<void> => {
  try {
    const data: Cadence = await $fetch(
      `${API_URL}/api/cadences/${props.cadenceId}`,
    )

    Object.assign(newCadence, data)
  } catch {
    useFetchError()
  }
}

const toggleModalDelete = (): void => {
  showModalDelete.value = !showModalDelete.value
}

const uploadCadence = (): void => {
  //Validate cadence name
  if (!validateCadenceName()) return

  if (!props.isNewCadence) {
    emit('update', { ...newCadence })
  } else {
    emit('create', { ...newCadence })
  }
  emit('close')
}

const validateCadenceName = (): boolean => {
  //Check if empty
  if (!newCadence.name.trim()) {
    validatorText.value = 'Name cannot be empty.'
    return false
  }

  const nameSplitted: string[] = newCadence.name.split(':')

  //Check if there's only one colon
  if (nameSplitted.length !== 2) {
    validatorText.value = 'There must be exactly one colon in the name.'
    return false
  }

  const romanNumbers: string[] = ['I', 'V', 'X', 'L', 'C', 'D', 'M']

  //Check if cadence number is a roman number
  for (let i = 0; i < nameSplitted[0].length; i++) {
    if (!romanNumbers.includes(nameSplitted[0][i])) {
      validatorText.value = 'Cadence number must be a Roman numeral.'
      return false
    }
  }

  const dates: string[] = nameSplitted[1].split('-')

  //Check if there's 2 dates
  if (dates.length !== 2) {
    validatorText.value = 'Please provide two dates separated by a dash.'
    return false
  }

  //Check if there's only 1 space after colon
  if (dates[0].length === dates[0].trim().length) {
    validatorText.value = 'There must be exactly one space after the colon.'
    return false
  }
  dates[0] = dates[0].trim()

  //Check if dates are 4 digit numbers
  if (dates[0].length !== 4 || dates[1].length !== 4) {
    validatorText.value = 'Dates must be 4-digit numbers.'
    return false
  }

  const date0Number: number = Number(dates[0])
  const date1Number: number = Number(dates[1])

  //Check if dates are numbers
  if (
    !Number.isInteger(date0Number) ||
    !Number.isInteger(date1Number) ||
    date0Number > date1Number
  ) {
    validatorText.value =
      'Dates are invalid or the start date is after the end date.'
    return false
  }

  validatorText.value = ''
  return true
}

//onMounted
onMounted(() => {
  reloadEditor()
})

//Watches
watch(
  () => props.open,
  () => reloadEditor(),
)
</script>

<template>
  <UModal
    title="Cadence editor"
    description="Edit the necessary fields and press 'Confirm Changes' to save the changes. If you want to exit without saving, click 'Cancel changes'."
    :ui="{
      header: 'bg-gray-900 rounded-t-lg',
      title: 'text-white border-b-2 border-white p-1 justify-center flex',
      description: 'text-white mb-1',
    }"
    :open="props.open"
    :close="false"
  >
    <template #body>
      <!-- Confirm member delete -->
      <ModalConfirm
        :open="showModalDelete"
        @close="toggleModalDelete"
        @confirm="(emit('delete'), emit('close'))"
      />

      <div v-if="isNewCadence || (!isNewCadence && newCadence.id !== -1)">
        <!-- Cadence name -->
        <UFormField
          label="Cadence name"
          :description="validatorText"
          help='Valid cadence name: "II: 2010-2015" '
          :ui="{
            label: 'text-gray-900 font-semibold',
            help: 'text-gray-700 font-semibold text-md',
            description: 'text-red-600',
          }"
        >
          <UInput
            v-model="newCadence.name"
            color="neutral"
            highlight
            icon="mdi:calendar-text"
            class="w-full text-lg"
          />
        </UFormField>
        <div v-if="!isNewCadence" class="mt-5 flex justify-center">
          <UButton
            label="Delete cadence"
            class="w-2/3 cursor-pointer justify-center bg-red-700 hover:bg-red-800 active:scale-99"
            @click.stop="toggleModalDelete"
          />
        </div>
      </div>
      <div v-else>
        <progress class="progress" />
      </div>
    </template>
    <!-- Confirm / Cancel changes -->
    <template #footer>
      <div class="flex w-full justify-between">
        <UButton
          class="flex cursor-pointer bg-red-700 hover:bg-red-700/80 active:scale-99"
          @click.stop="emit('close')"
          >Cancel changes</UButton
        >
        <UButton
          class="flex cursor-pointer bg-gray-900 hover:bg-gray-800 active:scale-99"
          @click.stop="uploadCadence"
          >Confirm changes</UButton
        >
      </div>
    </template>
  </UModal>
</template>
