<template>
  <div
    class="relative bottom-5 mx-auto w-[70%] rounded-lg bg-gray-50 p-4 shadow-lg"
  >
    <div class="relative h-auto w-1/2 bg-blue-50">
      <img
        class="absolute top-4 left-4 h-auto w-1/12 object-cover"
        src="/public/img/logo-black.png"
      />
    </div>
    <h2
      class="mb-2 w-full text-center text-3xl font-bold break-words text-black sm:text-4xl md:text-5xl"
    >
      {{ title }}
    </h2>
    <p v-if="dateCreated" class="text-center text-sm text-gray-500">
      {{ formattedDate }}
    </p>
    <div class="prose v-html-wrapper max-w-none" v-html="sanitizedContent" />

    <div v-if="loggedIn" class="absolute top-2 right-2 flex gap-2">
      <UButton
        icon="typcn:pencil"
        class="cursor-pointer bg-blue-500 text-lg text-gray-900 hover:bg-blue-600"
        @click="emits('edit', id)"
      />
      <UButton
        icon="typcn:delete"
        class="cursor-pointer bg-red-500 text-lg text-gray-900 hover:bg-red-600"
        @click="emits('delete', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'

const emits = defineEmits(['edit', 'delete'])

const props = defineProps<{
  id: number
  title: string
  content: string
  dateCreated?: string
  photos: string[]
}>()

const sanitizedContent = computed(() => DOMPurify.sanitize(props.content))

const formattedDate = computed(() => {
  if (!props.dateCreated) return ''
  const date = new Date(props.dateCreated)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const loggedIn = useState('loggedIn')
</script>
<style>
.v-html-wrapper img {
  max-width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  margin: auto;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: block;
}

.v-html-wrapper * {
  max-width: 100%;
  box-sizing: border-box;
  word-break: break-word;
}

.v-html-wrapper img,
.v-html-wrapper pre,
.v-html-wrapper iframe {
  max-width: 100%;
  overflow-x: auto;
}

.v-html-wrapper img.align-left {
  margin-left: 0;
  margin-right: auto;
  display: block;
}

.v-html-wrapper img.align-right {
  margin-left: auto;
  margin-right: 0;
  display: block;
}

.v-html-wrapper img.align-center {
  margin-left: auto;
  margin-right: auto;
  display: block;
}

.v-html-wrapper table {
  width: 100%;
  border-collapse: collapse;
  object-fit: contain;
  max-width: 100%;
  min-width: 100%;
  table-layout: auto;
}

.v-html-wrapper th,
td {
  border: 1px solid #000000;
  padding: 0.5rem;
  word-break: break-word;
  white-space: normal;
  vertical-align: top;
  padding: 0.5rem;
}

.v-html-wrapper thead {
  background-color: #f0f0f0;
}
</style>
