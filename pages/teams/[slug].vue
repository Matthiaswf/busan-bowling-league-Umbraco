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

const team = computed(() =>
  league.teams.find(
    (t) =>
      t.name.toLowerCase().replace(/\s+/g, '-') ===
      route.params.slug.toLowerCase()
  )
);

const players = computed(() =>
  league.players.filter((p) => p.properties.team?.[0]?.id === team.value?.id)
);

const stats = computed(() =>
  team.value
    ? league.getTeamStats(team.value.id)
    : { gp: 0, w: 0, l: 0, pts: 0 }
);

const matches = computed(() =>
  team.value ? league.allMatchesInvolvingTeam(team.value.id) : []
);
</script>

<template>
  <section v-if="team" class="page-section overflow-x-hidden">
    <div class="text-center mb-6">
      <div
        class="w-40 h-40 sm:w-52 sm:h-52 mx-auto mb-6 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden"
      >
        <img
          v-if="team.properties.logo?.[0]?.url"
          :src="`http://localhost:64203${team.properties.logo[0].url}`"
          alt="Team Logo"
          class="w-full h-full object-cover"
        />
      </div>

      <h1 class="post-title">{{ team.name }}</h1>
      <div
        class="text-gray-600 text-sm max-w-2xl mx-auto prose"
        v-html="team.properties.bio?.markup"
      ></div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-center mt-6">
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ stats.gp }}</div>
        <div class="text-gray-600">Games Played</div>
      </div>
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ stats.w }}</div>
        <div class="text-gray-600">Wins</div>
      </div>
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ stats.l }}</div>
        <div class="text-gray-600">Losses</div>
      </div>
      <div class="bg-gray-100 rounded p-4 shadow-sm">
        <div class="font-bold text-lg">{{ stats.pts }}</div>
        <div class="text-gray-600">Points</div>
      </div>
    </div>

    <section v-if="players.length" class="mt-10">
      <h2 class="text-xl font-semibold text-center text-gray-800 mb-6">
        Players
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="player in players"
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

    <section v-if="matches.length" class="page-section mt-12">
      <h2 class="text-xl font-semibold text-center text-gray-800 mb-6">
        Match History
      </h2>
      <ul class="w-full max-w-2xl mx-auto space-y-3">
        <li
          v-for="(match, index) in matches"
          :key="index"
          class="grid grid-cols-[1fr_auto_1fr] items-center bg-gray-100 rounded p-3 text-sm text-gray-700 w-full"
        >
          <NuxtLink
            :to="`/matches/${match.slug}`"
            class="contents hover:underline"
          >
            <span class="text-right font-semibold truncate">
              {{ match.home.name }}
            </span>
            <span class="text-center font-semibold w-[80px]">
              {{ match.homeScore }} - {{ match.awayScore }}
            </span>
            <span class="text-left font-semibold truncate">
              {{ match.away.name }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Team not found.</p>
  </section>
</template>
