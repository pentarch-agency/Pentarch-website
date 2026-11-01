-- Add first_name and last_name columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Backfill from full_name where possible (split on first space)
UPDATE user_profiles
SET
  first_name = CASE WHEN full_name IS NOT NULL AND full_name != '' THEN split_part(full_name, ' ', 1) ELSE NULL END,
  last_name  = CASE WHEN full_name IS NOT NULL AND position(' ' IN full_name) > 0 THEN substring(full_name FROM position(' ' IN full_name) + 1) ELSE NULL END
WHERE first_name IS NULL AND last_name IS NULL;
