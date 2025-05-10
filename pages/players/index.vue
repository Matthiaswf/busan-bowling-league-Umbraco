<script setup>
const { get } = useApi();
const players = ref([]);
const teams = ref([]);
const teamLookup = ref({});

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  // Find Players folder
  const playersFolder = items.find((i) => i.contentType === 'playersFolder');
  if (playersFolder) {
    players.value = items.filter(
      (i) =>
        i.contentType === 'player' &&
        i.route?.startItem?.id === playersFolder.id
    );
  }

  teams.value = items.filter((i) => i.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.value.map((t) => [t.id, t]));
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title">Players</h1>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="player in players"
        :key="player.id"
        class="bg-white rounded p-4 text-center shadow"
      >
        <img
          v-if="player.properties.avatar?.[0]?.url"
          :src="`http://localhost:64203${player.properties.avatar[0].url}`"
          alt="Avatar"
          class="w-20 h-20 rounded-full object-cover mx-auto mb-2"
        />
        <p class="font-bold">{{ player.name }}</p>
        <p class="text-sm text-gray-500">
          {{ player.properties.position?.[0]?.name || 'No position' }}
        </p>
        <p class="text-sm text-gray-400 italic">
          {{
            teamLookup[player.properties.team?.[0]?.id]?.name ||
            'No team assigned'
          }}
        </p>
      </div>
    </div>
  </section>
</template>
