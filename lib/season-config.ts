// Saison-Konfiguration für Utensilien

export type Season = 'summer' | 'winter';

export interface SeasonConfig {
  summer: string[];
  winter: string[];
}

export const SEASON_ITEMS: SeasonConfig = {
  summer: ['Schlüssel', 'Ball', 'Pumpe', 'Überzieher', 'Handschuhe'],
  winter: ['Hallenball', 'Pumpe', 'Überzieher']
};

export function getItemsForSeason(season: Season): string[] {
  return SEASON_ITEMS[season];
}

export function getItemKey(item: string): string {
  return item.toLowerCase().replace('ü', 'ue').replace('ä', 'ae').replace('ö', 'oe');
}

export function getCurrentSeason(): Season {
  // Automatische Erkennung basierend auf Monat
  const month = new Date().getMonth() + 1; // 1-12
  return (month >= 4 && month <= 9) ? 'summer' : 'winter';
}
