<script setup>
import { useRoute } from 'vue-router';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { formatDate } from '@/utils/formatDate';

const route = useRoute();
const league = useLeagueStore();

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
});

const postsFolderId = computed(
  () =>
    league.items.find((i) => i.contentType?.toLowerCase() === 'postsfolder')?.id
);

const post = computed(() => {
  return league.items.find(
    (p) =>
      p.contentType === 'post' &&
      p.route?.startItem?.id === postsFolderId.value &&
      p.name.toLowerCase().replace(/\s+/g, '-') ===
        route.params.slug.toLowerCase()
  );
});
</script>

<template>
  <section v-if="post" class="page-section">
    <div class="max-w-3xl mx-auto">
      <img
        v-if="post.properties.mainImage?.[0]?.url"
        :src="`http://localhost:64203${post.properties.mainImage[0].url}`"
        alt="Post Image"
        class="w-full h-60 object-cover rounded-xl mb-6"
      />

      <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ post.name }}</h1>

      <p class="text-sm text-gray-500 mb-6">
        Published: {{ formatDate(post.properties.publishedDate) }}
      </p>

      <div
        v-if="post.properties.content?.markup"
        v-html="post.properties.content.markup"
        class="prose prose-sm sm:prose lg:prose-lg max-w-none"
      />
    </div>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Post not found.</p>
  </section>
</template>
