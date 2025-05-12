<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLeagueStore } from '@/stores/useLeagueStore';
import { formatDate } from '~/utils/formatDate';

const league = useLeagueStore();
const selectedSeason = ref(null);

const weeks = computed(() =>
  selectedSeason.value ? league.getWeeksBySeason(selectedSeason.value.id) : []
);

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
  selectedSeason.value = league.seasons[0] || null;
});

const teams = computed(() => league.sortedTeamsByPoints);

const sortedPlayers = computed(() => {
  return league.players
    .map((p) => ({
      ...p,
      stats: league.getPlayerStats(p.id),
    }))
    .filter((p) => p.stats.gamesPlayed > 0)
    .sort((a, b) => b.stats.averageScore - a.stats.averageScore);
});
</script>

<template>
  <section class="page-section">
    <!-- Season filter -->
    <div
      v-if="league.seasons.length"
      class="flex gap-2 flex-wrap justify-center mb-8"
    >
      <button
        v-for="season in league.seasons"
        :key="season.id"
        @click="selectedSeason = season"
        :class="[
          'px-4 py-1 rounded-full text-sm font-semibold transition border',
          selectedSeason?.id === season.id
            ? 'btn-primary text-white border-0'
            : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
        ]"
      >
        {{ season.name }}
      </button>
    </div>

    <!-- Week match cards -->
    <div v-if="weeks.length" class="flex flex-wrap gap-6 justify-center">
      <div
        v-for="week in weeks"
        :key="week.id"
        class="bg-white rounded-xl shadow-md p-6 w-full max-w-md border border-gray-100 hover:shadow-lg transition"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-1">{{ week.name }}</h3>
        <p class="text-sm text-gray-500 mb-3">
          {{
            week.properties.date
              ? formatDate(new Date(week.properties.date))
              : 'No date set'
          }}
        </p>

        <ul class="space-y-3">
          <li
            v-for="match in week.properties.matches?.items || []"
            :key="match.id"
            class="grid grid-cols-[1fr_auto_1fr] items-center text-sm text-gray-700 gap-2"
          >
            <!-- Home Team -->
            <div class="flex items-center gap-2 justify-start">
              <img
                v-if="
                  league.getTeam(match.content?.properties?.homeTeam?.[0]?.id)
                    ?.properties?.logo?.[0]?.url
                "
                :src="`http://localhost:64203${
                  league.getTeam(match.content.properties.homeTeam[0].id)
                    .properties.logo[0].url
                }`"
                class="w-5 h-5 object-contain"
              />
              <NuxtLink
                :to="`/teams/${match.content.properties.homeTeam[0].name
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`"
                class="nav-link font-medium"
              >
                {{ match.content.properties.homeTeam[0].name }}
              </NuxtLink>
            </div>

            <!-- Score -->
            <div class="text-center font-semibold">
              {{
                (() => {
                  const games = match.content?.properties?.games?.items || [];
                  let homeWins = 0;
                  let awayWins = 0;
                  for (const game of games) {
                    const scores =
                      game.content?.properties?.playerScores?.items || [];
                    let h = 0,
                      a = 0;
                    for (const score of scores) {
                      const s = score.content?.properties;
                      const playerId = s?.player?.[0]?.id;
                      const fullPlayer = league.players.find(
                        (p) => p.id === playerId
                      );
                      const teamId = fullPlayer?.properties?.team?.[0]?.id;
                      const pts = s?.score || 0;
                      if (teamId === match.content.properties.homeTeam?.[0]?.id)
                        h += pts;
                      else if (
                        teamId === match.content.properties.awayTeam?.[0]?.id
                      )
                        a += pts;
                    }
                    if (h > a) homeWins++;
                    else if (a > h) awayWins++;
                  }
                  return `${homeWins} - ${awayWins}`;
                })()
              }}
            </div>

            <!-- Away Team -->
            <div class="flex items-center gap-2 justify-end">
              <NuxtLink
                :to="`/teams/${match.content.properties.awayTeam[0].name
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`"
                class="nav-link font-medium"
              >
                {{ match.content.properties.awayTeam[0].name }}
              </NuxtLink>
              <img
                v-if="
                  league.getTeam(match.content?.properties?.awayTeam?.[0]?.id)
                    ?.properties?.logo?.[0]?.url
                "
                :src="`http://localhost:64203${
                  league.getTeam(match.content.properties.awayTeam[0].id)
                    .properties.logo[0].url
                }`"
                class="w-5 h-5 object-contain"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Team Standings -->
    <section class="page-section mt-16">
      <h2 class="section-title text-center mb-6">Team Standings</h2>
      <div class="overflow-x-auto">
        <table
          class="min-w-full text-sm border rounded overflow-hidden shadow-sm"
        >
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="p-3 border">Team</th>
              <th class="p-3 border text-center">Games Played</th>
              <th class="p-3 border text-center">Wins</th>
              <th class="p-3 border text-center">Losses</th>
              <th class="p-3 border text-center">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="team in teams"
              :key="team.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3 border font-medium">
                <NuxtLink
                  :to="`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`"
                  class="nav-link"
                >
                  {{ team.name }}
                </NuxtLink>
              </td>
              <td class="p-3 border text-center">
                {{ league.getTeamStats(team.id).gp }}
              </td>
              <td class="p-3 border text-center">
                {{ league.getTeamStats(team.id).w }}
              </td>
              <td class="p-3 border text-center">
                {{ league.getTeamStats(team.id).l }}
              </td>
              <td class="p-3 border text-center">
                {{ league.getTeamStats(team.id).pts }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Individual Standings -->
    <section class="page-section mt-16">
      <h2 class="section-title text-center mb-6">Individual Standings</h2>
      <div class="overflow-x-auto">
        <table
          class="min-w-full text-sm border rounded overflow-hidden shadow-sm"
        >
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="p-3 border">Player</th>
              <th class="p-3 border text-center">Avg</th>
              <th class="p-3 border text-center">Games Played</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="player in sortedPlayers"
              :key="player.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3 border font-medium">
                <NuxtLink
                  :to="`/players/${player.name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`"
                  class="nav-link"
                >
                  {{ player.name }}
                </NuxtLink>
              </td>
              <td class="p-3 border text-center">
                {{ player.stats.averageScore }}
              </td>
              <td class="p-3 border text-center">
                {{ player.stats.gamesPlayed }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
