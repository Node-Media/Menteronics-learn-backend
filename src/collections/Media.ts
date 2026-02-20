import type { CollectionConfig } from 'payload'
import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from '../lib/supabase'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Skip if Supabase is not configured
        if (!isSupabaseConfigured()) {
          console.log('Supabase not configured, skipping upload')
          return doc
        }

        // Only upload to Supabase on create
        if (operation !== 'create' || !doc.filename) {
          return doc
        }

        try {
          console.log('Uploading to Supabase:', doc.filename)

          // Construct file URL from Payload
          const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_URL || 'http://localhost:3000'
          const fileURL = `${serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`}/media/${doc.filename}`
          
          // Fetch the file from Payload
          const response = await fetch(fileURL)
          if (!response.ok) {
            console.error(`Failed to fetch file: ${response.statusText}`)
            return doc
          }

          const arrayBuffer = await response.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const fileName = `${Date.now()}-${doc.filename}`

          console.log('File fetched, uploading to Supabase...')

          // Upload to Supabase Storage
          const { data, error } = await supabase!.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, buffer, {
              contentType: doc.mimeType,
              upsert: false,
            })

          if (error) {
            console.error('Supabase upload error:', error)
            return doc
          }

          console.log('Upload successful:', data)

          // Get public URL
          const { data: urlData } = supabase!.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName)

          console.log('Public URL:', urlData.publicUrl)

          // Update document with Supabase URL
          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              url: urlData.publicUrl,
            },
          })

          return doc
        } catch (error) {
          console.error('afterChange hook error:', error)
          return doc
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        // Skip if Supabase is not configured
        if (!isSupabaseConfigured()) {
          return
        }

        // Delete from Supabase Storage
        if (doc.filename) {
          try {
            // Extract Supabase filename from URL if it exists
            let fileToDelete = doc.filename
            
            if (doc.url && doc.url.includes(STORAGE_BUCKET)) {
              fileToDelete = doc.url.split('/').pop() || doc.filename
            }

            console.log('Deleting from Supabase:', fileToDelete)
            
            await supabase!.storage.from(STORAGE_BUCKET).remove([fileToDelete])
            console.log('Deleted successfully')
          } catch (error) {
            console.error('Error deleting file from Supabase:', error)
          }
        }
      },
    ],
  },
}
