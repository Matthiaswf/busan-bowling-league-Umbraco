<script setup>
import { useLeagueStore } from '@/stores/useLeagueStore';
import { formatDate } from '@/utils/formatDate';

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

const posts = computed(() =>
  league.items
    .filter(
      (i) =>
        i?.contentType === 'post' &&
        i.route?.startItem?.id === postsFolderId.value
    )
    .sort(
      (a, b) =>
        new Date(b.properties.publishedDate).getTime() -
        new Date(a.properties.publishedDate).getTime()
    )
);

const showScrollTop = ref(false);
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', () => {
    showScrollTop.value = window.scrollY > 300;
  });
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title mb-6">All Posts</h1>
    <div class="space-y-6">
      <NuxtLink
        v-for="post in posts"
        :key="post.id"
        :to="`/posts/${post.name.toLowerCase().replace(/\s+/g, '-')}`"
        class="block bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
      >
        <img
          v-if="post.properties.mainImage?.[0]?.url"
          :src="`http://localhost:64203${post.properties.mainImage[0].url}`"
          alt="Post Image"
          class="w-full h-48 object-cover"
        />
        <div class="p-6 space-y-2">
          <h2 class="text-xl font-semibold text-gray-800">{{ post.name }}</h2>
          <p class="text-gray-400 text-sm">
            {{ formatDate(post.properties.publishedDate) }}
          </p>
          <div
            v-if="post.properties.content?.markup"
            v-html="post.properties.content.markup"
            class="text-gray-600 text-sm line-clamp-3"
          />
        </div>
      </NuxtLink>
    </div>
    <button
      v-show="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-14 left-1/2 transform -translate-x-1/2 z-50 btn-primary"
    >
      ↑ Top
    </button>
  </section>
</template>
