<script setup>
import { useRoute } from 'vue-router';
import { useLeagueStore } from '@/stores/useLeagueStore';

const route = useRoute();
const league = useLeagueStore();

onMounted(async () => {
  if (!league.items.length) {
    await league.fetchContent(useApi());
  }
});

const match = computed(() => league.matchBySlug(route.params.slug));
const getPlayer = (id) => league.players.find((p) => p.id === id);
const getTeamName = (id) => league.teamLookup[id]?.name || 'Unknown';
const sortedStats = computed(() => {
  if (!match.value?.playerStats) return [];
  return Object.entries(match.value.playerStats).sort(
    ([, a], [, b]) => b.total / b.games - a.total / a.games
  );
});

const isWinner = (teamId, game) => {
  const scores = game.content?.properties?.playerScores?.items || [];
  let homeTotal = 0;
  let awayTotal = 0;

  for (const s of scores) {
    const playerId = s.content?.properties?.player?.[0]?.id;
    const player = getPlayer(playerId);
    const tid = player?.properties?.team?.[0]?.id;
    const score = s.content?.properties?.score || 0;

    if (tid === match.value.properties.homeTeam?.[0]?.id) homeTotal += score;
    else if (tid === match.value.properties.awayTeam?.[0]?.id)
      awayTotal += score;
  }

  if (teamId === match.value.properties.homeTeam?.[0]?.id)
    return homeTotal > awayTotal;
  if (teamId === match.value.properties.awayTeam?.[0]?.id)
    return awayTotal > homeTotal;
  return false;
};
</script>

<template>
  <section v-if="match" class="w-[80vw] sm:w-[500px] mx-auto px-4 py-8">
    <div
      class="grid grid-cols-3 gap-2 text-lg font-bold text-center mb-8 items-center"
    >
      <NuxtLink
        class="nav-link justify-self-end"
        :to="`/teams/${getTeamName(match.properties.homeTeam?.[0]?.id)
          .toLowerCase()
          .replace(/\s+/g, '-')}`"
      >
        {{ match.properties.homeTeam?.[0]?.name }}
      </NuxtLink>

      <span class="text-gray-500 justify-self-center">vs</span>

      <NuxtLink
        class="nav-link justify-self-start"
        :to="`/teams/${getTeamName(match.properties.awayTeam?.[0]?.id)
          .toLowerCase()
          .replace(/\s+/g, '-')}`"
      >
        {{ match.properties.awayTeam?.[0]?.name }}
      </NuxtLink>
    </div>

    <div
      v-for="(game, index) in match.properties.games?.items || []"
      :key="game.id"
      class="mb-10"
    >
      <h2 class="text-lg font-bold mb-4">Game {{ index + 1 }}</h2>

      <div class="grid md:grid-cols-2 gap-6">
        <div
          class="rounded-xl shadow p-4"
          :class="{
            'bg-green-50 border border-green-200': isWinner(
              match.properties.homeTeam?.[0]?.id,
              game
            ),
            'bg-white': !isWinner(match.properties.homeTeam?.[0]?.id, game),
          }"
        >
          <h3 class="font-semibold text-gray-700 mb-2">
            <NuxtLink
              class="nav-link"
              :to="`/teams/${getTeamName(match.properties.homeTeam?.[0]?.id)
                .toLowerCase()
                .replace(/\s+/g, '-')}`"
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
                    class="nav-link"
                    :to="`/players/${getPlayer(
                      score.content?.properties?.player?.[0]?.id
                    )
                      ?.name.toLowerCase()
                      .replace(/\s+/g, '-')}`"
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

        <div
          class="rounded-xl shadow p-4"
          :class="{
            'bg-green-50 border border-green-200': isWinner(
              match.properties.awayTeam?.[0]?.id,
              game
            ),
            'bg-white': !isWinner(match.properties.awayTeam?.[0]?.id, game),
          }"
        >
          <h3 class="font-semibold text-gray-700 mb-2">
            <NuxtLink
              class="nav-link"
              :to="`/teams/${getTeamName(match.properties.awayTeam?.[0]?.id)
                .toLowerCase()
                .replace(/\s+/g, '-')}`"
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
                    class="nav-link"
                    :to="`/players/${getPlayer(
                      score.content?.properties?.player?.[0]?.id
                    )
                      ?.name.toLowerCase()
                      .replace(/\s+/g, '-')}`"
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
            v-for="[id, stat] in sortedStats"
            :key="id"
            class="border-b last:border-0"
          >
            <td class="py-2">
              <NuxtLink
                class="nav-link"
                :to="`/players/${getPlayer(id)
                  ?.name.toLowerCase()
                  .replace(/\s+/g, '-')}`"
              >
                {{ getPlayer(id)?.name }}
              </NuxtLink>
              <div
                v-if="getPlayer(id)?.properties?.team?.[0]?.id"
                class="text-sm text-gray-500"
              >
                <NuxtLink
                  class="nav-link"
                  :to="`/teams/${league
                    .getTeam(getPlayer(id).properties.team[0].id)
                    ?.name.toLowerCase()
                    .replace(/\s+/g, '-')}`"
                >
                  {{
                    league.getTeam(getPlayer(id).properties.team[0].id)?.name
                  }}
                </NuxtLink>
              </div>
            </td>
            <td class="py-2 text-right">
              {{ (stat.total / stat.games).toFixed(1) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section v-else class="w-[80vw] sm:w-[500px] mx-auto px-4 py-8 text-center">
    <p class="text-gray-400">Match not found.</p>
  </section>
</template>
