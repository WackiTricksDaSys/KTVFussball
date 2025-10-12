-- KTV Football App - Add Guests Column
-- Migration 002: Add guests column to registrations table

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

-- Record this migration
INSERT INTO schema_migrations (script_name) 
VALUES ('002_add_guests')
ON CONFLICT (script_name) DO NOTHING;
