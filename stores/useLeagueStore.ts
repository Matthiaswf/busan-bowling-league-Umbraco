import { defineStore } from 'pinia';

interface PlayerStat {
  total: number;
  games: number;
}

interface TeamStat {
  gp: number;
  w: number;
  l: number;
  pts: number;
}

export const useLeagueStore = defineStore('league', {
  state: () => ({
    items: [] as any[],
    players: [] as any[],
    teams: [] as any[],
    weeks: [] as any[],
    matches: [] as any[],
    seasons: [] as any[],
    teamLookup: {} as Record<string, any>,
  }),

  getters: {
    allPlayers: (state) => state.players,
    allTeams: (state) => state.teams,

    getPlayer: (state) => (id: string) =>
      state.players.find((p) => p.id === id),
    getTeam: (state) => (id: string) => state.teamLookup[id],

    computedStats(): Record<string, TeamStat> {
      const statsMap: Record<string, TeamStat> = {};

      for (const week of this.weeks) {
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
              const fullPlayer = this.players.find((p) => p.id === playerId);
              const teamId = fullPlayer?.properties?.team?.[0]?.id;
              const pts = s?.score || 0;

              if (teamId === home) homeTotal += pts;
              else if (teamId === away) awayTotal += pts;
            }

            if (homeTotal > awayTotal) {
              statsMap[home].w++;
              statsMap[home].pts++;
              statsMap[away].l++;
            } else if (awayTotal > homeTotal) {
              statsMap[away].w++;
              statsMap[away].pts++;
              statsMap[home].l++;
            }
          }
        }
      }

      return statsMap;
    },

    sortedTeamsByPoints(): any[] {
      return [...this.teams].sort((a, b) => {
        const aStats = this.computedStats[a.id] || { pts: 0 };
        const bStats = this.computedStats[b.id] || { pts: 0 };
        return bStats.pts - aStats.pts;
      });
    },
  },

  actions: {
    async fetchContent(api: any) {
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
