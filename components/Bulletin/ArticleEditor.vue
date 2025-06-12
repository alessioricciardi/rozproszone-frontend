<template>
  <div>
    <div class="my-10 text-center text-5xl font-bold text-gray-900">
      <button class="btn btn-wide mb-4" @click="toggleEditor">
        {{
          showEditor
            ? 'Ukryj edytor'
            : isEditing
              ? 'Edytuj artykuł'
              : 'Dodaj nowy artykuł'
        }}
      </button>
    </div>

    <div
      v-show="showEditor"
      class="editor-container mx-auto mb-6 w-[70%] rounded border p-4 shadow"
    >
      <input
        v-model="title"
        placeholder="Tytuł bloga"
        class="mb-4 w-full rounded border px-2 py-1"
      />
      <TiptapEditor ref="editorRef" v-model="content" :show-image="true" />

      <div class="mt-4 flex gap-4">
        <button
          class="rounded bg-blue-500 px-4 py-2 text-white"
          @click="saveArticle"
        >
          {{ isEditing ? 'Zapisz zmiany' : 'Wyślij bloga' }}
        </button>
        <button class="rounded bg-gray-300 px-4 py-2" @click="cancelEdit">
          Anuluj
        </button>
        <button
          v-if="isEditing"
          class="ml-auto rounded bg-red-500 px-4 py-2 text-white"
          @click="deleteArticleById(editingId)"
        >
          Usuń artykuł
        </button>
      </div>

      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TiptapEditor } from '#components'

interface EditorData {
  html: string
  images: string[]
}

interface Article {
  id: number
  title: string
  content: EditorData
  dateCreated?: string
}

const props = defineProps<{
  article?: Article
}>()

const emit = defineEmits<{
  (e: 'submitted' | 'cancel'): void
}>()

const title = ref('')
const showEditor = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const API_URL = useRuntimeConfig().public.API_URL
const editorRef = ref()
const toast = useToast()
const content = ref<EditorData>({
  html: '',
  images: [],
})
const loggedIn = useState('loggedIn')

watch(
  () => props.article,
  (newArticle) => {
    if (newArticle) {
      title.value = newArticle.title
      content.value = {
        html: newArticle.content.html,
        images: [...newArticle.content.images],
      }
      editingId.value = newArticle.id
      isEditing.value = true
      showEditor.value = true
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

watch(
  content,
  (newVal) => {
    console.log('content changed:', newVal)
  },
  { deep: true },
)

function toggleEditor() {
  showEditor.value = !showEditor.value
  if (!showEditor.value) resetForm()
}

async function saveArticle() {
  if (!loggedIn) {
    alert('Musisz być zalogowany, aby zapisać artykuł.')
    return
  }

  if (!title.value.trim()) {
    alert('Tytuł artykułu nie może być pusty.')
    return
  }

  const payload = {
    title: title.value,
    content: content.value.html,
    photoFileNames: [...content.value.images],
  }

  try {
    if (isEditing.value && editingId.value !== null) {
      await $fetch(`${API_URL}/api/bulletin/${editingId.value}`, {
        method: 'PUT',
        body: payload,
        credentials: 'include',
      })

      toast.add({
        title: 'Success',
        description: 'Successfully edited',
        color: 'success',
      })
    } else {
      await $fetch(`${API_URL}/api/bulletin`, {
        method: 'POST',
        body: payload,
        credentials: 'include',
      })
      toast.add({
        title: 'Success',
        description: 'Article has been successfully uploaded',
        color: 'success',
      })
    }

    emit('submitted')
    resetForm()
    showEditor.value = false
  } catch {
    toast.add({
      title: 'Error',
      description: 'Something went wrong pleas try again',
      color: 'error',
    })
  }
}

function startEditing(article: Article) {
  title.value = article.title
  content.value = {
    html:
      typeof article.content === 'string'
        ? article.content
        : article.content.html,
    images: Array.isArray(article.content.images)
      ? [...article.content.images]
      : [],
  }
  editingId.value = article.id
  isEditing.value = true
  showEditor.value = true
}

defineExpose({
  startEditing,
  deleteArticleById,
})

async function deleteArticleById(id: number | null) {
  if (!id || !confirm('Na pewno chcesz usunąć ten artykuł?')) return

  try {
    await $fetch(`${API_URL}/api/bulletin/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    toast.add({
      title: 'Success',
      description: 'Article has beenn succesfully delated',
      color: 'success',
    })

    emit('submitted')
    if (editingId.value === id) resetForm()
    showEditor.value = false
  } catch {
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się usunąć artykułu.',
      color: 'error',
    })
  }
}

function cancelEdit() {
  emit('cancel')
  resetForm()
  showEditor.value = false
}

function resetForm() {
  title.value = ''
  content.value = { html: '', images: [] }
  editingId.value = null
  isEditing.value = false
}
</script>

<style scoped>
button {
  margin-bottom: 1px;
  padding: 20px;
  border: 2px solid black;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
  background-color: gray;
}
</style>
