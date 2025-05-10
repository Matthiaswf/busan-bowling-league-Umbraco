<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();

const { get } = useApi();
const player = ref(null);
const allWeeks = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  // Find this player
  player.value = items.find(
    (p) =>
      p.contentType === 'player' &&
      p.name.toLowerCase().replace(/ /g, '-') ===
        route.params.slug.toLowerCase()
  );

  // Load all weeks
  allWeeks.value = items.filter((i) => i.contentType === 'week');
});

const playerGames = computed(() => {
  if (!player.value) return [];

  return allWeeks.value.flatMap((week) =>
    (week.properties.matches?.items || []).filter((match) => {
      const game = match.content?.properties;
      if (!game) return false;
      const homeId = game.homeTeam?.[0]?.id;
      const awayId = game.awayTeam?.[0]?.id;
      return (
        homeId === player.value.properties.team?.[0]?.id ||
        awayId === player.value.properties.team?.[0]?.id
      );
    })
  );
});

const playerStats = computed(() => {
  let games = 0;
  let points = 0;

  for (const match of playerGames.value) {
    const game = match.content?.properties;
    if (!game) continue;

    const teamId = player.value?.properties.team?.[0]?.id;
    if (!teamId) continue;

    const isHome = game.homeTeam?.[0]?.id === teamId;
    const isAway = game.awayTeam?.[0]?.id === teamId;

    if (isHome || isAway) {
      games += 1;
      points += isHome ? game.homeScore : game.awayScore;
    }
  }

  const average = games > 0 ? (points / games).toFixed(1) : '0';

  return {
    gamesPlayed: games,
    totalPoints: points,
    averageScore: average,
  };
});
const recentGames = computed(() => {
  return playerGames.value.slice(0, 3); // latest 3 games
});
</script>

<template>
  <section class="page-section" v-if="player">
    <div class="text-center">
      <img
        v-if="player.properties.avatar?.[0]?.url"
        :src="`http://localhost:64203${player.properties.avatar[0].url}`"
        alt="Avatar"
        class="w-24 h-24 object-cover rounded-full mx-auto mb-4"
      />
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ player.name }}</h1>
      <p class="text-sm text-gray-500 mb-1">
        {{ player.properties.position?.[0]?.name || 'No position' }}
      </p>
    </div>

    <div
      v-if="player.properties.bio"
      v-html="player.properties.bio.markup"
      class="prose mx-auto my-6"
    ></div>

    <!-- Stats Section -->
    <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-center">
      <div class="bg-blue-50 rounded p-4 shadow">
        <div class="font-bold text-lg">{{ playerStats.gamesPlayed }}</div>
        <div class="text-gray-600">Games Played</div>
      </div>
      <div class="bg-blue-50 rounded p-4 shadow">
        <div class="font-bold text-lg">{{ playerStats.averageScore }}</div>
        <div class="text-gray-600">Avg. Points</div>
      </div>
      <div class="bg-blue-50 rounded p-4 shadow">
        <div class="font-bold text-lg">{{ playerStats.totalPoints }}</div>
        <div class="text-gray-600">Total Points</div>
      </div>
    </div>

    <section v-if="recentGames.length" class="mt-10">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Matches</h2>
      <ul class="space-y-2 text-sm">
        <li
          v-for="(match, index) in recentGames"
          :key="index"
          class="bg-gray-50 rounded p-3 flex justify-between items-center shadow-sm"
        >
          <span class="text-gray-700">
            {{ match.content.properties.homeTeam?.[0]?.name || '—' }}
            {{ match.content.properties.homeScore }} -
            {{ match.content.properties.awayScore }}
            {{ match.content.properties.awayTeam?.[0]?.name || '—' }}
          </span>
        </li>
      </ul>
    </section>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Player not found.</p>
  </section>
</template>
