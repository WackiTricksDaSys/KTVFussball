import { getItemsForSeason, getItemKey, getMinPlayersForSeason, getSeasonSettings } from '../season-config';

describe('Season Configuration', () => {
  describe('getItemsForSeason', () => {
    it('should return correct items for summer', () => {
      const items = getItemsForSeason('summer');
      expect(items).toEqual(['Schlüssel', 'Ball', 'Pumpe', 'Überzieher', 'Handschuhe']);
      expect(items).toHaveLength(5);
    });

    it('should return correct items for winter', () => {
      const items = getItemsForSeason('winter');
      expect(items).toEqual(['Hallenball', 'Pumpe', 'Überzieher']);
      expect(items).toHaveLength(3);
    });

    it('should maintain correct order for summer', () => {
      const items = getItemsForSeason('summer');
      expect(items[0]).toBe('Schlüssel');
      expect(items[1]).toBe('Ball');
      expect(items[2]).toBe('Pumpe');
      expect(items[3]).toBe('Überzieher');
      expect(items[4]).toBe('Handschuhe');
    });

    it('should maintain correct order for winter', () => {
      const items = getItemsForSeason('winter');
      expect(items[0]).toBe('Hallenball');
      expect(items[1]).toBe('Pumpe');
      expect(items[2]).toBe('Überzieher');
    });
  });

  describe('getItemKey', () => {
    it('should convert umlauts correctly', () => {
      expect(getItemKey('Überzieher')).toBe('ueberzieher');
      expect(getItemKey('Schlüssel')).toBe('schluessel');
    });

    it('should convert to lowercase', () => {
      expect(getItemKey('Ball')).toBe('ball');
      expect(getItemKey('Pumpe')).toBe('pumpe');
    });

    it('should handle complex strings', () => {
      expect(getItemKey('Handschuhe')).toBe('handschuhe');
      expect(getItemKey('Hallenball')).toBe('hallenball');
    });
  });

  describe('getMinPlayersForSeason', () => {
    it('should return 12 for summer', () => {
      expect(getMinPlayersForSeason('summer')).toBe(12);
    });

    it('should return 8 for winter', () => {
      expect(getMinPlayersForSeason('winter')).toBe(8);
    });
  });

  describe('getSeasonSettings', () => {
    it('should return complete settings for summer', () => {
      const settings = getSeasonSettings('summer');
      expect(settings.items).toEqual(['Schlüssel', 'Ball', 'Pumpe', 'Überzieher', 'Handschuhe']);
      expect(settings.minPlayers).toBe(12);
    });

    it('should return complete settings for winter', () => {
      const settings = getSeasonSettings('winter');
      expect(settings.items).toEqual(['Hallenball', 'Pumpe', 'Überzieher']);
      expect(settings.minPlayers).toBe(8);
    });
  });
});
