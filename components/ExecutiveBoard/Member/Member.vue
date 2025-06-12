<script setup lang="ts">
//Types
import type { ExecutiveMember } from '~/types'

//Props
const props = defineProps<{
  id: number
  cadenceId: number
  cadenceLength: number
  fullName: string
  department: string
  email: string
  phone: string
  about: string
  role: string
  position: number
  photoFileName: string
}>()

//Emits
const emit = defineEmits<{
  (e: 'reload'): void
}>()

//Variables
const API_URL = useRuntimeConfig().public.API_URL
const showModalAbout: Ref<boolean> = ref<boolean>(false)
const showModalDelete: Ref<boolean> = ref<boolean>(false)
const showModalEdit: Ref<boolean> = ref<boolean>(false)
const photoSrc = ref<string>('img/no-photo.png')
const toast = useToast()
const loggedIn = useState<boolean>('loggedIn')

//Functions
const toggleModalAbout = (): void => {
  showModalAbout.value = !showModalAbout.value
}

const toggleModalDelete = (): void => {
  showModalDelete.value = !showModalDelete.value
}

const toggleModalEdit = (): void => {
  showModalEdit.value = !showModalEdit.value
}

const getPhotoName = async (): Promise<string> => {
  if (!props.photoFileName) return 'img/no-photo.png'

  try {
    const url = `${API_URL}/uploads/executive-members/${props.photoFileName}`
    const response = await $fetch(url)

    return response ? url : 'img/no-photo.png'
  } catch {
    return 'img/no-photo.png'
  }
}

//Watches

//Turn off edit modal when logged out
// watch(
//   () => props.loggedIn,
//   (newVal) => {
//     if (newVal === false) showModalEdit.value = false
//   },
// )

//Check if photo was updated
watch(
  () => props.photoFileName,
  async () => {
    photoSrc.value = await getPhotoName()
  },
)

//onMounted
onMounted(async () => {
  photoSrc.value = await getPhotoName()
})

//CRUD

//Get executive member
const getMember = async (): Promise<ExecutiveMember | null> => {
  try {
    return await $fetch(`${API_URL}/api/executiveMember/${props.id}`)
  } catch {
    useFetchError()
    return null
  }
}

//Update executive member
const updateMember = async (
  updatedMember: ExecutiveMember,
  message?: string,
): Promise<void> => {
  try {
    await $fetch(`${API_URL}/api/executiveMember/${updatedMember.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedMember),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    toast.add({
      icon: 'mdi:account-check',
      title: 'Success',
      description: message ? message : 'Member updated successfully.',
      color: 'success',
    })
  } catch {
    useFetchError()
  }
  emit('reload')
}

//Delete executive member

const deleteMember = async (): Promise<void> => {
  try {
    await $fetch(`${API_URL}/api/executiveMember/${props.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    toast.add({
      icon: 'mdi:account-cancel',
      title: 'Success',
      description: 'Member deleted successfully.',
      color: 'success',
    })
  } catch {
    useFetchError()
  }
  emit('reload')
}

//Remove executive member from cadence
const removeFromCadence = async (): Promise<void> => {
  const memberBeforeUpdate: ExecutiveMember | null = await getMember()

  if (!memberBeforeUpdate) return

  const membershipsWithoutThisCadence = memberBeforeUpdate.memberships.filter(
    (membership) => membership.cadenceId !== props.cadenceId,
  )

  if (membershipsWithoutThisCadence.length === 0) {
    toast.add({
      icon: 'mdi:alert-outline',
      title: 'Error',
      description:
        "Cannot remove member from cadence when they're assigned to only one cadence. Please try deleting the member instead.",
      color: 'error',
    })
    return
  }

  const updatedMember = {
    ...memberBeforeUpdate,
    memberships: membershipsWithoutThisCadence,
  }

  await updateMember(updatedMember, 'Member removed from cadence successfully.')
}

//Move up or down executive member
const moveMember = async (direction: 'up' | 'down'): Promise<void> => {
  const memberBeforeUpdate: ExecutiveMember | null = await getMember()

  if (!memberBeforeUpdate) return

  let newPosition: number = -1

  if (direction === 'up') newPosition = props.position - 1
  if (direction === 'down') newPosition = props.position + 1

  if (newPosition < 0 || newPosition >= props.cadenceLength) return

  const updatedMemberships = memberBeforeUpdate.memberships.map((membership) =>
    membership.cadenceId === props.cadenceId
      ? { ...membership, position: newPosition }
      : membership,
  )

  const updatedMember: ExecutiveMember = {
    ...memberBeforeUpdate,
    memberships: updatedMemberships,
  }

  await updateMember(updatedMember)
}
</script>

<template>
  <div
    class="relative flex cursor-pointer flex-row items-center rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl hover:bg-gray-100"
    @click.stop="toggleModalAbout"
  >
    <!-- CMS Icons -->
    <div v-if="loggedIn" class="absolute top-0 right-0 z-10 flex gap-1 p-1">
      <div>
        {{ props.position }}
      </div>

      <!-- Move up -->
      <UTooltip v-if="position > 0" text="Move up" :delay-duration="0">
        <UButton
          class="cursor-pointer bg-zinc-200 text-lg text-gray-900 hover:bg-zinc-300"
          icon="i-material-symbols-arrow-upward-rounded"
          @click.stop="moveMember('up')"
        />
      </UTooltip>

      <!-- Move down -->
      <UTooltip
        v-if="position < cadenceLength - 1"
        text="Move down"
        :delay-duration="0"
      >
        <UButton
          class="cursor-pointer bg-zinc-200 text-lg text-gray-900 hover:bg-zinc-300"
          icon="i-material-symbols-arrow-downward-rounded"
          @click.stop="moveMember('down')"
        />
      </UTooltip>

      <!-- Edit -->
      <UTooltip text="Edit" :delay-duration="0">
        <UButton
          class="cursor-pointer bg-amber-300 text-lg text-gray-900 hover:bg-amber-400"
          icon="mdi:account-edit"
          @click.stop="toggleModalEdit"
        />
      </UTooltip>

      <!-- Remove from cadence -->
      <UTooltip text="Remove from cadence" :delay-duration="0">
        <UButton
          class="cursor-pointer bg-red-500 text-lg text-gray-900 hover:bg-red-600"
          icon="mdi:account-remove"
          @click.stop="toggleModalDelete"
        />
      </UTooltip>
    </div>

    <!-- Confirm Delete -->
    <ModalConfirm
      :open="showModalDelete"
      @close="toggleModalDelete"
      @confirm="removeFromCadence"
    />

    <!-- Editing mode -->
    <ExecutiveBoardMemberEditor
      :id="props.id"
      :current-cadence-id="cadenceId"
      :is-new-member="false"
      :open="showModalEdit"
      @close="toggleModalEdit"
      @update="updateMember"
      @delete="deleteMember"
    />

    <!-- Picture -->
    <div
      class="flex h-48 w-40 flex-shrink-0 rounded-s-lg border-r-2 border-gray-100 lg:h-60 lg:w-48"
    >
      <img
        class="w-full overflow-hidden rounded-s-lg"
        alt="Picture of PLAIS executive board member"
        :src="photoSrc"
      />
    </div>

    <!-- Member description -->
    <div class="flex flex-col p-5 leading-normal font-normal tracking-tight">
      <div class="flex text-sm lg:text-base">
        {{ role }}
      </div>
      <div class="flex text-lg font-bold lg:text-2xl">
        {{ fullName }}
      </div>
      <div class="text-md flex lg:text-lg">
        {{ department }}
      </div>
      <div class="mt-4 text-sm lg:text-base">
        <div v-if="email" class="flex gap-1">
          <span class="hidden text-blue-700 sm:flex">E-mail: </span
          ><span class="text-blue-700 sm:text-gray-900">{{ email }}</span>
        </div>
        <div v-if="phone" class="flex gap-1">
          <span class="hidden text-blue-700 sm:flex">Phone: </span
          ><span class="text-blue-700 sm:text-gray-900">{{ phone }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal - About -->
  <Teleport to="body">
    <div
      v-if="showModalAbout"
      class="modal modal-open backdrop-blur-xs"
      @click.self="toggleModalAbout"
    >
      <div
        class="modal-box relative flex h-11/12 max-w-11/12 flex-col p-0 shadow-2xl lg:h-10/12 lg:max-w-6/12"
      >
        <div
          class="flex flex-row items-center border-b border-gray-200 bg-gradient-to-r from-blue-800 from-20% to-blue-500 text-white shadow-sm"
        >
          <div class="flex h-40 w-32 flex-shrink-0">
            <img
              class="w-full overflow-hidden rounded-tl-lg"
              alt="Picture of PLAIS executive board member"
              :src="photoSrc"
            />
          </div>
          <div
            class="flex w-full flex-col p-2 leading-normal font-normal tracking-tight"
          >
            <div class="text-md">{{ role }}</div>
            <div class="text-lg font-bold">{{ fullName }}</div>
            <div class="text-md">
              {{ department }}
            </div>
          </div>
        </div>
        <div class="flex-grow overflow-y-auto px-12 py-5 text-justify">
          {{ about }}
        </div>
        <div class="flex justify-end p-5">
          <button
            class="btn bg-blue-600 text-white hover:bg-blue-800 hover:font-semibold"
            @click.stop="toggleModalAbout"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
