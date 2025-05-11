<script setup>
import { ref, computed, onMounted } from 'vue';
const { get } = useApi();

const posts = ref([]);
const teams = ref([]);
const allPlayers = ref([]);
const teamLookup = ref({});
const featuredPlayers = ref([]);
const weeks = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  posts.value = items.filter((item) => item.contentType === 'post');
  teams.value = items.filter((item) => item.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.value.map((t) => [t.id, t]));

  const playersFolder = items.find((i) => i.contentType === 'playersFolder');
  if (playersFolder) {
    allPlayers.value = items.filter(
      (i) =>
        i.contentType === 'player' &&
        i.route?.startItem?.id === playersFolder.id
    );

    featuredPlayers.value = allPlayers.value.slice(0, 3);
  }

  const season = items.find((i) => i.contentType === 'season');
  if (season) {
    weeks.value = items.filter(
      (item) =>
        item.contentType === 'week' && item.route?.startItem?.id === season.id
    );
  }
});

const postsSorted = computed(() => {
  return [...posts.value].sort((a, b) => {
    const aDate = new Date(a.properties.publishedDate);
    const bDate = new Date(b.properties.publishedDate);
    return bDate - aDate;
  });
});

const computedStats = computed(() => {
  const statsMap = {};

  for (const week of weeks.value) {
    const matches = week.properties.matches?.items || [];

    for (const match of matches) {
      const matchProps = match.content?.properties;
      const home = matchProps?.homeTeam?.[0]?.id;
      const away = matchProps?.awayTeam?.[0]?.id;
      const games = matchProps?.games?.items || [];

      if (!home || !away || games.length === 0) continue;

      if (!statsMap[home]) statsMap[home] = { gp: 0, w: 0, l: 0, pts: 0 };
      if (!statsMap[away]) statsMap[away] = { gp: 0, w: 0, l: 0, pts: 0 };

      statsMap[home].gp += games.length;
      statsMap[away].gp += games.length;

      let homeWins = 0;
      let awayWins = 0;

      for (const game of games) {
        const scores = game.content?.properties?.playerScores?.items || [];
        let homeTotal = 0;
        let awayTotal = 0;

        for (const score of scores) {
          const s = score.content?.properties;
          const points = s?.score || 0;
          const playerId = s?.player?.[0]?.id;
          const fullPlayer = allPlayers.value.find(
            (p) => p.id === playerId && p.contentType === 'player'
          );
          const playerTeam = fullPlayer?.properties?.team?.[0]?.id;

          if (!playerTeam) continue;

          if (playerTeam === home) homeTotal += points;
          else if (playerTeam === away) awayTotal += points;
        }

        if (homeTotal > awayTotal) homeWins++;
        else if (awayTotal > homeTotal) awayWins++;
      }

      // Determine match winner
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

const sortedTeams = computed(() => {
  return Object.values(teamLookup.value).sort((a, b) => {
    const aStats = computedStats.value[a.id] || { pts: 0 };
    const bStats = computedStats.value[b.id] || { pts: 0 };
    return bStats.pts - aStats.pts;
  });
});
</script>

<template>
  <!-- Latest Posts -->
  <section class="page-section">
    <h2 class="section-title mb-4">Latest Posts</h2>
    <div class="space-y-6 max-w-2xl mx-auto">
      <NuxtLink
        v-for="post in postsSorted.slice(0, 3)"
        :key="post.id"
        :to="`/posts/${post.name.toLowerCase().replace(/\s+/g, '-')}`"
        class="block bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
      >
        <!-- Image -->
        <img
          v-if="post.properties.mainImage?.[0]?.url"
          :src="`http://localhost:64203${post.properties.mainImage[0].url}`"
          alt="Post Image"
          class="w-full h-48 object-cover"
        />

        <!-- Text content -->
        <div class="p-6 space-y-2">
          <h2 class="text-xl font-semibold text-gray-800">{{ post.name }}</h2>
          <p class="text-gray-400 text-sm">
            {{ formatDate(post.properties.publishedDate) }}
          </p>
          <div
            v-if="post.properties.content?.markup"
            v-html="post.properties.content.markup"
            class="text-gray-600 text-sm line-clamp-3"
          />
        </div>
      </NuxtLink>
    </div>

    <div class="text-center mt-6">
      <NuxtLink to="/posts" class="btn-primary">View All Posts →</NuxtLink>
    </div>
  </section>

  <!-- Standings Preview -->
  <section class="page-section mt-12">
    <h2 class="section-title">Current Standings</h2>
    <div class="overflow-x-auto rounded-lg shadow">
      <table class="min-w-full text-sm text-left">
        <thead class="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th class="p-3">Team</th>
            <th class="p-3 text-center">GP</th>
            <th class="p-3 text-center">W</th>
            <th class="p-3 text-center">L</th>
            <th class="p-3 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="team in sortedTeams.slice(0, 3)"
            :key="team.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">
              <NuxtLink
                :to="`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`"
                class="font-semibold text-gray-800 hover:text-black transition"
              >
                {{ team.name }}
              </NuxtLink>
            </td>
            <td class="p-3 text-center">
              {{ computedStats[team.id]?.gp || 0 }}
            </td>
            <td class="p-3 text-center">
              {{ computedStats[team.id]?.w || 0 }}
            </td>
            <td class="p-3 text-center">
              {{ computedStats[team.id]?.l || 0 }}
            </td>
            <td class="p-3 text-center font-semibold">
              {{ computedStats[team.id]?.pts || 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="text-center mt-6">
    <NuxtLink to="/standings" class="btn-primary">
      View Full Standings →
    </NuxtLink>
  </section>

  <!-- Teams Preview -->
  <section class="page-section">
    <h2 class="section-title">Teams</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
      <NuxtLink
        v-for="team in teams"
        :key="team.id"
        :to="`/teams/${team.name.toLowerCase().replace(/ /g, '-')}`"
        class="bg-white rounded-2xl shadow p-4 text-center hover:shadow-md transition block"
      >
        <div
          class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-full border-2 border-gray-200 shadow overflow-hidden"
        >
          <img
            v-if="team.properties.logo"
            :src="`http://localhost:64203${team.properties.logo[0]?.url}`"
            alt="Team Logo"
            class="w-full h-full object-cover"
          />
        </div>

        <p class="font-semibold text-gray-800 hover:text-black transition">
          {{ team.name }}
        </p>
        <p
          class="text-gray-500 text-sm mt-1"
          v-html="team.properties.bio?.markup"
        ></p>
      </NuxtLink>
    </div>
  </section>

  <section class="text-center mt-6">
    <NuxtLink to="/teams" class="btn-primary"> View All Teams → </NuxtLink>
  </section>

  <!-- Featured Players -->
  <section v-if="featuredPlayers.length" class="page-section mt-6">
    <h2 class="section-title">Featured Players</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
      <NuxtLink
        v-for="player in featuredPlayers"
        :key="player.id"
        :to="`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`"
        class="bg-white p-4 rounded-2xl shadow text-center hover:shadow-md transition"
      >
        <img
          v-if="player.properties.avatar?.[0]?.url"
          :src="`http://localhost:64203${player.properties.avatar[0].url}`"
          alt="Avatar"
          class="w-16 h-16 object-cover rounded-full mx-auto mb-2"
        />
        <p class="font-semibold">{{ player.name }}</p>
        <p class="text-sm text-gray-500">
          {{ player.properties.position?.[0]?.name || 'No position' }}
        </p>
      </NuxtLink>
    </div>
  </section>

  <section class="text-center mt-6">
    <NuxtLink to="/players" class="btn-primary"> View All Players → </NuxtLink>
  </section>
</template>
