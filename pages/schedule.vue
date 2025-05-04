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

  const weeks = computed(() => {
    return (
      selectedSeason.value?.children?.filter(
        (child) => child.contentType === 'week'
      ) || []
    );
  });
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
      <div class="mt-4 flex flex-wrap gap-3" v-if="weeks.length">
        <div
          v-for="week in weeks"
          :key="week.id"
          class="bg-white shadow rounded p-4 w-full sm:w-1/2 md:w-1/3"
        >
          <h3 class="font-bold text-lg mb-2">{{ week.name }}</h3>
          <p class="text-sm text-gray-500">{{ week.properties.weekDate }}</p>
          <p class="text-sm text-gray-400">
            Games: {{ week.properties.matches?.length || 0 }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
