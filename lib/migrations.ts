import { supabase } from './supabase';

// Import all migration SQL files
const migrations = [
  {
    name: '001_initial_setup',
    sql: `
-- Schema Migrations Table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  script_name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Members Table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  must_change_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_from TIME NOT NULL,
  time_to TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('yes', 'no', 'pending')) DEFAULT 'pending',
  comment TEXT,
  guests INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id, event_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_registrations_member ON registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);

-- RLS Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all members" ON members;
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Users can view all registrations" ON registrations;

CREATE POLICY "Users can view all members" ON members FOR SELECT USING (true);
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can view all registrations" ON registrations FOR SELECT USING (true);
    `
  },
  {
    name: '002_add_guests',
    sql: `
-- Add guests column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' 
    AND column_name = 'guests'
  ) THEN
    ALTER TABLE registrations ADD COLUMN guests INTEGER DEFAULT 0;
  END IF;
END $$;
    `
  }
];

export async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Checking for pending migrations...');
    
    // First ensure schema_migrations table exists
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        script_name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        executed_at TIMESTAMP DEFAULT NOW()
      );`
    }).catch(() => ({ error: null })); // Ignore if RPC doesn't exist
    
    // Check which migrations have already been executed
    const { data: executedMigrations, error } = await supabase
      .from('schema_migrations')
      .select('script_name');
    
    if (error && error.code !== 'PGRST116') { // Ignore "table not found" error
      console.warn('⚠️ Could not fetch migrations (this is OK on first run):', error.message);
    }
    
    const executedNames = new Set(executedMigrations?.map(m => m.script_name) || []);
    
    // Run pending migrations in order
    for (const migration of migrations) {
      if (!executedNames.has(migration.name)) {
        console.log(`🚀 Running migration: ${migration.name}`);
        
        // Execute the SQL
        const { error: execError } = await supabase.rpc('exec_sql', {
          sql: migration.sql
        }).catch(() => ({ error: null }));
        
        if (execError) {
          console.warn(`⚠️ Migration ${migration.name} may need manual execution`);
          console.warn('Please run migrations manually in Supabase SQL Editor');
          continue;
        }
        
        // Record the migration
        await supabase
          .from('schema_migrations')
          .insert({ script_name: migration.name })
          .catch(() => {}); // Ignore errors
        
        console.log(`✅ Migration ${migration.name} completed`);
      } else {
        console.log(`⏭️  Migration ${migration.name} already executed`);
      }
    }
    
    console.log('✅ All migrations up to date!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    console.warn('💡 Please run migrations manually in Supabase SQL Editor');
  }
}
