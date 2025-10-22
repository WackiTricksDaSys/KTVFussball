// Saison-Konfiguration für Utensilien und Einstellungen

export type Season = 'summer' | 'winter';

export interface SeasonSettings {
  items: string[];
  minPlayers: number;
}

export interface SeasonConfig {
  summer: SeasonSettings;
  winter: SeasonSettings;
}

export const SEASON_CONFIG: SeasonConfig = {
  summer: {
    items: ['Schlüssel', 'Ball', 'Pumpe', 'Überzieher', 'Handschuhe'],
    minPlayers: 12
  },
  winter: {
    items: ['Hallenball', 'Pumpe', 'Überzieher'],
    minPlayers: 8
  }
};

// Hilfsfunktionen
export function getItemsForSeason(season: Season): string[] {
  return SEASON_CONFIG[season].items;
}

export function getMinPlayersForSeason(season: Season): number {
  return SEASON_CONFIG[season].minPlayers;
}

export function getSeasonSettings(season: Season): SeasonSettings {
  return SEASON_CONFIG[season];
}

export function getItemKey(item: string): string {
  return item.toLowerCase().replace('ü', 'ue').replace('ä', 'ae').replace('ö', 'oe');
}

// getCurrentSeason() entfernt - Saison wird aus der Datenbank gelesen
