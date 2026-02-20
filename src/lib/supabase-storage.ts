import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { supabase, STORAGE_BUCKET } from './supabase'

export const supabaseAdapter: Adapter = ({ collection, prefix }) => {
  return {
    name: 'supabase-storage',
    handleUpload: async ({ file, data }) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      try {
        const fileName = `${prefix ? `${prefix}/` : ''}${file.filename}`

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, file.buffer, {
            contentType: file.mimeType,
            upsert: true,
          })

        if (error) {
          console.error('Supabase upload error:', error)
          throw error
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fileName)

        console.log('File uploaded:', urlData.publicUrl)

        return {
          url: urlData.publicUrl,
        }
      } catch (error) {
        console.error('Upload error:', error)
        throw error
      }
    },
    handleDelete: async ({ doc, filename }) => {
      if (!supabase) {
        return
      }

      try {
        const fileName = `${prefix ? `${prefix}/` : ''}${filename}`
        await supabase.storage.from(STORAGE_BUCKET).remove([fileName])
        console.log('File deleted:', fileName)
      } catch (error) {
        console.error('Delete error:', error)
      }
    },
    generateURL: ({ filename, prefix: urlPrefix }) => {
      if (!supabase) {
        return ''
      }

      const fileName = `${urlPrefix ? `${urlPrefix}/` : ''}${filename}`
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      return data.publicUrl
    },
    staticHandler: async (req, { params }) => {
      // For Supabase, we don't need a static handler since files are served directly
      // from Supabase's public URLs. Just return a redirect.
      if (!supabase) {
        return new Response('Supabase not configured', { status: 500 })
      }

      const fileName = `${params.filename}`
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName)
      
      return Response.redirect(data.publicUrl, 302)
    },
  }
}
