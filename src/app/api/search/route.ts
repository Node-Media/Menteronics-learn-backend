import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Search in tutorials
    const tutorialsResult = await payload.find({
      collection: 'tutorials',
      where: {
        and: [
          {
            isPublished: {
              equals: true,
            },
          },
          {
            or: [
              {
                title: {
                  contains: query,
                },
              },
              {
                summary: {
                  contains: query,
                },
              },
              {
                searchVector: {
                  contains: query.toLowerCase(),
                },
              },
            ],
          },
        ],
      },
      limit: 20,
    })

    // Search in blogs
    const blogsResult = await payload.find({
      collection: 'blogs',
      where: {
        and: [
          {
            isPublished: {
              equals: true,
            },
          },
          {
            or: [
              {
                title: {
                  contains: query,
                },
              },
              {
                summary: {
                  contains: query,
                },
              },
              {
                searchVector: {
                  contains: query.toLowerCase(),
                },
              },
            ],
          },
        ],
      },
      limit: 20,
    })

    // Format results
    const tutorials = tutorialsResult.docs.map((doc) => ({
      type: 'tutorial' as const,
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      summary: doc.summary,
      category: doc.category,
    }))

    const blogs = blogsResult.docs.map((doc) => ({
      type: 'blog' as const,
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      summary: doc.summary,
    }))

    const results = [...tutorials, ...blogs]

    return NextResponse.json({
      query,
      total: results.length,
      results,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
