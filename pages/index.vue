<script setup>
import { ref, computed, onMounted } from 'vue';
const { get } = useApi();

const posts = ref([]);
const teams = ref([]);
const teamLookup = ref({});
const featuredPlayers = ref([]);
const weeks = ref([]); // <-- This was missing

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  posts.value = items.filter((item) => item.contentType === 'post');
  teams.value = items.filter((item) => item.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.value.map((t) => [t.id, t]));

  const playersFolder = items.find((i) => i.contentType === 'playersFolder');
  if (playersFolder) {
    featuredPlayers.value = items
      .filter(
        (i) =>
          i.contentType === 'player' &&
          i.route?.startItem?.id === playersFolder.id
      )
      .slice(0, 3);
  }

  const season = items.find((i) => i.contentType === 'season');
  if (season) {
    weeks.value = items.filter(
      (item) =>
        item.contentType === 'week' && item.route?.startItem?.id === season.id
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
    <h2 class="section-title">Latest Posts</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded shadow p-4"
      >
        <NuxtLink
          :to="`/posts/${post.name.toLowerCase().replace(/ /g, '-')}`"
          class="text-lg font-bold mb-2 text-blue-700 hover:underline block"
        >
          {{ post.name }}
        </NuxtLink>

        <p class="text-gray-600">{{ post.properties.title }}</p>
      </div>
    </div>
  </section>
  <section class="text-center mt-6">
    <NuxtLink to="/posts" class="btn-primary"> View All Posts → </NuxtLink>
  </section>

  <section>
    <h2 class="section-title">Current Standings</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="p-2 border-b">Team</th>
            <th class="p-2 border-b text-center">GP</th>
            <th class="p-2 border-b text-center">W</th>
            <th class="p-2 border-b text-center">L</th>
            <th class="p-2 border-b text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="team in sortedTeams.slice(0, 3)"
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
            <td class="p-2 border text-center font-semibold">
              {{ computedStats[team.id]?.pts || 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <section class="page-section text-center mt-6">
    <NuxtLink to="/standings" class="btn-primary">
      View Full Standings & Schedule →
    </NuxtLink>
  </section>
  <section class="page-section">
    <h2 class="section-title">Teams</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="team in teams"
        :key="team.id"
        class="bg-white rounded shadow p-4 text-center"
      >
        <img
          v-if="team.properties.logo"
          :src="`http://localhost:64203${team.properties.logo[0]?.url}`"
          alt="Team Logo"
          class="w-20 h-20 object-contain mx-auto mb-2"
        />

        <NuxtLink
          :to="`/teams/${team.name.toLowerCase().replace(/ /g, '-')}`"
          class="text-lg font-bold mb-1 text-blue-700 hover:underline block"
        >
          {{ team.name }}
        </NuxtLink>

        <p
          class="text-gray-500 text-sm"
          v-html="team.properties.bio?.markup"
        ></p>
      </div>
    </div>
  </section>
  <section class="page-section text-center mt-6">
    <NuxtLink to="/teams" class="btn-primary"> View All Teams → </NuxtLink>
  </section>

  <section v-if="featuredPlayers.length" class="page-section">
    <h2 class="section-title">Featured Players</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <NuxtLink
        v-for="player in featuredPlayers"
        :key="player.id"
        :to="`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`"
        class="bg-white p-4 rounded shadow text-center hover:bg-gray-50 transition"
      >
        <img
          v-if="player.properties.avatar?.[0]?.url"
          :src="`http://localhost:64203${player.properties.avatar[0].url}`"
          alt="Avatar"
          class="w-16 h-16 object-cover rounded-full mx-auto mb-2"
        />
        <p class="font-bold">{{ player.name }}</p>
        <p class="text-sm text-gray-500">
          {{ player.properties.position?.[0]?.name || 'No position' }}
        </p>
      </NuxtLink>
    </div>
  </section>

  <section class="page-section text-center">
    <NuxtLink to="/players" class="btn-primary"> View All Players → </NuxtLink>
  </section>
</template>
