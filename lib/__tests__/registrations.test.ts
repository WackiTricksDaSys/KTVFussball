import { Registration } from '../supabase';

describe('Registration Logic', () => {
  describe('Guest counting', () => {
    it('should only count guests from "yes" registrations', () => {
      const registrations: Registration[] = [
        { id: 1, member_id: 1, event_id: 1, status: 'yes', guests: 2, comment: null, items: {}, created_at: '', updated_at: '' },
        { id: 2, member_id: 2, event_id: 1, status: 'no', guests: 3, comment: null, items: {}, created_at: '', updated_at: '' },
        { id: 3, member_id: 3, event_id: 1, status: 'yes', guests: 1, comment: null, items: {}, created_at: '', updated_at: '' },
      ];

      const yesRegs = registrations.filter(r => r.status === 'yes');
      const guestCount = yesRegs.reduce((sum, r) => sum + (r.guests || 0), 0);
      
      expect(guestCount).toBe(3); // 2 + 1, NOT including 3 from "no"
      expect(yesRegs).toHaveLength(2);
    });

    it('should handle registrations without guests', () => {
      const registrations: Registration[] = [
        { id: 1, member_id: 1, event_id: 1, status: 'yes', guests: 0, comment: null, items: {}, created_at: '', updated_at: '' },
        { id: 2, member_id: 2, event_id: 1, status: 'yes', guests: 0, comment: null, items: {}, created_at: '', updated_at: '' },
      ];

      const yesRegs = registrations.filter(r => r.status === 'yes');
      const guestCount = yesRegs.reduce((sum, r) => sum + (r.guests || 0), 0);
      
      expect(guestCount).toBe(0);
      expect(yesRegs).toHaveLength(2);
    });
  });

  describe('Items tracking', () => {
    it('should track multiple members bringing same item', () => {
      const registrations: Registration[] = [
        { id: 1, member_id: 1, event_id: 1, status: 'yes', guests: 0, comment: null, items: { ball: true }, created_at: '', updated_at: '' },
        { id: 2, member_id: 2, event_id: 1, status: 'yes', guests: 0, comment: null, items: { ball: true }, created_at: '', updated_at: '' },
        { id: 3, member_id: 3, event_id: 1, status: 'yes', guests: 0, comment: null, items: { pumpe: true }, created_at: '', updated_at: '' },
      ];

      const ballBringers = registrations.filter(r => r.event_id === 1 && r.items?.ball);
      expect(ballBringers).toHaveLength(2);
    });

    it('should handle empty items object', () => {
      const registrations: Registration[] = [
        { id: 1, member_id: 1, event_id: 1, status: 'yes', guests: 0, comment: null, items: {}, created_at: '', updated_at: '' },
      ];

      const ballBringers = registrations.filter(r => r.event_id === 1 && r.items?.ball);
      expect(ballBringers).toHaveLength(0);
    });
  });

  describe('Total calculation', () => {
    it('should calculate total correctly (members + guests from yes only)', () => {
      const registrations: Registration[] = [
        { id: 1, member_id: 1, event_id: 1, status: 'yes', guests: 2, comment: null, items: {}, created_at: '', updated_at: '' },
        { id: 2, member_id: 2, event_id: 1, status: 'yes', guests: 1, comment: null, items: {}, created_at: '', updated_at: '' },
        { id: 3, member_id: 3, event_id: 1, status: 'no', guests: 5, comment: null, items: {}, created_at: '', updated_at: '' },
        { id: 4, member_id: 4, event_id: 1, status: 'pending', guests: 2, comment: null, items: {}, created_at: '', updated_at: '' },
      ];

      const yesRegs = registrations.filter(r => r.status === 'yes');
      const memberCount = yesRegs.length;
      const guestCount = yesRegs.reduce((sum, r) => sum + (r.guests || 0), 0);
      const total = memberCount + guestCount;

      expect(memberCount).toBe(2);
      expect(guestCount).toBe(3); // NOT 8!
      expect(total).toBe(5); // NOT 10!
    });
  });
});
