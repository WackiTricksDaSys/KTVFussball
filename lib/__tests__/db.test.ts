import { generatePassword, hashPassword, verifyPassword, isEventLocked, getCurrentSeason, setCurrentSeason } from '../db';
import { Event } from '../supabase';
import { supabase } from '../supabase';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  Member: {},
  Event: {},
  Registration: {},
  SchemaMigration: {},
}));

describe('Database Functions', () => {
  describe('generatePassword', () => {
    it('should generate a password of correct length', () => {
      const password = generatePassword(12);
      expect(password).toHaveLength(12);
    });

    it('should generate different passwords', () => {
      const pw1 = generatePassword();
      const pw2 = generatePassword();
      expect(pw1).not.toBe(pw2);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toHaveLength(60); // bcrypt hash length
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('isEventLocked', () => {
    it('should return false for events more than 1 hour away', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const event: Event = {
        id: 1,
        date: tomorrow.toISOString().split('T')[0],
        time_from: '18:00',
        time_to: '20:00',
        location: 'Test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      expect(isEventLocked(event)).toBe(false);
    });

    it('should return true for events less than 1 hour away', () => {
      const now = new Date();
      const in30Min = new Date(now.getTime() + 30 * 60000);
      
      const event: Event = {
        id: 1,
        date: in30Min.toISOString().split('T')[0],
        time_from: in30Min.toTimeString().slice(0, 5),
        time_to: '20:00',
        location: 'Test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      expect(isEventLocked(event)).toBe(true);
    });

    it('should return true for past events', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const event: Event = {
        id: 1,
        date: yesterday.toISOString().split('T')[0],
        time_from: '18:00',
        time_to: '20:00',
        location: 'Test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      expect(isEventLocked(event)).toBe(true);
    });
  });

  describe('Season Management', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('getCurrentSeason', () => {
      it('should return summer when season is set to summer', async () => {
        const mockFrom = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { value: 'summer' },
                error: null
              })
            })
          })
        });
        (supabase.from as jest.Mock) = mockFrom;

        const season = await getCurrentSeason();
        expect(season).toBe('summer');
      });

      it('should return winter when season is set to winter', async () => {
        const mockFrom = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { value: 'winter' },
                error: null
              })
            })
          })
        });
        (supabase.from as jest.Mock) = mockFrom;

        const season = await getCurrentSeason();
        expect(season).toBe('winter');
      });

      it('should return summer as default when no data exists', async () => {
        const mockFrom = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' }
              })
            })
          })
        });
        (supabase.from as jest.Mock) = mockFrom;

        const season = await getCurrentSeason();
        expect(season).toBe('summer');
      });
    });

    describe('setCurrentSeason', () => {
      it('should update season to summer', async () => {
        const mockFrom = jest.fn().mockReturnValue({
          upsert: jest.fn().mockResolvedValue({
            error: null
          })
        });
        (supabase.from as jest.Mock) = mockFrom;

        await setCurrentSeason('summer');
        
        expect(mockFrom).toHaveBeenCalledWith('settings');
        expect(mockFrom().upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'current_season',
            value: 'summer'
          }),
          { onConflict: 'key' }
        );
      });

      it('should update season to winter', async () => {
        const mockFrom = jest.fn().mockReturnValue({
          upsert: jest.fn().mockResolvedValue({
            error: null
          })
        });
        (supabase.from as jest.Mock) = mockFrom;

        await setCurrentSeason('winter');
        
        expect(mockFrom).toHaveBeenCalledWith('settings');
        expect(mockFrom().upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            key: 'current_season',
            value: 'winter'
          }),
          { onConflict: 'key' }
        );
      });

      it('should throw error when update fails', async () => {
        const mockFrom = jest.fn().mockReturnValue({
          upsert: jest.fn().mockResolvedValue({
            error: { message: 'Database error' }
          })
        });
        (supabase.from as jest.Mock) = mockFrom;

        await expect(setCurrentSeason('summer')).rejects.toThrow();
      });
    });
  });
});
