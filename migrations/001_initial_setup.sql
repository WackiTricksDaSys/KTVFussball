-- KTV Football App - Initial Database Setup
-- Migration 001: Create all tables

-- 1. Schema Migrations Table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  script_name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP DEFAULT NOW()
);

-- 2. Members Table
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

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_from TIME NOT NULL,
  time_to TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Registrations Table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_registrations_member ON registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view all members" ON members;
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Users can view all registrations" ON registrations;

CREATE POLICY "Users can view all members" ON members FOR SELECT USING (true);
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can view all registrations" ON registrations FOR SELECT USING (true);

-- ============================================
-- NEU: Initial Admin User erstellen
-- ============================================
INSERT INTO members (
  nickname, 
  email, 
  password_hash, 
  is_active, 
  is_admin, 
  must_change_password
) VALUES (
  'Wacki',
  'ransient.t@gmail.com',
  crypt('admin123', gen_salt('bf')),
  true,
  true,
  true
);

-- Record migration
INSERT INTO schema_migrations (script_name) VALUES ('001_initial_setup') ON CONFLICT (script_name) DO NOTHING;