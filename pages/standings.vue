<script setup>
const { get } = useApi();
const teams = ref([]);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  const items = data?.items || [];

  teams.value = items
    .filter((item) => item.contentType === 'team')
    .sort((a, b) => b.properties.points - a.properties.points);
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title">League Standings</h1>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="p-3 border-b">#</th>
            <th class="p-3 border-b">Team</th>
            <th class="p-3 border-b text-center">GP</th>
            <th class="p-3 border-b text-center">W</th>
            <th class="p-3 border-b text-center">L</th>
            <th class="p-3 border-b text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(team, index) in teams"
            :key="team.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">{{ index + 1 }}</td>
            <td class="p-3">
              <NuxtLink
                :to="`/teams/${team.properties.slug}`"
                class="text-blue-700 hover:underline"
              >
                {{ team.properties.teamName }}
              </NuxtLink>
            </td>
            <td class="p-3 text-center">{{ team.properties.gamesPlayed }}</td>
            <td class="p-3 text-center">{{ team.properties.wins }}</td>
            <td class="p-3 text-center">{{ team.properties.losses }}</td>
            <td class="p-3 text-center font-semibold">
              {{ team.properties.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
