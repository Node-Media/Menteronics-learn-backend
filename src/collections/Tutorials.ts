import type { CollectionConfig } from 'payload'

export const Tutorials: CollectionConfig = {
  slug: 'tutorials',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'order', 'isPublished', 'updatedAt'],
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
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: 'Select the technology category',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        description: 'Sequence order (1, 2, 3...) - tutorials are displayed in ascending order',
        position: 'sidebar',
      },
      validate: async (value, { data, req, operation, id }) => {
        // Only validate on create/update with a category
        if (!data?.category || value === undefined) {
          return true
        }

        // Get the category ID (could be string or object)
        const categoryId = typeof data.category === 'object' ? data.category.id : data.category

        // Check if another tutorial in the same category has this order
        const existing = await req.payload.find({
          collection: 'tutorials',
          where: {
            and: [
              { category: { equals: categoryId } },
              { order: { equals: value } },
              // Exclude the current document if updating
              ...(operation === 'update' && id ? [{ id: { not_equals: id } }] : []),
            ],
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          return `Order ${value} is already used by another tutorial in this category. Please choose a different order number.`
        }

        return true
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
      name: 'readingTime',
      type: 'number',
      admin: {
        description: 'Estimated reading time in minutes',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Published tutorials are visible on the public site',
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
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-calculate reading time if not provided
        if (data.content && !data.readingTime) {
          const wordCount = JSON.stringify(data.content).split(/\s+/).length
          data.readingTime = Math.ceil(wordCount / 200) // Average reading speed
        }
        return data
      },
    ],
  },
}
