import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Tutorials } from './collections/Tutorials'
import { Blogs } from './collections/Blogs'
import { supabaseAdapter } from './lib/supabase-storage'
import { isSupabaseConfigured } from './lib/supabase'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Tutorials, Blogs],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    migrationDir: path.resolve(dirname, '../migrations'),
  }),
  sharp,
  plugins: [
    // Only use cloud storage if Supabase is configured
    ...(isSupabaseConfigured()
      ? [
          cloudStoragePlugin({
            collections: {
              media: {
                adapter: supabaseAdapter,
                disablePayloadAccessControl: true,
              },
            },
          }),
        ]
      : []),
  ],
})
