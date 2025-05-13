<script setup>
import { useRoute } from 'vue-router';
import { useLeagueStore } from '@/stores/useLeagueStore';

const route = useRoute();
const league = useLeagueStore();

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
});

const player = computed(() =>
  league.players.find(
    (p) =>
      p.name.toLowerCase().replace(/\s+/g, '-') ===
      route.params.slug.toLowerCase()
  )
);

const teamName = computed(() => {
  const teamId = player.value?.properties.team?.[0]?.id;
  return teamId ? league.teamLookup[teamId]?.name : null;
});

const recentMatches = computed(() => {
  return player.value ? league.getRecentMatchesForPlayer(player.value.id) : [];
});

const playerStats = computed(() =>
  player.value
    ? league.getPlayerStats(player.value.id)
    : { gamesPlayed: 0, averageScore: '0' }
);
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
        <NuxtLink
          v-if="teamName"
          :to="`/teams/${teamName.toLowerCase().replace(/\s+/g, '-')}`"
          class="nav-link"
        >
          {{ teamName }}
        </NuxtLink>
        <span v-if="teamName && player.properties.position?.[0]?.name">
          •
        </span>
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
        <li v-for="(match, index) in recentMatches" :key="index">
          <NuxtLink
            :to="`/matches/${match.slug}`"
            class="block focus:outline-none"
          >
            <div
              class="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm transition"
            >
              <div class="text-gray-700 font-medium w-1/3 text-left truncate">
                {{ match.home.name }}
              </div>
              <div class="font-semibold text-lg whitespace-nowrap">
                {{ match.homeWins }} - {{ match.awayWins }}
              </div>
              <div class="text-gray-700 font-medium w-1/3 text-right truncate">
                {{ match.away.name }}
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Player not found.</p>
  </section>
</template>
