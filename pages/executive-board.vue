<script setup lang="ts">
//Types
import type { CadenceWithMembers } from '~/types'

//Variables
const API_URL = useRuntimeConfig().public.API_URL
const cadencesWithMembers = ref<CadenceWithMembers[] | null>(null)
const loggedIn = useState('loggedIn')

//Functions
const loadCadencesWithMembers = async () => {
  cadencesWithMembers.value = await $fetch(
    `${API_URL}/api/cadences/with-members`,
  )
}

const logout = () => {
  loggedIn.value = false
}

const reloadPage = (): void => {
  loadCadencesWithMembers()
}

//Nuxt methods
onMounted(() => {
  reloadPage()
})
</script>

<template>
  <div class="flex w-full max-w-full flex-col items-center gap-10">
    <div class="my-20 text-center text-5xl font-bold text-gray-900">
      Executive Board of PLAIS
    </div>

    <template v-if="cadencesWithMembers">
      <!-- Add new Member or Cadence -->
      <ExecutiveBoardAddCadenceOrMember
        v-if="loggedIn"
        :cadences-length="cadencesWithMembers.length"
        class="w-full md:w-2xl lg:w-4xl"
        @reload="reloadPage"
      />

      <template v-for="cadence in cadencesWithMembers" :key="cadence.id">
        <ExecutiveBoardCadenceSeparator
          :cadence-name="cadence.name"
          :cadence-position="cadence.position"
          :cadence-id="cadence.id"
          :cadences-length="cadencesWithMembers.length"
          @reload="reloadPage"
        />

        <div
          v-for="member in cadence.members"
          :key="member.executiveMemberId"
          class="w-full md:w-2xl lg:w-4xl"
        >
          <ExecutiveBoardMember
            :id="member.executiveMemberId"
            :cadence-id="cadence.id"
            :cadence-length="cadence.members.length"
            :full-name="member.fullName"
            :department="member.department"
            :email="member.email"
            :phone="member.phone"
            :about="member.about"
            :role="member.role"
            :position="member.position"
            :photo-file-name="member.photoFileName"
            @reload="reloadPage"
          />
        </div>
      </template>
    </template>

    <!-- Empty Cadence List -->
    <div
      v-if="cadencesWithMembers && cadencesWithMembers.length === 0"
      class="text-md flex justify-center"
    >
      Sorry, but currently there's no executive members to see.
    </div>

    <!-- Loading -->
    <div v-if="!cadencesWithMembers" class="flex justify-center">
      <progress class="progress w-100" />
    </div>
  </div>
</template>

<style scoped></style>
