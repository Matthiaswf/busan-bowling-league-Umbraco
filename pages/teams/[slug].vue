<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();

const { get } = useApi();
const team = ref(null);
const allPlayers = ref([]);
const teamPlayers = computed(() =>
  allPlayers.value.filter((p) => p.properties.team?.[0]?.id === team.value?.id)
);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  team.value = items.find(
    (t) =>
      t.contentType === 'team' &&
      t.name.toLowerCase().replace(/ /g, '-') ===
        route.params.slug.toLowerCase()
  );

  const playersFolder = items.find((i) => i.contentType === 'playersFolder');

  if (playersFolder) {
    allPlayers.value = items.filter(
      (p) =>
        p.contentType === 'player' &&
        p.route?.startItem?.id === playersFolder.id
    );
  }
});
</script>

<template>
  <section class="page-section overflow-x-hidden" v-if="team">
    <img
      v-if="team.properties.logo"
      :src="`http://localhost:64203${team.properties.logo[0]?.url}`"
      alt="Team Logo"
      class="w-24 h-24 object-contain mb-4"
    />
    <h1 class="post-title">{{ team.name }}</h1>
    <p class="post-body">{{ team.properties.bio }}</p>
    <div class="mt-6 grid grid-cols-2 gap-4 text-sm text-center">
      <div class="bg-gray-100 rounded p-4">
        <div class="font-bold text-lg">{{ team.properties.gamesPlayed }}</div>
        <div class="text-gray-500">Games Played</div>
      </div>
      <div class="bg-gray-100 rounded p-4">
        <div class="font-bold text-lg">{{ team.properties.wins }}</div>
        <div class="text-gray-500">Wins</div>
      </div>
      <div class="bg-gray-100 rounded p-4">
        <div class="font-bold text-lg">{{ team.properties.losses }}</div>
        <div class="text-gray-500">Losses</div>
      </div>
      <div class="bg-gray-100 rounded p-4">
        <div class="font-bold text-lg">{{ team.properties.points }}</div>
        <div class="text-gray-500">Points</div>
      </div>
    </div>
  </section>

  <!-- Players Section -->
  <div
    class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10 w-full overflow-hidden"
  >
    <NuxtLink
      v-for="player in teamPlayers"
      :key="player.id"
      :to="`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`"
      class="bg-gray-100 rounded p-3 text-center hover:bg-gray-200 transition"
    >
      <img
        v-if="player.properties.avatar?.[0]?.url"
        :src="`http://localhost:64203${player.properties.avatar[0].url}`"
        alt="Avatar"
        class="w-16 h-16 object-cover rounded-full mx-auto mb-2"
      />
      <p class="font-bold">{{ player.name }}</p>
      <p class="text-sm text-gray-500">{{ player.properties.position }}</p>
    </NuxtLink>
  </div>

  <section
    v-if="team && teamPlayers.length === 0"
    class="page-section text-center mt-8"
  >
    <p class="text-gray-400">No players found for this team.</p>
  </section>
</template>
