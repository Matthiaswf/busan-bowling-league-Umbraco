<script setup>
import { useLeagueStore } from '@/stores/useLeagueStore';

const league = useLeagueStore();

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
});

const teams = computed(() => league.teams);
</script>

<template>
  <section class="page-section">
    <h1 class="section-title text-center mb-6">All Teams</h1>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
      <NuxtLink
        v-for="team in teams"
        :key="team.id"
        :to="`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`"
        class="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition block"
      >
        <div
          class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full border border-gray-300 overflow-hidden"
        >
          <img
            v-if="team.properties.logo?.[0]?.url"
            :src="`http://localhost:64203${team.properties.logo[0].url}`"
            alt="Team Logo"
            class="w-full h-full object-cover"
          />
        </div>
        <h2 class="text-lg font-semibold text-gray-800">{{ team.name }}</h2>
        <div
          class="text-sm text-gray-500 prose max-w-none"
          v-html="team.properties.bio?.markup"
        ></div>
        <div class="mt-3 text-xs text-gray-500">
          {{ league.getTeamStats(team.id).gp }} GP •
          {{ league.getTeamStats(team.id).w }} W •
          {{ league.getTeamStats(team.id).l }} L •
          {{ league.getTeamStats(team.id).pts }} Pts
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
