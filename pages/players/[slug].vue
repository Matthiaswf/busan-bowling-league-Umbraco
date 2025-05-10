<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
const { get } = useApi();

const player = ref(null);
const allWeeks = ref([]);
const allPlayers = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  player.value = items.find(
    (p) =>
      p.contentType === 'player' &&
      p.name.toLowerCase().replace(/\s+/g, '-') ===
        route.params.slug.toLowerCase()
  );

  allWeeks.value = items.filter((i) => i.contentType === 'week');

  const playersFolder = items.find((i) => i.contentType === 'playersFolder');
  if (playersFolder) {
    allPlayers.value = items.filter(
      (p) =>
        p.contentType === 'player' &&
        p.route?.startItem?.id === playersFolder.id
    );
  }
});

const recentMatches = computed(() => {
  if (!player.value) return [];

  const teamId = player.value.properties.team?.[0]?.id;
  if (!teamId) return [];

  const matches = [];

  for (const week of allWeeks.value) {
    const matchItems = week.properties.matches?.items || [];

    for (const match of matchItems) {
      const props = match.content?.properties;
      const games = props?.games?.items || [];
      const home = props?.homeTeam?.[0];
      const away = props?.awayTeam?.[0];

      if (!home || !away || !games.length) continue;

      // Only push matches where player participated
      const participated = games.some((game) =>
        (game.content?.properties?.playerScores?.items || []).some(
          (score) =>
            score.content?.properties?.player?.[0]?.id === player.value.id
        )
      );

      if (!participated) continue;

      let homeWins = 0;
      let awayWins = 0;

      for (const game of games) {
        let homeTotal = 0;
        let awayTotal = 0;
        const scores = game.content?.properties?.playerScores?.items || [];

        for (const s of scores) {
          const props = s.content?.properties;
          const score = props?.score || 0;
          const playerId = props?.player?.[0]?.id;
          const fullPlayer = allPlayers.value.find((p) => p.id === playerId);
          const playerTeam = fullPlayer?.properties?.team?.[0]?.id;

          if (playerTeam === home.id) homeTotal += score;
          else if (playerTeam === away.id) awayTotal += score;
        }

        if (homeTotal > awayTotal) homeWins++;
        else if (awayTotal > homeTotal) awayWins++;
      }

      matches.push({
        home,
        away,
        homeWins,
        awayWins,
      });
    }
  }

  return matches.slice(0, 3);
});

const playerStats = computed(() => {
  let games = 0;
  let totalPoints = 0;

  for (const match of allWeeks.value) {
    const matchItems = match.properties.matches?.items || [];

    for (const m of matchItems) {
      const gamesList = m.content?.properties?.games?.items || [];

      for (const g of gamesList) {
        const scores = g.content?.properties?.playerScores?.items || [];

        for (const s of scores) {
          const props = s.content?.properties;
          if (props?.player?.[0]?.id === player.value?.id) {
            totalPoints += props.score || 0;
            games++;
          }
        }
      }
    }
  }

  return {
    gamesPlayed: games,
    totalPoints,
    averageScore: games ? (totalPoints / games).toFixed(1) : '0',
  };
});
</script>

<template>
  <section class="page-section" v-if="player">
    <div class="flex flex-col items-center text-center">
      <div
        class="w-36 h-36 rounded-full overflow-hidden border-4 border-gradient ring ring-offset-2 ring-gray-300 mb-4 shadow-md"
      >
        <img
          v-if="player.properties.avatar?.[0]?.url"
          :src="`http://localhost:64203${player.properties.avatar[0].url}`"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-1">{{ player.name }}</h1>
      <p class="text-base text-gray-600">
        {{ player.properties.position?.[0]?.name || 'No position' }}
      </p>
    </div>

    <div
      v-if="player.properties.bio"
      v-html="player.properties.bio.markup"
      class="prose prose-sm sm:prose-base mx-auto my-8"
    ></div>

    <!-- Stats Section -->
    <div class="mt-10 w-full flex justify-center">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
        <div class="bg-white rounded-xl border p-6 shadow-sm">
          <div class="text-2xl font-bold text-gray-900">
            {{ playerStats.gamesPlayed }}
          </div>
          <div class="text-gray-600 mt-1">Games Played</div>
        </div>
        <div class="bg-white rounded-xl border p-6 shadow-sm">
          <div class="text-2xl font-bold text-gray-900">
            {{ playerStats.averageScore }}
          </div>
          <div class="text-gray-600 mt-1">Avg Score</div>
        </div>
      </div>
    </div>

    <!-- Recent Matches -->
    <section v-if="recentMatches.length" class="mt-12 w-full">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Recent Matches
      </h2>
      <ul class="space-y-3 max-w-2xl mx-auto w-full px-4">
        <li
          v-for="(match, index) in recentMatches"
          :key="index"
          class="bg-gray-50 rounded-xl p-4 flex items-center justify-between shadow-sm"
        >
          <span class="font-medium text-gray-700 w-1/3 text-left truncate">
            {{ match.home.name }}
          </span>
          <span class="font-semibold text-lg whitespace-nowrap">
            {{ match.homeWins }} - {{ match.awayWins }}
          </span>
          <span class="font-medium text-gray-700 w-1/3 text-right truncate">
            {{ match.away.name }}
          </span>
        </li>
      </ul>
    </section>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Player not found.</p>
  </section>
</template>
