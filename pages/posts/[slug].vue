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
  <section v-if="post" class="page-section">
    <div class="max-w-3xl mx-auto">
      <h1 class="post-title text-center">{{ post.name }}</h1>

      <p v-if="post.createDate" class="text-sm text-gray-500 text-center mb-6">
        {{
          new Date(post.createDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </p>

      <div
        class="prose prose-lg mx-auto"
        v-html="post.properties.content?.markup"
      ></div>
    </div>
  </section>

  <section v-else class="page-section text-center text-gray-400">
    <p class="text-lg">🪵 Post not found.</p>
  </section>
</template>
