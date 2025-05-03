<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();

const { get } = useApi();
const team = ref(null);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  const items = data?.items || [];

  team.value = items.find(
    (t) => t.properties.slug?.toLowerCase() === route.params.slug.toLowerCase()
  );
});
</script>

<template>
  <section class="page-section" v-if="team">
    <img
      v-if="team.properties.logo"
      :src="`http://localhost:64203${team.properties.logo[0]?.url}`"
      alt="Team Logo"
      class="w-24 h-24 object-contain mb-4"
    />
    <h1 class="post-title">{{ team.properties.teamName }}</h1>
    <p class="post-body">{{ team.properties.bio }}</p>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Team not found.</p>
  </section>
</template>
