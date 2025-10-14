-- KTV Football App - Add Event Name Column
-- Migration 004: Add name column to events table

DO $$ 
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE events ADD COLUMN name VARCHAR(255);
  END IF;
  
  -- Update existing events: Extract name from location field if it contains " - "
  -- Otherwise keep location as name
  UPDATE events 
  SET name = CASE 
    WHEN location LIKE '%-%' THEN SPLIT_PART(location, '-', 1)
    ELSE location
  END
  WHERE name IS NULL;
  
END $$;

-- Record migration
INSERT INTO schema_migrations (script_name) 
VALUES ('004_add_event_name') 
ON CONFLICT (script_name) DO NOTHING;
