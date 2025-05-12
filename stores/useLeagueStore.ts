import { defineStore } from 'pinia';

export const useLeagueStore = defineStore('league', {
  state: () => ({
    items: [],
    players: [],
    teams: [],
    weeks: [],
    matches: [],
    seasons: [],
    teamLookup: {},
  }),

  getters: {
    allPlayers: (state) => state.players,
    allTeams: (state) => state.teams,

    getPlayer: (state) => (id) => state.players.find((p) => p.id === id),
    getTeam: (state) => (id) => state.teamLookup[id],

    matchBySlug: (state) => (slug) => {
      for (const week of state.weeks) {
        const matches = week.properties?.matches?.items || [];
        for (const matchItem of matches) {
          const matchDoc = matchItem.content;
          const matchSlug = matchDoc?.properties?.slug?.trim().toLowerCase();
          if (matchSlug === slug.trim().toLowerCase()) {
            return matchDoc;
          }
        }
      }
      return null;
    },
    getPlayerStats: (state) => (playerId) => {
      let games = 0;
      let total = 0;

      for (const week of state.weeks) {
        const matches = week.properties?.matches?.items || [];
        for (const match of matches) {
          const gamesList = match.content?.properties?.games?.items || [];
          for (const game of gamesList) {
            const scores = game.content?.properties?.playerScores?.items || [];
            for (const s of scores) {
              if (s.content?.properties?.player?.[0]?.id === playerId) {
                total += s.content?.properties?.score || 0;
                games++;
              }
            }
          }
        }
      }

      return {
        gamesPlayed: games,
        averageScore: games ? (total / games).toFixed(1) : '0',
      };
    },

    getRecentMatchesForPlayer: (state) => (playerId) => {
      const matches = [];

      for (const week of state.weeks) {
        const matchItems = week.properties.matches?.items || [];

        for (const match of matchItems) {
          const matchName = match.content?.name;
          const props = match.content?.properties;
          const games = props?.games?.items || [];
          const home = props?.homeTeam?.[0];
          const away = props?.awayTeam?.[0];

          if (!home || !away || !games.length) continue;

          const participated = games.some((game) =>
            (game.content?.properties?.playerScores?.items || []).some(
              (score) => score.content?.properties?.player?.[0]?.id === playerId
            )
          );

          if (!participated) continue;

          let homeWins = 0;
          let awayWins = 0;

          for (const game of games) {
            let homeTotal = 0;
            let awayTotal = 0;
            const scores = game.content?.properties?.playerScores?.items || [];

            for (const s of scores) {
              const id = s.content?.properties?.player?.[0]?.id;
              const fullPlayer = state.players.find((p) => p.id === id);
              const teamId = fullPlayer?.properties?.team?.[0]?.id;
              const score = s.content?.properties?.score || 0;

              if (teamId === home.id) homeTotal += score;
              else if (teamId === away.id) awayTotal += score;
            }

            if (homeTotal > awayTotal) homeWins++;
            else if (awayTotal > homeTotal) awayWins++;
          }

          matches.push({
            home,
            away,
            homeWins,
            awayWins,
            slug: match.content?.properties?.slug,
          });
        }
      }

      return matches.slice(0, 3);
    },
    getTeamStats: (state) => (teamId) => {
      return state.computedStats[teamId] || { gp: 0, w: 0, l: 0, pts: 0 };
    },

    allMatchesInvolvingTeam: (state) => (teamId) => {
      const matches = [];
      for (const week of state.weeks) {
        const matchItems = week.properties?.matches?.items || [];
        for (const match of matchItems) {
          const props = match.content?.properties;
          const home = props?.homeTeam?.[0];
          const away = props?.awayTeam?.[0];

          if (!home || !away || (home.id !== teamId && away.id !== teamId))
            continue;

          let homeWins = 0;
          let awayWins = 0;
          const games = props.games?.items || [];

          for (const game of games) {
            const scores = game.content?.properties?.playerScores?.items || [];
            let homeTotal = 0;
            let awayTotal = 0;

            for (const score of scores) {
              const id = score.content?.properties?.player?.[0]?.id;
              const fullPlayer = state.players.find((p) => p.id === id);
              const tid = fullPlayer?.properties?.team?.[0]?.id;
              const s = score.content?.properties?.score || 0;
              if (tid === home.id) homeTotal += s;
              else if (tid === away.id) awayTotal += s;
            }

            if (homeTotal > awayTotal) homeWins++;
            else if (awayTotal > homeTotal) awayWins++;
          }

          matches.push({
            home,
            away,
            homeScore: homeWins,
            awayScore: awayWins,
            name: match.content?.name,
            slug: match.content?.properties?.slug,
          });
        }
      }
      return matches;
    },

    getPlayerScoresForGame: (state) => (game, teamId) => {
      const scores = game.content?.properties?.playerScores?.items || [];
      return scores.filter((s) => {
        const id = s.content?.properties?.player?.[0]?.id;
        const p = state.players.find((p) => p.id === id);
        return p?.properties?.team?.[0]?.id === teamId;
      });
    },

    getGameScore: (state) => (game, teamId) => {
      return game.content?.properties?.playerScores?.items.reduce((acc, s) => {
        const id = s.content?.properties?.player?.[0]?.id;
        const p = state.players.find((p) => p.id === id);
        const tid = p?.properties?.team?.[0]?.id;
        if (tid === teamId) {
          return acc + (s.content?.properties?.score || 0);
        }
        return acc;
      }, 0);
    },

    computedStats: (state) => {
      const statsMap = {};

      for (const week of state.weeks) {
        const matches = week.properties?.matches?.items || [];

        for (const match of matches) {
          const props = match.content?.properties;
          const home = props?.homeTeam?.[0]?.id;
          const away = props?.awayTeam?.[0]?.id;
          const games = props?.games?.items || [];

          if (!home || !away || !games.length) continue;

          if (!statsMap[home]) statsMap[home] = { gp: 0, w: 0, l: 0, pts: 0 };
          if (!statsMap[away]) statsMap[away] = { gp: 0, w: 0, l: 0, pts: 0 };

          statsMap[home].gp += games.length;
          statsMap[away].gp += games.length;

          let homeWins = 0;
          let awayWins = 0;

          for (const game of games) {
            const scores = game.content?.properties?.playerScores?.items || [];
            let homeTotal = 0;
            let awayTotal = 0;

            for (const score of scores) {
              const s = score.content?.properties;
              const playerId = s?.player?.[0]?.id;
              const fullPlayer = state.players.find((p) => p.id === playerId);
              const teamId = fullPlayer?.properties?.team?.[0]?.id;
              const pts = s?.score || 0;

              if (teamId === home) homeTotal += pts;
              else if (teamId === away) awayTotal += pts;
            }

            if (homeTotal > awayTotal) homeWins++;
            else if (awayTotal > homeTotal) awayWins++;
          }

          if (homeWins > awayWins) {
            statsMap[home].w++;
            statsMap[home].pts++;
            statsMap[away].l++;
          } else if (awayWins > homeWins) {
            statsMap[away].w++;
            statsMap[away].pts++;
            statsMap[home].l++;
          }
        }
      }

      return statsMap;
    },

    sortedTeamsByPoints: (state) => {
      const stats = state.computedStats;
      return [...state.teams].sort((a, b) => {
        const aStats = stats[a.id] || { pts: 0 };
        const bStats = stats[b.id] || { pts: 0 };
        return bStats.pts - aStats.pts;
      });
    },

    playerAveragesInMatch: (state) => (match) => {
      const stats = {};
      const games = match.properties?.games?.items || [];

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

      return stats;
    },
  },

  actions: {
    async fetchContent(api) {
      const { get } = api;
      const data = await get('/umbraco/delivery/api/v1/content?take=100');
      this.items = data?.items?.filter(Boolean) || [];

      this.teams = this.items.filter(
        (i) => i?.contentType?.toLowerCase() === 'team'
      );
      this.teamLookup = Object.fromEntries(this.teams.map((t) => [t.id, t]));

      const playersFolder = this.items.find(
        (i) => i?.contentType?.toLowerCase() === 'playersfolder'
      );
      this.players = this.items.filter(
        (i) =>
          i?.contentType?.toLowerCase() === 'player' &&
          i.route?.startItem?.id === playersFolder?.id
      );

      this.seasons = this.items.filter(
        (i) => i?.contentType?.toLowerCase() === 'season'
      );
      this.weeks = this.items.filter(
        (i) => i?.contentType?.toLowerCase() === 'week'
      );

      this.matches = [];
      for (const week of this.weeks) {
        const matchItems = week.properties?.matches?.items || [];
        for (const m of matchItems) {
          const matchDoc = m.content;
          if (matchDoc?.properties?.slug) this.matches.push(matchDoc);
        }
      }
    },
  },
});
