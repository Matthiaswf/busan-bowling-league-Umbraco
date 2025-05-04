<script setup>
const { get } = useApi();
const seasons = ref([]);
const selectedSeason = ref(null);

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  const items = data?.items || [];

  // Filter out Season documents only
  seasons.value = items.filter((item) => item.contentType === 'season');

  // Auto-select the first season (latest)
  selectedSeason.value = seasons.value[0] || null;

  console.log('All seasons:', seasons.value);
});
</script>

<template>
  <section class="page-section">
    <h1 class="section-title">Match Schedule</h1>

    <div v-if="seasons.length" class="flex gap-2 flex-wrap mb-6">
      <button
        v-for="season in seasons"
        :key="season.id"
        @click="selectedSeason = season"
        :class="[
          'px-4 py-1 rounded-full border text-sm',
          selectedSeason?.id === season.id
            ? 'bg-blue-700 text-white border-blue-700'
            : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
        ]"
      >
        {{ season.name }}
      </button>
    </div>

    <div v-if="selectedSeason">
      <p class="text-gray-500">Weeks for: {{ selectedSeason.name }}</p>
    </div>
  </section>
</template>
