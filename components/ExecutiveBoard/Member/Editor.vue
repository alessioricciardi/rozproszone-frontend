<script setup lang="ts">
//Types
import type { ExecutiveMember, Cadence, PhotoUploadResponse } from '~/types'
import type { SelectMenuItem } from '@nuxt/ui'

type CadenceSelectMenuItem = SelectMenuItem & {
  cadenceId: number
  newPosition: number
}

//Props
const props = defineProps<{
  id?: number
  currentCadenceId?: number
  isNewMember: boolean
  open: boolean
}>()

//Emits
const emit = defineEmits<{
  (e: 'close' | 'delete'): void
  (e: 'update' | 'create', value: ExecutiveMember): void
}>()

//onMounted
onMounted(() => {
  reloadEditor()
})

//Watches

//Prevents incorrect caching of data
watch(
  () => props.open,
  () => reloadEditor(),
)

//Variables
const API_URL = useRuntimeConfig().public.API_URL
const member = reactive<ExecutiveMember>({
  id: -1,
  email: '',
  phone: '',
  about: '',
  memberships: [],
})
const cadenceSelectList = ref<SelectMenuItem[]>([])
const showModalDelete: Ref<boolean> = ref<boolean>(false)
const toast = useToast()

//Functions

//Reload Editor
const reloadEditor = (): void => {
  //Don't fetch when new member is being created
  if (!props.isNewMember) {
    loadMember()
  } else {
    Object.assign(member, {
      id: -1,
      email: '',
      phone: '',
      about: '',
      memberships: [],
    })
  }

  loadCadences()
}

//Toggle delete modal
const toggleModalDelete = (): void => {
  showModalDelete.value = !showModalDelete.value
}

//Get List of Cadences
const loadCadences = async (): Promise<void> => {
  try {
    //Clear old cadences
    cadenceSelectList.value = []
    selectedCadence.value = null

    const data: Cadence[] = await $fetch(`${API_URL}/api/cadences`)

    data.forEach((cadence) => {
      //Create Select Item for Cadence
      const cadenceSelectItem = {
        label: cadence.name,
        cadenceId: cadence.id as number,
        newPosition: cadence.memberIds.length,
        icon: 'i-material-symbols-calendar-clock-rounded',
      }

      //Load default cadence
      if (!props.isNewMember && cadence.id === props.currentCadenceId) {
        selectedCadence.value = cadenceSelectItem
      }

      cadenceSelectList.value.push(cadenceSelectItem)
    })
  } catch {
    useFetchError()
  }
}

//Get executive member and pass it to reactive state
const loadMember = async (): Promise<void> => {
  try {
    const data = await $fetch(`${API_URL}/api/executiveMember/${props.id}`)

    Object.assign(member, data)
  } catch {
    useFetchError()
  }
}

//Create / Update executive  member
const uploadMember = (): void => {
  if (!props.isNewMember) {
    emit('update', member)
  } else {
    emit('create', member)
  }

  emit('close')
}

//Image Upload Handler
const uploadedPhotosNames = ref<string[]>([])
const photoInput = ref<File | null>(null)

const handlePhotoUpload = (event: Event): void => {
  const input = event.target as HTMLInputElement

  if (input.files && input.files.length > 0) {
    photoInput.value = input.files[0]
  } else {
    photoInput.value = null
  }
}

const uploadPhoto = async (): Promise<void> => {
  //Check if cadence is selected and executive is its member
  if (!selectedCadence.value || !selectedMembership.value) {
    useFetchError()
    return
  }

  //If no photos are uploaded
  if (!photoInput.value) {
    toast.add({
      icon: 'mdi:file-image-remove',
      title: 'Error',
      description: 'Please select a photo before uploading.',
      color: 'error',
    })
    return
  }

  const formData = new FormData()
  formData.append('file', photoInput.value)

  try {
    const response: PhotoUploadResponse = await $fetch(
      `${API_URL}/api/Image/executive-member`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include',
      },
    )

    toast.add({
      icon: 'mdi:file-image-plus',
      title: 'Success',
      description: 'Successfully added a photo',
      color: 'success',
    })

    //Change the photo Name in member
    selectedMembership.value.photoFileName = response.fileName

    //Store all uploaded photo names
    uploadedPhotosNames.value.push(response.fileName)
  } catch {
    useFetchError()
  }
}

//Selected Cadence with additional value property
const selectedCadence = ref<CadenceSelectMenuItem | null>(null)

//Selected membership, null when member does not belongs to selected cadence
const selectedMembership = computed({
  get() {
    return (
      member.memberships.find(
        (membership) =>
          membership.cadenceId === selectedCadence.value?.cadenceId,
      ) ?? null
    )
  },
  set(newValue) {
    const index = member.memberships.findIndex(
      (m) => m.cadenceId === selectedCadence.value?.cadenceId,
    )
    if (index !== -1 && newValue) {
      member.memberships[index] = newValue
    }
  },
})

//Add member to new cadence
const addToCadence = (): void => {
  if (selectedCadence.value) {
    member.memberships.push({
      fullName: '',
      department: '',
      cadenceId: selectedCadence.value.cadenceId,
      position: selectedCadence.value.newPosition,
      role: '',
      photoFileName: '',
    })
  }
}

const deleteUploadedPhotos = async (): Promise<void> => {
  if (uploadedPhotosNames.value && uploadedPhotosNames.value.length > 0) {
    for (const photoName of uploadedPhotosNames.value) {
      await $fetch(`${API_URL}/api/Image/executive-member`, {
        method: 'DELETE',
        body: {
          fileName: photoName,
        },
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
    }
  }
}

//Close modal and delete all uploaded photos from backend if exist
const closeModal = (): void => {
  deleteUploadedPhotos()
  emit('close')
}
</script>

<template>
  <UModal
    title="Executive Board Member Editor"
    description="Edit the necessary fields and press 'Confirm Changes' to save the changes. If you want to exit without saving, click 'Cancel changes'."
    :ui="{
      header:
        'bg-gradient-to-r from-blue-800 from-15% to-blue-500 rounded-t-lg',
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

      <div
        v-if="isNewMember || (member.id !== -1 && !isNewMember)"
        class="flex flex-col gap-5"
      >
        <!-- Cadence configuration -->
        <USeparator
          label="Cadence-Specific Details"
          :ui="{ label: 'text-gray-900 ' }"
        />

        <!-- Choose cadence to configure -->
        <UFormField
          label="Select cadence to configure details"
          :ui="{ label: 'text-blue-700 font-semibold' }"
        >
          <div class="flex justify-between">
            <!-- Cadence Select List -->
            <USelectMenu
              v-model="selectedCadence"
              :items="cadenceSelectList"
              color="neutral"
              placeholder="Select Cadence"
              icon="i-mdi-calendar-account"
              class="w-full cursor-pointer text-gray-900 ring-1 ring-[#0f172b]"
              :ui="{
                leadingIcon: 'text-lg text-dimmed',
                trailingIcon: 'text-gray-900',
              }"
            />
          </div>
        </UFormField>

        <template v-if="selectedCadence && !selectedMembership">
          <!-- Info when member does not belongs to selected cadence -->
          <div class="text-center text-sm">
            Member does not belong to this cadence.
          </div>

          <!-- Add to Cadence -->
          <UButton
            label="Add to cadence"
            color="neutral"
            type="submit"
            class="cursor-pointer justify-center bg-gray-900 hover:bg-gray-800 active:scale-99"
            @click.stop="addToCadence"
          />
        </template>

        <template v-if="selectedMembership">
          <!-- Academic title and name -->
          <UFormField
            label="Academic Title and Name"
            :ui="{ label: 'text-blue-700 font-semibold' }"
          >
            <UInput
              v-model="selectedMembership.fullName"
              color="neutral"
              highlight
              icon="i-mdi-account-file-text"
              class="w-full text-lg"
            />
          </UFormField>

          <!-- Department -->
          <UFormField
            label="Department"
            :ui="{ label: 'text-blue-700 font-semibold' }"
          >
            <UInput
              v-model="selectedMembership.department"
              color="neutral"
              highlight
              icon="i-mdi-school"
              class="w-full text-lg"
            />
          </UFormField>

          <!-- Role -->
          <UFormField
            label="Role"
            :ui="{ label: 'text-blue-700 font-semibold' }"
          >
            <UInput
              v-model="selectedMembership.role"
              icon="i-mdi-account"
              color="neutral"
              highlight
              class="w-full text-lg"
            />
          </UFormField>

          <!-- Photo -->
          <UFormField
            label="Add new photo"
            help="Please upload the photo first, then confirm the changes."
            :ui="{
              label: 'text-blue-700 font-semibold',
              help: 'text-gray-700',
            }"
          >
            <div class="flex w-full">
              <UInput
                ref="photoInput"
                type="file"
                accept="image/*"
                color="neutral"
                highlight
                icon="i-mdi-image"
                class="w-full text-lg"
                @change="handlePhotoUpload"
              />

              <UButton
                type="submit"
                color="neutral"
                icon="i-material-symbols-upload-rounded"
                class="ml-2 cursor-pointer bg-blue-700 text-xl hover:bg-blue-700/80 active:bg-blue-800"
                @click.stop="uploadPhoto"
              />
            </div>
          </UFormField>
        </template>
        <!-- Personal details -->
        <USeparator
          label="Personal Details"
          :ui="{ label: 'text-gray-900 ' }"
        />

        <!-- Email -->
        <UFormField
          label="Email"
          :ui="{ label: 'text-blue-700 font-semibold' }"
        >
          <UInput
            v-model="member.email"
            color="neutral"
            highlight
            icon="i-mdi-email"
            class="w-full text-lg"
          />
        </UFormField>

        <!-- Phone -->
        <UFormField
          label="Phone number"
          :ui="{ label: 'text-blue-700 font-semibold' }"
        >
          <UInput
            v-model="member.phone"
            color="neutral"
            highlight
            icon="i-mdi-phone"
            class="w-full text-lg"
          />
        </UFormField>

        <!-- Delete member -->
        <div v-if="!isNewMember" class="flex justify-center">
          <UButton
            label="Delete member"
            color="neutral"
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
          color="neutral"
          @click.stop="closeModal"
          >Cancel changes</UButton
        >
        <UButton
          class="flex cursor-pointer bg-blue-700 hover:bg-blue-700/80 active:scale-99"
          color="neutral"
          @click.stop="uploadMember"
          >Confirm changes</UButton
        >
      </div>
    </template>
  </UModal>
</template>
