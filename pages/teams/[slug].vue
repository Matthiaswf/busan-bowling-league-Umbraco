<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
const { get } = useApi();

const team = ref(null);
const allPlayers = ref([]);
const weeks = ref([]);

const teamPlayers = computed(() =>
  allPlayers.value.filter((p) => p.properties.team?.[0]?.id === team.value?.id)
);

const teamStats = computed(() => {
  const stats = { gamesPlayed: 0, wins: 0, losses: 0, points: 0 };

  for (const week of weeks.value) {
    const matches = week.properties.matches?.items || [];

    for (const match of matches) {
      const props = match.content?.properties;
      const home = props?.homeTeam?.[0]?.id;
      const away = props?.awayTeam?.[0]?.id;
      const games = props?.games?.items || [];

      if (!home || !away || !games.length) continue;
      if (home !== team.value?.id && away !== team.value?.id) continue;

      stats.gamesPlayed += games.length;

      let homeWins = 0;
      let awayWins = 0;

      for (const game of games) {
        const scores = game.content?.properties?.playerScores?.items || [];
        let homeTotal = 0;
        let awayTotal = 0;

        for (const score of scores) {
          const s = score.content?.properties;
          const playerId = s?.player?.[0]?.id;
          const fullPlayer = allPlayers.value.find((p) => p.id === playerId);
          const teamId = fullPlayer?.properties?.team?.[0]?.id;
          const pts = s?.score || 0;

          if (teamId === home) homeTotal += pts;
          else if (teamId === away) awayTotal += pts;
        }

        if (homeTotal > awayTotal) homeWins++;
        else if (awayTotal > homeTotal) awayWins++;
      }

      if (home === team.value?.id) {
        if (homeWins > awayWins) {
          stats.wins++;
          stats.points++;
        } else if (awayWins > homeWins) {
          stats.losses++;
        }
      } else {
        if (awayWins > homeWins) {
          stats.wins++;
          stats.points++;
        } else if (homeWins > awayWins) {
          stats.losses++;
        }
      }
    }
  }

  return stats;
});

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];
  weeks.value = items.filter((i) => i.contentType === 'week');

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

const allMatches = computed(() => {
  const matches = [];

  for (const item of weeks.value) {
    const games = item.properties.matches?.items || [];
    for (const g of games) {
      const props = g.content?.properties;
      if (!props) continue;

      const home = props.homeTeam?.[0];
      const away = props.awayTeam?.[0];
      const individualGames = props.games?.items || [];

      if (!home || !away || !individualGames.length) continue;

      let homeWins = 0;
      let awayWins = 0;

      for (const game of individualGames) {
        const scores = game.content?.properties?.playerScores?.items || [];
        let homeTotal = 0;
        let awayTotal = 0;

        for (const score of scores) {
          const s = score.content?.properties;
          const playerId = s?.player?.[0]?.id;
          const fullPlayer = allPlayers.value.find((p) => p.id === playerId);
          const teamId = fullPlayer?.properties?.team?.[0]?.id;
          const pts = s?.score || 0;

          if (teamId === home.id) homeTotal += pts;
          else if (teamId === away.id) awayTotal += pts;
        }

        if (homeTotal > awayTotal) homeWins++;
        else if (awayTotal > homeTotal) awayWins++;
      }

      matches.push({
        home,
        away,
        homeScore: homeWins,
        awayScore: awayWins,
      });
    }
  }

  return matches;
});
</script>

<template>
  <section v-if="team" class="page-section overflow-x-hidden">
    <!-- Team Header -->
    <div class="text-center mb-6">
      <img
        v-if="team.properties.logo"
        :src="`http://localhost:64203${team.properties.logo[0]?.url}`"
        alt="Team Logo"
        class="w-24 h-24 object-contain mx-auto mb-4"
      />
      <h1 class="post-title">{{ team.name }}</h1>
      <div
        class="text-gray-600 text-sm max-w-2xl mx-auto"
        v-html="team.properties.bio?.markup"
      ></div>
    </div>

    <!-- Team Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-center mt-6">
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ teamStats.gamesPlayed }}</div>
        <div class="text-gray-600">Games Played</div>
      </div>
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ teamStats.wins }}</div>
        <div class="text-gray-600">Wins</div>
      </div>
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ teamStats.losses }}</div>
        <div class="text-gray-600">Losses</div>
      </div>
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ teamStats.points }}</div>
        <div class="text-gray-600">Points</div>
      </div>
    </div>

    <!-- Players Section -->
    <section v-if="teamPlayers.length" class="mt-10">
      <h2 class="text-xl font-semibold text-center text-gray-800 mb-6">
        Players
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="player in teamPlayers"
          :key="player.id"
          :to="`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`"
          class="bg-white rounded p-4 text-center shadow hover:shadow-md transition"
        >
          <img
            v-if="player.properties.avatar?.[0]?.url"
            :src="`http://localhost:64203${player.properties.avatar[0].url}`"
            alt="Avatar"
            class="w-16 h-16 object-cover rounded-full mx-auto mb-2"
          />
          <p class="font-bold nav-link text-base">{{ player.name }}</p>
          <p class="text-sm text-gray-500">
            {{ player.properties.position?.[0]?.name || 'No position' }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <section
      v-if="teamPlayers.length === 0"
      class="page-section text-center mt-8"
    >
      <p class="text-gray-400">No players found for this team.</p>
    </section>

    <!-- Match History Section -->
    <section v-if="allMatches.length" class="page-section mt-12">
      <h2 class="text-xl font-semibold text-center text-gray-800 mb-6">
        Match History
      </h2>
      <ul class="w-full max-w-2xl mx-auto space-y-3">
        <li
          v-for="(match, index) in allMatches"
          :key="index"
          class="grid grid-cols-[1fr_auto_1fr] items-center bg-gray-100 rounded p-3 text-sm text-gray-700 w-full"
        >
          <!-- Home team -->
          <span class="text-right font-semibold truncate">
            {{ match.home.name }}
          </span>

          <!-- Score -->
          <span class="text-center font-semibold w-[80px]">
            {{ match.homeScore }} - {{ match.awayScore }}
          </span>

          <!-- Away team -->
          <span class="text-left font-semibold truncate">
            {{ match.away.name }}
          </span>
        </li>
      </ul>
    </section>
  </section>

  <!-- Fallback if team not found -->
  <section v-else class="page-section text-center">
    <p class="text-gray-400">Team not found.</p>
  </section>
</template>
