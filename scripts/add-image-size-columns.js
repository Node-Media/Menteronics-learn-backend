import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const addImageSizeColumns = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  
  try {
    console.log('Connecting to database...')
    console.log('Adding image size columns to media table...\n')
    
    // SQL to add the missing columns
    const sql = `
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
    `
    
    // Execute the SQL
    await pool.query(sql)
    
    console.log('✅ Successfully added image size columns!')
    console.log('\nColumns added:')
    console.log('  - sizes_thumbnail_* (6 columns)')
    console.log('  - sizes_card_* (6 columns)')
    console.log('  - sizes_tablet_* (6 columns)')
    console.log('  - sizes_large_* (6 columns)')
    console.log('\n🎉 Database schema updated! You can now use image sizes.')
    
  } catch (error) {
    console.error('❌ Error adding columns:', error.message)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

addImageSizeColumns()
