'use client';

import { useState } from 'react';
import { Database, Copy, CheckCircle } from 'lucide-react';

const migrations = [
  {
    name: '001_initial_setup',
    description: 'Erstellt alle Tabellen (members, events, registrations, schema_migrations)',
    sql: `-- KTV Football App - Initial Database Setup
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

-- Record migration
INSERT INTO schema_migrations (script_name) VALUES ('001_initial_setup') ON CONFLICT (script_name) DO NOTHING;`
  },
  {
    name: '002_add_guests',
    description: 'Fügt Gäste-Spalte zur registrations Tabelle hinzu',
    sql: `-- KTV Football App - Add Guests Column
-- Migration 002: Add guests column to registrations table

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

-- Record migration
INSERT INTO schema_migrations (script_name) VALUES ('002_add_guests') ON CONFLICT (script_name) DO NOTHING;`
  }
];

export default function MigrationsPanel() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (sql: string, name: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Datenbank-Migrations</h2>
          <p className="text-sm text-gray-600">SQL-Befehle zum Einrichten der Datenbank</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Anleitung:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Gehe zu <strong>supabase.com</strong> → Dein Projekt</li>
          <li>Klicke auf <strong>SQL Editor</strong> (links im Menü)</li>
          <li>Klicke auf <strong>"New query"</strong></li>
          <li>Kopiere das SQL (Button unten)</li>
          <li>Füge es im SQL Editor ein</li>
          <li>Klicke auf <strong>"Run"</strong> (oder Strg/Cmd + Enter)</li>
          <li>Fertig! ✅</li>
        </ol>
      </div>

      <div className="space-y-4">
        {migrations.map((migration) => (
          <div key={migration.name} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{migration.name}</h3>
                  <p className="text-sm text-gray-600">{migration.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(migration.sql, migration.name)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {copied === migration.name ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">SQL kopieren</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono">{migration.sql}</pre>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Wichtig:</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Führe Migration <strong>001</strong> beim ersten Setup aus</li>
          <li>• Migration <strong>002</strong> ist optional (nur wenn 001 bereits läuft)</li>
          <li>• Bei zukünftigen Updates werden hier neue Migrations erscheinen</li>
          <li>• Migrations können mehrfach ausgeführt werden (sind idempotent)</li>
        </ul>
      </div>
    </div>
  );
}
