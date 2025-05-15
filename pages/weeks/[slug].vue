<script setup>
import { useRoute } from 'vue-router';
import { useLeagueStore } from '@/stores/useLeagueStore';

const route = useRoute();
const league = useLeagueStore();

const week = computed(() =>
  league.weeks.find(
    (w) =>
      w.name.toLowerCase().replace(/\s+/g, '-') ===
      route.params.slug.toLowerCase()
  )
);

const getPlayer = (id) => league.players.find((p) => p.id === id);
const getTeamName = (id) => league.teamLookup[id]?.name || 'Unknown';

const allGames = computed(() => {
  if (!week.value) return [];
  return (
    week.value.properties.matches?.items.flatMap(
      (m) => m.content?.properties?.games?.items || []
    ) || []
  );
});

const playerStats = computed(() => {
  const stats = {};
  for (const game of allGames.value) {
    const scores = game.content?.properties?.playerScores?.items || [];
    for (const s of scores) {
      const props = s.content?.properties;
      const id = props?.player?.[0]?.id;
      if (!id) continue;
      const score = props.score || 0;

      if (!stats[id]) stats[id] = { total: 0, games: 0 };
      stats[id].total += score;
      stats[id].games++;
    }
  }
  return stats;
});

const sortedStats = computed(() => {
  return Object.entries(playerStats.value).sort(
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

    if (tid === game.homeId) homeTotal += score;
    else if (tid === game.awayId) awayTotal += score;
  }

  return teamId === game.homeId ? homeTotal > awayTotal : awayTotal > homeTotal;
};
</script>

<template>
  <section class="page-section min-w-[500px]" v-if="week">
    <h1 class="section-title text-center mb-6">{{ week.name }}</h1>

    <div
      v-for="(match, index) in week.properties.matches?.items || []"
      :key="index"
      class="mb-12"
    >
      <div
        class="grid grid-cols-3 gap-2 text-lg font-bold text-center mb-8 items-center"
      >
        <NuxtLink
          class="nav-link justify-self-end"
          :to="`/teams/${getTeamName(
            match.content?.properties?.homeTeam?.[0]?.id
          )
            .toLowerCase()
            .replace(/\s+/g, '-')}`"
        >
          {{ getTeamName(match.content?.properties?.homeTeam?.[0]?.id) }}
        </NuxtLink>

        <span class="text-gray-500 justify-self-center">vs</span>

        <NuxtLink
          class="nav-link justify-self-start"
          :to="`/teams/${getTeamName(
            match.content?.properties?.awayTeam?.[0]?.id
          )
            .toLowerCase()
            .replace(/\s+/g, '-')}`"
        >
          {{ getTeamName(match.content?.properties?.awayTeam?.[0]?.id) }}
        </NuxtLink>
      </div>

      <div
        v-for="(game, gIndex) in match.content?.properties?.games?.items || []"
        :key="game.id"
        class="mb-8"
      >
        <h3 class="text-md font-semibold mb-3">Game {{ gIndex + 1 }}</h3>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Home Team -->
          <div
            class="rounded-xl shadow p-4"
            :class="{
              'bg-green-50 border border-green-200': isWinner(
                match.content.properties.homeTeam?.[0]?.id,
                {
                  ...game,
                  homeId: match.content.properties.homeTeam?.[0]?.id,
                  awayId: match.content.properties.awayTeam?.[0]?.id,
                }
              ),
              'bg-white': !isWinner(
                match.content.properties.homeTeam?.[0]?.id,
                {
                  ...game,
                  homeId: match.content.properties.homeTeam?.[0]?.id,
                  awayId: match.content.properties.awayTeam?.[0]?.id,
                }
              ),
            }"
          >
            <h4 class="font-semibold text-gray-700 mb-2">
              <NuxtLink
                class="nav-link"
                :to="`/teams/${getTeamName(
                  match.content.properties.homeTeam?.[0]?.id
                )
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`"
              >
                {{ getTeamName(match.content.properties.homeTeam?.[0]?.id) }}
              </NuxtLink>
            </h4>
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="score in game.content?.properties?.playerScores?.items.filter(
                    (s) =>
                      getPlayer(s.content?.properties?.player?.[0]?.id)
                        ?.properties?.team?.[0]?.id ===
                      match.content.properties.homeTeam?.[0]?.id
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
          </div>

          <!-- Away Team -->
          <div
            class="rounded-xl shadow p-4"
            :class="{
              'bg-green-50 border border-green-200': isWinner(
                match.content.properties.awayTeam?.[0]?.id,
                {
                  ...game,
                  homeId: match.content.properties.homeTeam?.[0]?.id,
                  awayId: match.content.properties.awayTeam?.[0]?.id,
                }
              ),
              'bg-white': !isWinner(
                match.content.properties.awayTeam?.[0]?.id,
                {
                  ...game,
                  homeId: match.content.properties.homeTeam?.[0]?.id,
                  awayId: match.content.properties.awayTeam?.[0]?.id,
                }
              ),
            }"
          >
            <h4 class="font-semibold text-gray-700 mb-2">
              <NuxtLink
                class="nav-link"
                :to="`/teams/${getTeamName(
                  match.content.properties.awayTeam?.[0]?.id
                )
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`"
              >
                {{ getTeamName(match.content.properties.awayTeam?.[0]?.id) }}
              </NuxtLink>
            </h4>
            <table class="w-full text-sm">
              <tbody>
                <tr
                  v-for="score in game.content?.properties?.playerScores?.items.filter(
                    (s) =>
                      getPlayer(s.content?.properties?.player?.[0]?.id)
                        ?.properties?.team?.[0]?.id ===
                      match.content.properties.awayTeam?.[0]?.id
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
          </div>
        </div>
      </div>
    </div>

    <!-- Match Averages -->
    <h2 class="text-xl font-semibold text-center mt-12 mb-4">
      Player Averages This Week
    </h2>
    <div class="max-w-xl mx-auto bg-white p-4 rounded-xl shadow">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-600 border-b">
            <th class="py-2">Player</th>
            <th class="py-2">Team</th>
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
            </td>
            <td class="py-2">
              <NuxtLink
                v-if="getPlayer(id)?.properties?.team?.[0]?.id"
                class="nav-link"
                :to="`/teams/${league
                  .getTeam(getPlayer(id).properties.team[0].id)
                  ?.name.toLowerCase()
                  .replace(/\s+/g, '-')}`"
              >
                {{ league.getTeam(getPlayer(id).properties.team[0].id)?.name }}
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
    <p class="text-gray-400">Week not found.</p>
  </section>
</template>
