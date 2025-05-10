<script setup>
const { get } = useApi();
const teams = ref([]);
const teamLookup = ref({});
const weeks = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  teams.value = items.filter((i) => i.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.value.map((t) => [t.id, t]));

  weeks.value = items.filter((i) => i.contentType === 'week');
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

      if (!statsMap[home]) statsMap[home] = { w: 0, l: 0, pts: 0 };
      if (!statsMap[away]) statsMap[away] = { w: 0, l: 0, pts: 0 };

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
</script>
<template>
  <section class="page-section">
    <h1 class="section-title text-center">Teams</h1>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="team in teams"
        :key="team.id"
        class="bg-white rounded shadow p-4 text-center hover:shadow-md transition duration-200"
      >
        <img
          v-if="team.properties.logo?.[0]?.url"
          :src="`http://localhost:64203${team.properties.logo[0].url}`"
          alt="Team Logo"
          class="w-20 h-20 object-contain mx-auto mb-3"
        />
        <NuxtLink
          :to="`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`"
          class="text-lg font-bold text-gray-900 nav-link block"
        >
          {{ team.name }}
        </NuxtLink>

        <p class="text-sm text-gray-500 mt-1">
          {{ computedStats[team.id]?.w || 0 }} W •
          {{ computedStats[team.id]?.l || 0 }} L •
          {{ computedStats[team.id]?.pts || 0 }} Pts
        </p>
      </div>
    </div>
  </section>
</template>
