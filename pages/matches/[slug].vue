<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
const { get } = useApi();

const match = ref(null);
const allPlayers = ref([]);
const playerStats = ref({});
const teamLookup = ref({});

onMounted(async () => {
  const data = await get('/umbraco/delivery/api/v1/content?take=100');
  const items = data?.items || [];

  const weekDocs = items.filter((i) => i.contentType === 'week');
  const matches = [];

  for (const week of weekDocs) {
    const weekMatches = week.properties?.matches?.items || [];
    for (const matchItem of weekMatches) {
      const matchDoc = matchItem.content;
      if (matchDoc?.properties?.slug) {
        matches.push(matchDoc);
      }
    }
  }

  console.log('ROUTE SLUG:', route.params.slug);
  console.log(
    'MATCH SLUGS:',
    matches.map((m) => m.properties?.slug)
  );

  const playersFolder = items.find((i) => i.contentType === 'playersFolder');
  allPlayers.value = items.filter(
    (i) =>
      i.contentType === 'player' && i.route?.startItem?.id === playersFolder?.id
  );

  const teams = items.filter((i) => i.contentType === 'team');
  teamLookup.value = Object.fromEntries(teams.map((t) => [t.id, t]));

  match.value = matches.find(
    (m) =>
      m.properties.slug?.trim().toLowerCase() ===
      route.params.slug.trim().toLowerCase()
  );

  if (!match.value) return;

  const games = match.value.properties.games?.items || [];
  const stats = {};

  for (const game of games) {
    const scores = game.content?.properties?.playerScores?.items || [];
    for (const s of scores) {
      const props = s.content?.properties;
      const playerId = props?.player?.[0]?.id;
      if (!playerId) continue;
      const score = props.score || 0;

      if (!stats[playerId]) stats[playerId] = { total: 0, games: 0 };

      stats[playerId].total += score;
      stats[playerId].games++;
    }
  }

  playerStats.value = stats;
});

const getPlayer = (id) => allPlayers.value.find((p) => p.id === id);
const getTeamName = (id) => teamLookup.value[id]?.name || 'Unknown';
</script>

<template>
  <section v-if="match" class="page-section">
    <div
      v-for="(game, index) in match.properties.games?.items || []"
      :key="game.id"
      class="mb-10"
    >
      <h2 class="text-lg font-bold mb-4">Game {{ index + 1 }}</h2>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow p-4">
          <h3 class="font-semibold text-gray-700 mb-2">
            <NuxtLink
              :to="`/teams/${getTeamName(match.properties.homeTeam?.[0]?.id)
                .toLowerCase()
                .replace(/\s+/g, '-')}`"
              class="nav-link"
            >
              {{ getTeamName(match.properties.homeTeam?.[0]?.id) }}
            </NuxtLink>
          </h3>
          <table class="w-full text-sm">
            <tbody>
              <tr
                v-for="score in game.content?.properties?.playerScores?.items.filter(
                  (s) =>
                    getPlayer(s.content?.properties?.player?.[0]?.id)
                      ?.properties?.team?.[0]?.id ===
                    match.properties.homeTeam?.[0]?.id
                )"
                :key="score.id"
                class="border-b last:border-0"
              >
                <td class="py-2">
                  <NuxtLink
                    :to="`/players/${getPlayer(
                      score.content?.properties?.player?.[0]?.id
                    )
                      ?.name.toLowerCase()
                      .replace(/\s+/g, '-')}`"
                    class="nav-link"
                  >
                    {{
                      getPlayer(score.content?.properties?.player?.[0]?.id)
                        ?.name
                    }}
                  </NuxtLink>
                </td>
                <td class="py-2 text-right">
                  {{ score.content?.properties?.score }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-right font-semibold mt-2">
            Total:
            {{
              game.content?.properties?.playerScores?.items.reduce((acc, s) => {
                const playerId = s.content?.properties?.player?.[0]?.id;
                const player = getPlayer(playerId);
                const teamId = player?.properties?.team?.[0]?.id;
                return teamId === match.properties.homeTeam?.[0]?.id
                  ? acc + (s.content?.properties?.score || 0)
                  : acc;
              }, 0)
            }}
            pins
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-4">
          <h3 class="font-semibold text-gray-700 mb-2">
            <NuxtLink
              :to="`/teams/${getTeamName(match.properties.awayTeam?.[0]?.id)
                .toLowerCase()
                .replace(/\s+/g, '-')}`"
              class="nav-link"
            >
              {{ getTeamName(match.properties.awayTeam?.[0]?.id) }}
            </NuxtLink>
          </h3>
          <table class="w-full text-sm">
            <tbody>
              <tr
                v-for="score in game.content?.properties?.playerScores?.items.filter(
                  (s) =>
                    getPlayer(s.content?.properties?.player?.[0]?.id)
                      ?.properties?.team?.[0]?.id ===
                    match.properties.awayTeam?.[0]?.id
                )"
                :key="score.id"
                class="border-b last:border-0"
              >
                <td class="py-2">
                  <NuxtLink
                    :to="`/players/${getPlayer(
                      score.content?.properties?.player?.[0]?.id
                    )
                      ?.name.toLowerCase()
                      .replace(/\s+/g, '-')}`"
                    class="nav-link"
                  >
                    {{
                      getPlayer(score.content?.properties?.player?.[0]?.id)
                        ?.name
                    }}
                  </NuxtLink>
                </td>
                <td class="py-2 text-right">
                  {{ score.content?.properties?.score }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="text-right font-semibold mt-2">
            Total:
            {{
              game.content?.properties?.playerScores?.items.reduce((acc, s) => {
                const playerId = s.content?.properties?.player?.[0]?.id;
                const player = getPlayer(playerId);
                const teamId = player?.properties?.team?.[0]?.id;
                return teamId === match.properties.awayTeam?.[0]?.id
                  ? acc + (s.content?.properties?.score || 0)
                  : acc;
              }, 0)
            }}
            pins
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-xl font-semibold text-center mt-12 mb-4">Match Averages</h2>
    <div class="max-w-xl mx-auto bg-white p-4 rounded-xl shadow">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-600 border-b">
            <th class="py-2">Player</th>
            <th class="py-2 text-right">Average</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="[id, stat] in Object.entries(playerStats).sort(
              ([, a], [, b]) => b.total / b.games - a.total / a.games
            )"
            :key="id"
            class="border-b last:border-0"
          >
            <td class="py-2">
              <NuxtLink
                :to="`/players/${getPlayer(id)
                  ?.name.toLowerCase()
                  .replace(/\s+/g, '-')}`"
                class="nav-link"
              >
                {{ getPlayer(id)?.name }}
              </NuxtLink>
            </td>
            <td class="py-2 text-right">
              {{ (stat.total / stat.games).toFixed(1) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section v-else class="page-section text-center">
    <p class="text-gray-400">Match not found.</p>
  </section>
</template>
