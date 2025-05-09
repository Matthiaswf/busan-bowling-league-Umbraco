<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();

const { get } = useApi();
const player = ref(null);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  player.value = items.find(
    (p) =>
      p.contentType === 'player' &&
      p.name.toLowerCase().replace(/ /g, '-') ===
        route.params.slug.toLowerCase()
  );
});
</script>

<template>
  <section class="page-section" v-if="player">
    <img
      v-if="player.properties.avatar?.[0]?.url"
      :src="`http://localhost:64203${player.properties.avatar[0].url}`"
      alt="Avatar"
      class="w-24 h-24 object-cover rounded-full mb-4"
    />
    <h1 class="text-2xl font-bold mb-2">{{ player.name }}</h1>
    <p class="text-gray-500 mb-4">{{ player.properties.position }}</p>
    <div
      v-if="player.properties.bio"
      v-html="player.properties.bio.markup"
      class="prose"
    ></div>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Player not found.</p>
  </section>
</template>
