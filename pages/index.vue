<script setup>
import { useLeagueStore } from '@/stores/useLeagueStore';
import { formatDate } from '@/utils/formatDate';

const league = useLeagueStore();

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
});

const postsFolderId = computed(
  () =>
    league.items.find((i) => i.contentType?.toLowerCase() === 'postsfolder')?.id
);

const posts = computed(() =>
  league.items
    .filter(
      (i) =>
        i?.contentType === 'post' &&
        i.route?.startItem?.id === postsFolderId.value
    )
    .sort(
      (a, b) =>
        new Date(b.properties.publishedDate).getTime() -
        new Date(a.properties.publishedDate).getTime()
    )
);

const teams = computed(() => league.teams);
const sortedTeams = computed(() => league.sortedTeamsByPoints);
const computedStats = computed(() => league.computedStats);
const featuredPlayers = computed(() => league.players.slice(0, 3));
</script>

<template>
  <!-- Latest Posts -->
  <section class="page-section">
    <h2 class="section-title mb-4">Latest Posts</h2>
    <div class="space-y-6 max-w-2xl mx-auto">
      <NuxtLink
        v-for="post in posts.slice(0, 3)"
        :key="post.id"
        :to="`/posts/${post.name.toLowerCase().replace(/\s+/g, '-')}`"
        class="block bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
      >
        <img
          v-if="post.properties.mainImage?.[0]?.url"
          :src="`http://localhost:64203${post.properties.mainImage[0].url}`"
          alt="Post Image"
          class="w-full h-48 object-cover"
        />
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
              {{ league.getTeamStats(team.id).gp }}
            </td>
            <td class="p-3 text-center">
              {{ league.getTeamStats(team.id).w }}
            </td>
            <td class="p-3 text-center">
              {{ league.getTeamStats(team.id).l }}
            </td>
            <td class="p-3 text-center font-semibold">
              {{ league.getTeamStats(team.id).pts }}
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
        :to="`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`"
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
