<script setup>
import { useLeagueStore } from '@/stores/useLeagueStore';

const league = useLeagueStore();

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
});

const teams = computed(() => league.sortedTeamsByPoints);
</script>

<template>
  <section class="page-section">
    <h1 class="section-title mb-6">Full Standings</h1>
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
            v-for="team in teams"
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
</template>
