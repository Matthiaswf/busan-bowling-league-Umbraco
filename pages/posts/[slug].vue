<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();

const { get } = useApi();
const post = ref(null);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  const items = data?.items || [];
  post.value = items.find(
    (p) => p.properties.slug?.toLowerCase() === route.params.slug.toLowerCase()
  );
});
</script>

<template>
  <section class="page-section" v-if="post">
    <h1 class="text-3xl font-bold mb-4">{{ post.name }}</h1>
    <p class="text-gray-600">{{ post.properties.title }}</p>
    <!-- Add content fields here later -->
  </section>

  <section class="page-section text-center" v-else>
    <p class="text-gray-400">Post not found.</p>
  </section>
</template>
