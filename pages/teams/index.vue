<script setup>
const { get } = useApi();
const teams = ref([]);
const teamLookup = ref({});
const weeks = ref([]);
const allPlayers = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  teams.value = items.filter((i) => i.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.value.map((t) => [t.id, t]));

  const playersFolder = items.find((i) => i.contentType === 'playersFolder');
  if (playersFolder) {
    allPlayers.value = items.filter(
      (i) =>
        i.contentType === 'player' &&
        i.route?.startItem?.id === playersFolder.id
    );
  }

  weeks.value = items.filter((i) => i.contentType === 'week');
});

const computedStats = computed(() => {
  const statsMap = {};

  for (const week of weeks.value) {
    const matches = week.properties.matches?.items || [];

    for (const match of matches) {
      const props = match.content?.properties;
      const home = props?.homeTeam?.[0]?.id;
      const away = props?.awayTeam?.[0]?.id;
      const games = props?.games?.items || [];

      if (!home || !away || !games.length) continue;

      if (!statsMap[home]) statsMap[home] = { w: 0, l: 0, pts: 0 };
      if (!statsMap[away]) statsMap[away] = { w: 0, l: 0, pts: 0 };

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

      if (homeWins > awayWins) {
        statsMap[home].w += 1;
        statsMap[home].pts += 1;
        statsMap[away].l += 1;
      } else if (awayWins > homeWins) {
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
