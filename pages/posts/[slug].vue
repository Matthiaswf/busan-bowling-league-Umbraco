<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
const { get } = useApi();

const post = ref(null);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  // Find the posts folder
  const postsFolder = items.find((i) => i.contentType === 'postsFolder');

  if (!postsFolder) return;

  // Find the post inside the folder that matches the slug
  post.value = items.find(
    (p) =>
      p.contentType === 'post' &&
      p.route?.startItem?.id === postsFolder.id &&
      p.name.toLowerCase().replace(/\s+/g, '-') ===
        route.params.slug.toLowerCase()
  );
});
</script>

<template>
  <section class="page-section" v-if="post">
    <h1 class="text-2xl font-bold mb-2">{{ post.name }}</h1>
    <div class="prose" v-html="post.properties.content?.markup"></div>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Post not found.</p>
  </section>
</template>
