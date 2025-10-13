import { supabase, Member, Event, Registration } from './supabase';
import bcrypt from 'bcryptjs';

// ... (alle anderen Funktionen bleiben gleich)

export async function upsertRegistration(
  memberId: number, 
  eventId: number, 
  status: 'yes' | 'no' | 'pending',
  comment?: string,
  guests?: number,
  items?: Record<string, boolean>
): Promise<Registration> {
  const { data, error } = await supabase
    .from('registrations')
    .upsert({
      member_id: memberId,
      event_id: eventId,
      status,
      comment: comment || null,
      guests: guests || 0,
      items: items || {},
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'member_id,event_id'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
