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

  // Step 1: create lookup of all teams by ID
  const teams = items.filter((item) => item.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.map((t) => [t.id, t]));

  // Step 2: filter out seasons
  seasons.value = items.filter((item) => item.contentType === 'season');
  selectedSeason.value = seasons.value[0] || null;

  // Step 3: get weeks based on season ID
  if (selectedSeason.value) {
    weeks.value = items.filter(
      (item) =>
        item.contentType === 'week' &&
        item.route?.startItem?.id === selectedSeason.value.id
    );

    console.log('Weeks loaded:', weeks.value);
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

      // Ensure team entries exist
      if (!statsMap[home]) statsMap[home] = { gp: 0, w: 0, l: 0, pts: 0 };
      if (!statsMap[away]) statsMap[away] = { gp: 0, w: 0, l: 0, pts: 0 };

      // Count game
      statsMap[home].gp += 1;
      statsMap[away].gp += 1;

      // Win/loss logic
      if (homeScore > awayScore) {
        statsMap[home].w += 1;
        statsMap[home].pts += 1;
        statsMap[away].l += 1;
      } else if (awayScore > homeScore) {
        statsMap[away].w += 1;
        statsMap[away].pts += 1;
        statsMap[home].l += 1;
      } else {
        // Optional: count draws here
      }
    }
  }

  return statsMap;
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title">Match Schedule</h1>

    <div v-if="seasons.length" class="flex gap-2 flex-wrap mb-6">
      <button
        v-for="season in seasons"
        :key="season.id"
        @click="selectedSeason = season"
        :class="[
          'px-4 py-1 rounded-full border text-sm',
          selectedSeason?.id === season.id
            ? 'bg-blue-700 text-white border-blue-700'
            : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
        ]"
      >
        {{ season.name }}
      </button>
    </div>

    <div v-if="selectedSeason">
      <p class="text-gray-500">Weeks for: {{ selectedSeason.name }}</p>

      <div class="mt-4 flex flex-wrap gap-3" v-if="weeks.length">
        <div
          v-for="week in weeks"
          :key="week.id"
          class="bg-white shadow rounded p-4 w-full sm:w-1/2 md:w-1/3"
        >
          <h3>{{ week.name }}</h3>
          <p class="text-sm text-gray-600">
            {{ formatDate(week.properties.weekDate) }}
          </p>

          <ul class="mt-3 space-y-2">
            <li
              v-for="(match, index) in week.properties.matches?.items || []"
              :key="index"
              class="text-sm text-gray-700 flex items-center gap-2 flex-wrap"
            >
              <!-- Home Team -->
              <template v-if="match.content.properties.homeTeam?.[0]">
                <img
                  v-if="
                    teamLookup[match.content.properties.homeTeam[0].id]
                      ?.properties?.logo?.[0]?.url
                  "
                  :src="`http://localhost:64203${
                    teamLookup[match.content.properties.homeTeam[0].id]
                      .properties.logo[0].url
                  }`"
                  alt="Home Logo"
                  class="w-5 h-5 object-contain"
                />
                <NuxtLink
                  :to="`/teams/${match.content.properties.homeTeam[0].name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`"
                  class="hover:underline text-blue-700"
                >
                  {{ match.content.properties.homeTeam[0].name }}
                </NuxtLink>
              </template>

              {{ match.content.properties.homeScore }} -
              {{ match.content.properties.awayScore }}

              <!-- Away Team -->
              <template v-if="match.content.properties.awayTeam?.[0]">
                <NuxtLink
                  :to="`/teams/${match.content.properties.awayTeam[0].name
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`"
                  class="hover:underline text-blue-700"
                >
                  {{ match.content.properties.awayTeam[0].name }}
                </NuxtLink>
                <img
                  v-if="
                    teamLookup[match.content.properties.awayTeam[0].id]
                      ?.properties?.logo?.[0]?.url
                  "
                  :src="`http://localhost:64203${
                    teamLookup[match.content.properties.awayTeam[0].id]
                      .properties.logo[0].url
                  }`"
                  alt="Away Logo"
                  class="w-5 h-5 object-contain"
                />
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <section class="page-section mt-12">
      <h2 class="section-title mb-4">Standings</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left border">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="p-2 border">Team</th>
              <th class="p-2 border text-center">GP</th>
              <th class="p-2 border text-center">W</th>
              <th class="p-2 border text-center">L</th>
              <th class="p-2 border text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="team in Object.values(teamLookup)"
              :key="team.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-2 border">
                <NuxtLink
                  :to="`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`"
                  class="text-blue-700 hover:underline"
                >
                  {{ team.name }}
                </NuxtLink>
              </td>
              <td class="p-2 border text-center">
                {{ computedStats[team.id]?.gp || 0 }}
              </td>
              <td class="p-2 border text-center">
                {{ computedStats[team.id]?.w || 0 }}
              </td>
              <td class="p-2 border text-center">
                {{ computedStats[team.id]?.l || 0 }}
              </td>
              <td class="p-2 border text-center">
                {{ computedStats[team.id]?.pts || 0 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
