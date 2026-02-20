-- Add image size columns to media table for PayloadCMS imageSizes feature
-- Run this in your Supabase SQL Editor

ALTER TABLE media 
ADD COLUMN IF NOT EXISTS sizes_thumbnail_url text,
ADD COLUMN IF NOT EXISTS sizes_thumbnail_width numeric,
ADD COLUMN IF NOT EXISTS sizes_thumbnail_height numeric,
ADD COLUMN IF NOT EXISTS sizes_thumbnail_mime_type text,
ADD COLUMN IF NOT EXISTS sizes_thumbnail_filesize numeric,
ADD COLUMN IF NOT EXISTS sizes_thumbnail_filename text,
ADD COLUMN IF NOT EXISTS sizes_card_url text,
ADD COLUMN IF NOT EXISTS sizes_card_width numeric,
ADD COLUMN IF NOT EXISTS sizes_card_height numeric,
ADD COLUMN IF NOT EXISTS sizes_card_mime_type text,
ADD COLUMN IF NOT EXISTS sizes_card_filesize numeric,
ADD COLUMN IF NOT EXISTS sizes_card_filename text,
ADD COLUMN IF NOT EXISTS sizes_tablet_url text,
ADD COLUMN IF NOT EXISTS sizes_tablet_width numeric,
ADD COLUMN IF NOT EXISTS sizes_tablet_height numeric,
ADD COLUMN IF NOT EXISTS sizes_tablet_mime_type text,
ADD COLUMN IF NOT EXISTS sizes_tablet_filesize numeric,
ADD COLUMN IF NOT EXISTS sizes_tablet_filename text,
ADD COLUMN IF NOT EXISTS sizes_large_url text,
ADD COLUMN IF NOT EXISTS sizes_large_width numeric,
ADD COLUMN IF NOT EXISTS sizes_large_height numeric,
ADD COLUMN IF NOT EXISTS sizes_large_mime_type text,
ADD COLUMN IF NOT EXISTS sizes_large_filesize numeric,
ADD COLUMN IF NOT EXISTS sizes_large_filename text;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'media' 
AND column_name LIKE 'sizes_%'
ORDER BY column_name;
