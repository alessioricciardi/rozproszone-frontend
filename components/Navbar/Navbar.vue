<script setup lang="ts">
//Variables
const loggedIn = useState<boolean>('loggedIn')
const API_URL = useRuntimeConfig().public.API_URL
const toast = useToast()

//Functions
// close dropdown when user clicks outside the dropdown
const closeDropdown = () => {
  const activeElement: Element | null = document.activeElement

  if (activeElement && activeElement instanceof HTMLElement) {
    activeElement.blur()
  }
}

const logout = async (): Promise<void> => {
  try {
    $fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    loggedIn.value = false

    toast.add({
      icon: 'mdi:account-cancel',
      title: 'Success',
      description: 'Logged out successfully.',
      color: 'success',
    })
  } catch {
    useFetchError()
  }
}

//
</script>

<template>
  <div class="navbar-root">
    <!-- Nagłówek -->
    <div
      class="navbar-container bg-gradient-to-r from-blue-800 from-20% to-blue-500 text-white shadow-lg"
    >
      <div class="flex items-center justify-between p-1.5">
        <div class="max-w-35">
          <img alt="PLAIS Logo" src="/img/logo-transparent.png" />
        </div>
        <div class="text-center text-3xl font-semibold text-white lg:text-4xl">
          <p>The Polish Chapter Of Association For Information Systems</p>
        </div>
        <!-- Nie usuwać pustego diva, wyrownuje elementy -->
        <div></div>
      </div>
      <div
        class="navbar-menu flex h-20 items-center justify-between bg-white p-1.5 font-medium text-nowrap text-black"
      >
        <div class="navbar-links">
          <!-- Dropdown -->
          <NavbarDropdown @close-dropdown="closeDropdown()" />
          <div
            class="hidden items-center gap-2 pr-5 pl-2 lg:flex xl:gap-10 xl:pl-5"
          >
            <!-- Linki do podstron -->
            <NuxtLink to="/"><NavbarButton>Home</NavbarButton></NuxtLink>
            <NuxtLink to="/bulletin"
              ><NavbarButton>Bulletin</NavbarButton></NuxtLink
            >
            <NuxtLink to="/events"
              ><NavbarButton>Events</NavbarButton></NuxtLink
            >
            <NuxtLink to="/executive-board"
              ><NavbarButton>Executive Board</NavbarButton></NuxtLink
            >
            <NuxtLink to="/members"
              ><NavbarButton>Members</NavbarButton></NuxtLink
            >
            <NuxtLink to="/history"
              ><NavbarButton>History</NavbarButton></NuxtLink
            >
            <NuxtLink to="/bylaws"
              ><NavbarButton>Bylaws</NavbarButton></NuxtLink
            >
          </div>
        </div>
        <div class="flex items-center gap-2 pr-2 xl:gap-5 xl:pr-5">
          <template v-if="loggedIn">
            <NavbarButton @click.stop="logout">Logout</NavbarButton>
          </template>
          <template v-else>
            <NuxtLink to="/login">
              <NavbarButton>Login</NavbarButton>
            </NuxtLink>
          </template>
          <button
            class="flex h-10 cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-r from-blue-700 to-violet-500 p-2 text-nowrap text-white transition-all duration-15 hover:bg-gradient-to-bl active:scale-99"
          >
            Become a member <IconsNavbarAcademicHat class="w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar-menu {
  font-size: 17px;
}
</style>
