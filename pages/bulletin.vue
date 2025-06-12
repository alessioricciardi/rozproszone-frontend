<script setup lang="ts">
import ArticleEditor from '~/components/Bulletin/ArticleEditor.vue'
import ArticleList from '~/components/Bulletin/ArticleList.vue'
const API_URL = useRuntimeConfig().public.API_URL

const articleEditorRef = ref<InstanceType<typeof ArticleEditor> | null>(null)

interface Article {
  id: number
  title: string
  content: string
  dateCreated?: string
}

const loggedIn = useState('loggedIn')
const articles = ref<Article[]>([])
const currentPage = ref(1)
const pageSize = 5
const totalPages = ref(1)
const toast = useToast()

async function fetchArticles() {
  try {
    const response = await $fetch(`${API_URL}/api/bulletin`, {
      query: {
        page: currentPage.value,
        pageSize,
      },
    })

    articles.value = response.items
    totalPages.value = response.totalPages
  } catch {
    toast.add({
      title: 'Error',
      description: 'Something went wrong',
      color: 'error',
    })
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchArticles()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchArticles()
  }
}

function handleSubmitted() {
  currentPage.value = 1
  fetchArticles()
  resetEditor()
}

function editArticle(id: number) {
  const article = articles.value.find((a) => a.id === id)
  if (article && articleEditorRef.value) {
    articleEditorRef.value.startEditing(article)
  }
}

function deleteFromList(id: number) {
  articleEditorRef.value?.deleteArticleById(id)
}

function resetEditor() {
  currentPage.value = 1
  fetchArticles()
}

onMounted(fetchArticles)
</script>

<template>
  <div>
    <div class="my-20 text-center text-8xl font-bold text-gray-900">
      Bulletin
    </div>

    <ArticleEditor
      v-if="loggedIn"
      ref="articleEditorRef"
      @submitted="handleSubmitted"
      @cancel="resetEditor"
    />

    <ArticleList
      :articles="articles"
      @edit="editArticle"
      @delete="deleteFromList"
    />

    <!-- Paginacja -->
    <div class="my-8 flex items-center justify-center gap-4">
      <button
        :disabled="currentPage === 1"
        class="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
        @click="prevPage"
      >
        Poprzednia
      </button>

      <span>Strona {{ currentPage }} z {{ totalPages }}</span>

      <button
        :disabled="currentPage === totalPages"
        class="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
        @click="nextPage"
      >
        Następna
      </button>
    </div>
  </div>
</template>

<style scoped>
input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
}

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

.output-group {
  margin-top: 2rem;
}

code {
  background-color: #f3f3f3;
  padding: 0.5rem;
  display: block;
  white-space: pre-wrap;
}
</style>
