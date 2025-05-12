<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLeagueStore } from '@/stores/useLeagueStore';

const league = useLeagueStore();
const searchQuery = ref('');

onMounted(async () => {
  if (!league.players.length) {
    await league.fetchContent(useApi());
  }
});

const filteredPlayers = computed(() => {
  return league.players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title text-center mb-6">All Players</h1>
    <div class="mb-6 max-w-md mx-auto">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search players..."
        class="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none"
      />
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
      <NuxtLink
        v-for="player in filteredPlayers"
        :key="player.id"
        :to="`/players/${player.name.toLowerCase().replace(/\s+/g, '-')}`"
        class="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition block"
      >
        <div
          class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full border border-gray-300 overflow-hidden"
        >
          <img
            v-if="player.properties.avatar?.[0]?.url"
            :src="`http://localhost:64203${player.properties.avatar[0].url}`"
            alt="Player Avatar"
            class="w-full h-full object-cover"
          />
        </div>
        <h2 class="text-lg font-semibold text-gray-800">{{ player.name }}</h2>
        <p class="text-sm text-gray-500">
          {{ player.properties.position?.[0]?.name || 'No position' }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>
