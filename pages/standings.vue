<script setup>
import { formatDate } from '~/utils/formatDate';

const { get } = useApi();
const seasons = ref([]);
const selectedSeason = ref(null);
const weeks = ref([]);
const teamLookup = ref({});

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  const items = data?.items || [];

  const teams = items.filter((item) => item.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.map((t) => [t.id, t]));

  seasons.value = items.filter((item) => item.contentType === 'season');
  selectedSeason.value = seasons.value[0] || null;

  if (selectedSeason.value) {
    weeks.value = items.filter(
      (item) =>
        item.contentType === 'week' &&
        item.route?.startItem?.id === selectedSeason.value.id
    );
  }
});

const computedStats = computed(() => {
  const statsMap = {};

  for (const week of weeks.value) {
    const matches = week.properties.matches?.items || [];

    for (const match of matches) {
      const game = match.content?.properties;
      if (!game) continue;

      const home = game.homeTeam?.[0]?.id;
      const away = game.awayTeam?.[0]?.id;
      const homeScore = game.homeScore;
      const awayScore = game.awayScore;

      if (!home || !away) continue;

      if (!statsMap[home]) statsMap[home] = { gp: 0, w: 0, l: 0, pts: 0 };
      if (!statsMap[away]) statsMap[away] = { gp: 0, w: 0, l: 0, pts: 0 };

      statsMap[home].gp += 1;
      statsMap[away].gp += 1;

      if (homeScore > awayScore) {
        statsMap[home].w += 1;
        statsMap[home].pts += 1;
        statsMap[away].l += 1;
      } else if (awayScore > homeScore) {
        statsMap[away].w += 1;
        statsMap[away].pts += 1;
        statsMap[home].l += 1;
      }
    }
  }

  return statsMap;
});

const sortedTeams = computed(() => {
  return Object.values(teamLookup.value).sort((a, b) => {
    const aStats = computedStats.value[a.id] || { pts: 0 };
    const bStats = computedStats.value[b.id] || { pts: 0 };
    return bStats.pts - aStats.pts;
  });
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title text-center">Match Schedule</h1>

    <!-- Season Selector -->
    <div v-if="seasons.length" class="flex gap-2 flex-wrap justify-center mb-8">
      <button
        v-for="season in seasons"
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

    <!-- Week Cards -->
    <div v-if="weeks.length" class="flex flex-wrap gap-6 justify-center">
      <div
        v-for="week in weeks"
        :key="week.id"
        class="bg-white rounded-xl shadow-md p-6 w-full max-w-md border border-gray-100 hover:shadow-lg transition"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-1">{{ week.name }}</h3>
        <p class="text-sm text-gray-500 mb-3">
          {{ formatDate(week.properties.weekDate) }}
        </p>

        <ul class="space-y-3">
          <li
            v-for="(match, index) in week.properties.matches?.items || []"
            :key="index"
            class="grid grid-cols-[1fr_auto_1fr] items-center text-sm text-gray-700 gap-2"
          >
            <!-- Home Team -->
            <div class="flex items-center gap-2 justify-start">
              <img
                v-if="
                  teamLookup[match.content.properties.homeTeam?.[0]?.id]
                    ?.properties?.logo?.[0]?.url
                "
                :src="`http://localhost:64203${
                  teamLookup[match.content.properties.homeTeam[0].id].properties
                    .logo[0].url
                }`"
                class="w-5 h-5 object-contain"
                alt="Home Logo"
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

            <!-- Score (centered by grid) -->
            <div class="text-center font-semibold">
              {{ match.content.properties.homeScore }} -
              {{ match.content.properties.awayScore }}
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
                  teamLookup[match.content.properties.awayTeam?.[0]?.id]
                    ?.properties?.logo?.[0]?.url
                "
                :src="`http://localhost:64203${
                  teamLookup[match.content.properties.awayTeam[0].id].properties
                    .logo[0].url
                }`"
                class="w-5 h-5 object-contain"
                alt="Away Logo"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Standings -->
    <section class="page-section mt-16">
      <h2 class="section-title text-center mb-6">Standings</h2>
      <div class="overflow-x-auto">
        <table
          class="min-w-full text-sm border rounded overflow-hidden shadow-sm"
        >
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="p-3 border">Team</th>
              <th class="p-3 border text-center">GP</th>
              <th class="p-3 border text-center">W</th>
              <th class="p-3 border text-center">L</th>
              <th class="p-3 border text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="team in sortedTeams"
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
                {{ computedStats[team.id]?.gp || 0 }}
              </td>
              <td class="p-3 border text-center">
                {{ computedStats[team.id]?.w || 0 }}
              </td>
              <td class="p-3 border text-center">
                {{ computedStats[team.id]?.l || 0 }}
              </td>
              <td class="p-3 border text-center">
                {{ computedStats[team.id]?.pts || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
