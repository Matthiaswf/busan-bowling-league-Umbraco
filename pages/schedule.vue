<script setup>
import { formatDate } from '~/utils/formatDate';

const { get } = useApi();
const seasons = ref([]);
const selectedSeason = ref(null);
const weeks = ref([]);
const teamLookup = ref({});

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content');
  const items = data?.items || [];

  // Step 1: create lookup of all teams by ID
  const teams = items.filter((item) => item.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.map((t) => [t.id, t]));

  // Step 2: filter out seasons
  seasons.value = items.filter((item) => item.contentType === 'season');
  selectedSeason.value = seasons.value[0] || null;

  // Step 3: get weeks based on season ID
  if (selectedSeason.value) {
    weeks.value = items.filter(
      (item) =>
        item.contentType === 'week' &&
        item.route?.startItem?.id === selectedSeason.value.id
    );

    console.log('Weeks loaded:', weeks.value);
  }
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
          <h3>{{ week.name }}</h3>
          <p class="text-sm text-gray-600">
            {{ formatDate(week.properties.weekDate) }}
          </p>

          <ul class="mt-3 space-y-2">
            <li
              v-for="(match, index) in week.properties.matches?.items || []"
              :key="index"
              class="text-sm text-gray-700"
            >
              <div
                v-if="match?.content"
                class="flex items-center gap-2 flex-wrap"
              >
                <img
                  v-if="
                    teamLookup[match.content.properties.homeTeam?.[0]?.id]
                      ?.properties.logo?.[0]?.url
                  "
                  :src="`http://localhost:64203${
                    teamLookup[match.content.properties.homeTeam?.[0]?.id]
                      ?.properties.logo[0].url
                  }`"
                  alt="Home Team Logo"
                  class="w-6 h-6 object-contain"
                />
                {{ match.content.properties.homeTeam?.[0]?.name || '—' }}
                {{ match.content.properties.homeScore }} -
                {{ match.content.properties.awayScore }}
                <img
                  v-if="
                    teamLookup[match.content.properties.awayTeam?.[0]?.id]
                      ?.properties.logo?.[0]?.url
                  "
                  :src="`http://localhost:64203${
                    teamLookup[match.content.properties.awayTeam?.[0]?.id]
                      ?.properties.logo[0].url
                  }`"
                  alt="Away Team Logo"
                  class="w-6 h-6 object-contain"
                />
                {{ match.content.properties.awayTeam?.[0]?.name || '—' }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
