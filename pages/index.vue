<script setup>
const { get } = useApi();
const posts = ref([]);
const teams = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  const items = data?.items || [];

  posts.value = items.filter((item) => item.contentType === 'post');
  teams.value = items.filter((item) => item.contentType === 'team');
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
        <NuxtLink
          :to="`/posts/${post.name.toLowerCase().replace(/ /g, '-')}`"
          class="text-lg font-bold mb-2 text-blue-700 hover:underline block"
        >
          {{ post.name }}
        </NuxtLink>

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
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="team in teams"
        :key="team.id"
        class="bg-white rounded shadow p-4 text-center"
      >
        <img
          v-if="team.properties.logo"
          :src="`http://localhost:64203${team.properties.logo[0]?.url}`"
          alt="Team Logo"
          class="w-20 h-20 object-contain mx-auto mb-2"
        />

        <NuxtLink
          :to="`/teams/${team.name.toLowerCase().replace(/ /g, '-')}`"
          class="text-lg font-bold mb-1 text-blue-700 hover:underline block"
        >
          {{ team.name }}
        </NuxtLink>

        <p class="text-gray-500 text-sm">{{ team.properties.bio }}</p>
      </div>
    </div>
  </section>

  <section class="page-section text-center">
    <NuxtLink to="/players" class="btn-primary"> View All Players → </NuxtLink>
  </section>

  <section class="page-section text-center">
    <NuxtLink to="/standings" class="btn-primary">
      View Full Standings & Schedule →
    </NuxtLink>
  </section>
</template>
