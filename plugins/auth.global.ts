export default defineNuxtPlugin(async (nuxtApp) => {
  const API_URL = useRuntimeConfig().public.API_URL
  const loggedIn = useState<boolean>('loggedIn', () => false)

  try {
    const data = await $fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    })
    loggedIn.value = !!data
  } catch {
    loggedIn.value = false
  }
})
