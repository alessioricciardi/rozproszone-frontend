<script setup lang="ts">
const sortedArticles = computed(() => {
  return [...props.articles].sort((a, b) => {
    return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  })
})

const props = defineProps<{
  articles: any[]
}>()
defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="space-y-10">
    <BulletinArticle
      v-for="article in sortedArticles"
      :key="article.id"
      v-bind="article"
      class="article"
      @edit="$emit('edit', article.id)"
      @delete="$emit('delete', article.id)"
    />
  </div>
</template>
