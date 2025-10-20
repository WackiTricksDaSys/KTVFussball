import { supabase, Member, Event, Registration } from './supabase';
import bcrypt from 'bcryptjs';

// Generate random password
export function generatePassword(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Members
export async function getAllMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('nickname', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data;
}

export async function createMember(nickname: string, email: string): Promise<{ member: Member; password: string }> {
  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  
  const { data, error } = await supabase
    .from('members')
    .insert({
      nickname,
      email,
      password_hash: passwordHash,
      is_active: true,
      is_admin: false,
      must_change_password: true
    })
    .select()
    .single();
  
  if (error) throw error;
  return { member: data, password };
}

export async function updateMemberPassword(memberId: number, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  
  const { error } = await supabase
    .from('members')
    .update({ 
      password_hash: passwordHash,
      must_change_password: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId);
  
  if (error) throw error;
}

export async function toggleMemberActive(memberId: number, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({ 
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId);
  
  if (error) throw error;
}

// Events
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getFutureEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createEvent(
  date: string, 
  timeFrom: string, 
  timeTo: string, 
  location: string
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      date,
      time_from: timeFrom,
      time_to: timeTo,
      location
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteEvent(eventId: number): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);
  
  if (error) throw error;
}

// Registrations
export async function getAllRegistrations(): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*');
  
  if (error) throw error;
  return data || [];
}

export async function getRegistration(memberId: number, eventId: number): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('member_id', memberId)
    .eq('event_id', eventId)
    .single();
  
  if (error) return null;
  return data;
}

export async function upsertRegistration(
  memberId: number, 
  eventId: number, 
  status: 'yes' | 'no' | 'pending',
  comment?: string,
  guests?: number,
  items?: Record<string, boolean>  // ⬅️ 6. Parameter hinzufügen!
): Promise<Registration> {
  const { data, error } = await supabase
    .from('registrations')
    .upsert({
      member_id: memberId,
      event_id: eventId,
      status,
      comment: comment || null,
      guests: guests || 0,
      items: items || null,  // ⬅️ items speichern!
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'member_id,event_id'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Check if event is locked (1 hour before start)
export function isEventLocked(event: Event): boolean {
  const eventDateTime = new Date(`${event.date}T${event.time_from}`);
  const now = new Date();
  const oneHourBefore = new Date(eventDateTime.getTime() - 60 * 60 * 1000);
  return now >= oneHourBefore;
}
