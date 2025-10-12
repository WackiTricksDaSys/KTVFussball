import { getItemsForSeason, getItemKey, getCurrentSeason } from '../season-config';

describe('Season Configuration', () => {
  describe('getItemsForSeason', () => {
    it('should return correct items for summer', () => {
      const items = getItemsForSeason('summer');
      expect(items).toEqual(['Schlüssel', 'Ball', 'Überzieher', 'Handschuhe', 'Pumpe']);
      expect(items).toHaveLength(5);
    });

    it('should return correct items for winter', () => {
      const items = getItemsForSeason('winter');
      expect(items).toEqual(['Hallenball', 'Überzieher', 'Pumpe']);
      expect(items).toHaveLength(3);
    });

    it('should maintain correct order for summer', () => {
      const items = getItemsForSeason('summer');
      expect(items[0]).toBe('Schlüssel');
      expect(items[1]).toBe('Ball');
      expect(items[2]).toBe('Überzieher');
      expect(items[3]).toBe('Handschuhe');
      expect(items[4]).toBe('Pumpe');
    });

    it('should maintain correct order for winter', () => {
      const items = getItemsForSeason('winter');
      expect(items[0]).toBe('Hallenball');
      expect(items[1]).toBe('Überzieher');
      expect(items[2]).toBe('Pumpe');
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

  describe('getCurrentSeason', () => {
    it('should return summer for months April-September', () => {
      // Mock different months
      const summerMonths = [4, 5, 6, 7, 8, 9];
      summerMonths.forEach(month => {
        jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(month - 1);
        expect(getCurrentSeason()).toBe('summer');
      });
    });

    it('should return winter for months October-March', () => {
      const winterMonths = [1, 2, 3, 10, 11, 12];
      winterMonths.forEach(month => {
        jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(month - 1);
        expect(getCurrentSeason()).toBe('winter');
      });
    });
  });
});
