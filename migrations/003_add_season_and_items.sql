-- KTV Football App - Add Season and Items
-- Migration 003: Add season config and items to registrations

-- Add items column to registrations (JSON for flexibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' 
    AND column_name = 'items'
  ) THEN
    ALTER TABLE registrations ADD COLUMN items JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create settings table for global config (like current season)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default season setting
INSERT INTO settings (key, value) 
VALUES ('current_season', 'summer')
ON CONFLICT (key) DO NOTHING;

-- Record migration
INSERT INTO schema_migrations (script_name) 
VALUES ('003_add_season_and_items')
ON CONFLICT (script_name) DO NOTHING;
