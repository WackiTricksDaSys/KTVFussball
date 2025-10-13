import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Member {
  id: number;
  nickname: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  is_admin: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  date: string;
  time_from: string;
  time_to: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  member_id: number;
  event_id: number;
  status: 'yes' | 'no' | 'pending';
  comment: string | null;
  guests: number;
  items?: Record<string, boolean>;  // ← NEU: Diese Zeile fehlt!
  created_at: string;
  updated_at: string;
}

export interface SchemaMigration {
  id: number;
  script_name: string;
  created_at: string;
  executed_at: string | null;
}
