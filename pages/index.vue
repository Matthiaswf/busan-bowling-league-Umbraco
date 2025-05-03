<script setup>
const { get } = useApi();
const posts = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  console.log('Fetched from Umbraco:', data);
  posts.value = data?.items || [];
});
</script>

<template>
  <section class="page-section">
    <h2 class="section-title">Latest Posts</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded shadow p-4"
      >
        <h3 class="text-lg font-bold mb-2">{{ post.name }}</h3>
        <p class="text-gray-600">{{ post.properties.title }}</p>
      </div>
    </div>
  </section>

  <section class="page-section">
    <h2 class="section-title">Current Standings</h2>
    <div class="bg-white rounded shadow p-4">Standings Table (placeholder)</div>
  </section>

  <section class="page-section">
    <h2 class="section-title">Teams</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded shadow p-4 text-center">Team A</div>
      <div class="bg-white rounded shadow p-4 text-center">Team B</div>
      <div class="bg-white rounded shadow p-4 text-center">Team C</div>
      <div class="bg-white rounded shadow p-4 text-center">Team D</div>
    </div>
  </section>

  <section class="page-section text-center">
    <NuxtLink to="/standings" class="btn-primary">
      View Full Standings & Schedule →
    </NuxtLink>
  </section>
</template>
