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
  let wins = 0;
  let losses = 0;
  let gamesPlayed = allMatches.value.length;
  let points = 0;

  for (const match of allMatches.value) {
    const isHome = match.home.id === team.value?.id;
    const isAway = match.away.id === team.value?.id;

    const teamScore = isHome ? match.homeScore : match.awayScore;
    const opponentScore = isHome ? match.awayScore : match.homeScore;

    if (teamScore > opponentScore) {
      wins++;
      points += 2; // or 3, depending on your league rules
    } else if (teamScore < opponentScore) {
      losses++;
    } else {
      points += 1; // if draws are possible and give 1 point
    }
  }

  return { gamesPlayed, wins, losses, points };
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
      if (!home || !away) continue;

      if (home.id === team.value?.id || away.id === team.value?.id) {
        matches.push({
          home,
          away,
          homeScore: props.homeScore,
          awayScore: props.awayScore,
        });
      }
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
