import type { CollectionConfig } from 'payload'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'isPublished', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Admins can see all, public can only see published
      if (user) return true
      return {
        isPublished: {
          equals: true,
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Brief summary for listings and SEO',
      },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'Structured content blocks (headings, paragraphs, code, images, etc.)',
      },
      defaultValue: [],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Published blogs are visible on the public site',
      },
    },
    {
      name: 'searchVector',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            // Combine title and summary for search
            const searchText = `${data?.title || ''} ${data?.summary || ''}`
            return searchText.toLowerCase()
          },
        ],
      },
    },
  ],
}
