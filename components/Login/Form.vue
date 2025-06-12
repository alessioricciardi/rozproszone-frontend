<script setup lang="ts">
//Variables
const toast = useToast()
const API_URL = useRuntimeConfig().public.API_URL
const inputType = ref<string>('password')
const username = ref<string>('')
const password = ref<string>('')
const loginResult = ref<string>('')

//Functions

// Toggle password visibility
const changeInputType = (): void => {
  inputType.value = inputType.value === 'password' ? 'text' : 'password'
}

//Log in
const login = async (): Promise<void> => {
  if (!username.value || !password.value) {
    loginResult.value = 'Please enter both username and password.'
    return
  }

  try {
    await $fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value,
      },
      credentials: 'include',
    })

    //Clear login error
    loginResult.value = ''

    //Add loggedIn
    const loggedIn = useState<boolean>('loggedIn')
    loggedIn.value = true

    //Redirect to homepage
    useRouter().push('/executive-board')

    toast.add({
      icon: 'mdi:account-cowboy-hat',
      title: 'Success',
      description: 'Logged in successfully.',
      color: 'success',
    })
  } catch {
    loginResult.value = 'Incorrect username or password. Please try again.'
  }
}
</script>

<template>
  <form @keydown.enter="login">
    <div
      class="flex h-150 w-150 flex-col items-center rounded-3xl border-1 border-gray-200 bg-white shadow-xl"
    >
      <div class="mt-15 size-40">
        <img src="/img/logo-blue.png" />
      </div>

      <div class="mt-10 flex w-2/3 flex-col gap-5">
        <UFormField
          label="Username"
          :ui="{ label: 'text-gray-900' }"
          :error="loginResult ? true : false"
        >
          <UInput
            v-model.trim="username"
            color="neutral"
            size="lg"
            placeholder="Enter your username"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Password"
          :ui="{ label: 'text-gray-900' }"
          :error="loginResult"
        >
          <UInput
            v-model.trim="password"
            :type="inputType"
            size="lg"
            color="neutral"
            placeholder="Enter your password"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="xl"
                :icon="
                  inputType === 'password'
                    ? 'mdi:eye-outline'
                    : 'mdi:eye-off-outline'
                "
                @click.stop="changeInputType"
              />
            </template>
          </UInput>
        </UFormField>
        <UButton
          size="lg"
          label="Login"
          class="mt-2 w-full cursor-pointer justify-center bg-blue-600 hover:bg-blue-700 active:scale-99"
          color="neutral"
          @click.stop="login"
        />
      </div>
    </div>
  </form>
</template>
