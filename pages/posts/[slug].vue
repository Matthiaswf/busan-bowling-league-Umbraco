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
      <!-- Hero image -->
      <img
        v-if="post.properties.mainImage?.[0]?.url"
        :src="`http://localhost:64203${post.properties.mainImage[0].url}`"
        alt="Post Image"
        class="w-full h-64 object-cover rounded-xl mb-8 shadow"
      />

      <!-- Title -->
      <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-2">
        {{ post.name }}
      </h1>

      <!-- Date -->
      <p v-if="post.createDate" class="text-sm text-gray-500 text-center mb-8">
        {{
          new Date(post.createDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </p>

      <!-- Rich content -->
      <div
        v-if="post.properties.content?.markup"
        class="prose prose-lg max-w-none mx-auto"
        v-html="post.properties.content.markup"
      />
    </div>
  </section>

  <section v-else class="page-section text-center text-gray-400">
    <p class="text-lg">🪵 Post not found.</p>
  </section>
</template>
