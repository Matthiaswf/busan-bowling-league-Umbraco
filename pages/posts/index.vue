<script setup>
const { get } = useApi();
const posts = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  // Find Posts folder by contentType
  const postsFolder = items.find((i) => i.contentType === 'postsFolder');

  if (postsFolder) {
    posts.value = items
      .filter(
        (i) =>
          i.contentType === 'post' && i.route?.startItem?.id === postsFolder.id
      )
      .sort(
        (a, b) =>
          new Date(b.properties.publishedDate) -
          new Date(a.properties.publishedDate)
      );
  }
});

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
        <!-- Image -->
        <img
          v-if="post.properties.mainImage?.[0]?.url"
          :src="`http://localhost:64203${post.properties.mainImage[0].url}`"
          alt="Post Image"
          class="w-full h-48 object-cover"
        />

        <!-- Text content -->
        <div class="p-6 space-y-2">
          <h2 class="text-xl font-semibold text-gray-800">{{ post.name }}</h2>
          <p class="text-gray-400 text-sm">
            {{
              new Date(post.properties.publishedDate).toLocaleDateString(
                'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' }
              )
            }}
          </p>
          <div
            v-if="post.properties.content?.markup"
            v-html="post.properties.content.markup"
            class="text-gray-600 text-sm line-clamp-3"
          />
        </div>
      </NuxtLink>
    </div>
    <!-- Scroll to Top Button -->
    <button
      v-show="showScrollTop"
      @click="scrollToTop"
      class="fixed bottom-14 left-1/2 transform -translate-x-1/2 z-50 btn-primary"
    >
      ↑ Top
    </button>
  </section>
</template>
