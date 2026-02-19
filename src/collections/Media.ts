import type { CollectionConfig } from 'payload'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'

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
    {
      name: 'url',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
  upload: {
    staticDir: '/tmp',
    adminThumbnail: 'thumbnail',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Skip if no file data
        if (!data || !req.file) {
          return data
        }

        try {
          const file = req.file
          const fileBuffer = file.data
          const fileName = `${Date.now()}-${file.name}`

          // Upload to Supabase Storage
          const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, fileBuffer, {
              contentType: file.mimetype,
              upsert: false,
            })

          if (error) {
            console.error('Supabase upload error:', error)
            throw new Error(`Failed to upload file: ${error.message}`)
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName)

          // Add URL to data
          data.url = urlData.publicUrl

          return data
        } catch (error) {
          console.error('Upload error:', error)
          throw error
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        // Delete from Supabase Storage
        if (doc.url) {
          try {
            const fileName = doc.url.split('/').pop()
            if (fileName) {
              await supabase.storage.from(STORAGE_BUCKET).remove([fileName])
            }
          } catch (error) {
            console.error('Error deleting file from Supabase:', error)
          }
        }
      },
    ],
  },
}
