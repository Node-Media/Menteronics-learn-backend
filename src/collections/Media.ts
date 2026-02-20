import type { CollectionConfig } from 'payload'

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
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: undefined, // Maintain aspect ratio, no cropping
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: undefined, // Maintain aspect ratio, no cropping
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined, // Maintain aspect ratio
        position: 'centre',
      },
      {
        name: 'large',
        width: 1920,
        height: undefined, // Maintain aspect ratio
        position: 'centre',
      },
    ],
    mimeTypes: ['image/*'],
    adminThumbnail: 'thumbnail',
    crop: true, // Enable cropping
    focalPoint: true, // Enable focal point selection
    formatOptions: {
      format: 'webp', // Convert to WebP for better compression
      options: {
        quality: 85,
      },
    },
  },
}
