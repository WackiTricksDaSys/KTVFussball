-- KTV Football App - Add Items Column to Registrations
-- Migration 005: Add items (utensilien) column for tracking what members bring

DO $$ 
BEGIN
  -- Add items column if it doesn't exist (JSONB for flexibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' 
    AND column_name = 'items'
  ) THEN
    ALTER TABLE registrations ADD COLUMN items JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Record migration
INSERT INTO schema_migrations (script_name) 
VALUES ('005_add_items_to_registrations') 
ON CONFLICT (script_name) DO NOTHING;
