<script setup>
const { get } = useApi();
const posts = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  posts.value = items.filter((item) => item.contentType === 'post');
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title">Latest Posts</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded shadow p-4"
      >
        <NuxtLink
          :to="`/posts/${post.name.toLowerCase().replace(/\s+/g, '-')}`"
          class="text-lg font-bold mb-2 text-blue-700 hover:underline block"
        >
          {{ post.name }}
        </NuxtLink>

        <p class="text-sm text-gray-500">
          {{ new Date(post.properties.publishedDate).toLocaleDateString() }}
        </p>
        <p
          class="text-gray-600 mt-2"
          v-html="post.properties.content?.markup"
        ></p>
      </div>
    </div>
  </section>
</template>
