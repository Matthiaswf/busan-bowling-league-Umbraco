<script setup>
import { useLeagueStore } from '@/stores/useLeagueStore';

const league = useLeagueStore();

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
});

const players = computed(() => league.players);
</script>

<template>
  <section class="page-section">
    <h1 class="section-title text-center mb-6">All Players</h1>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
      <NuxtLink
        v-for="player in players"
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
