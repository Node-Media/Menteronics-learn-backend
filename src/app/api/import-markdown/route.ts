import { NextRequest, NextResponse } from 'next/server'
import { markdownToBlocks, calculateReadingTime } from '@/lib/markdown-parser'
import { validateStructuredContent } from '@/types/content'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.md')) {
      return NextResponse.json(
        { error: 'File must be a Markdown (.md) file' },
        { status: 400 }
      )
    }

    const markdown = await file.text()

    // Convert markdown to structured blocks
    const blocks = await markdownToBlocks(markdown)

    // Validate the blocks
    if (!validateStructuredContent(blocks)) {
      return NextResponse.json(
        { error: 'Invalid content structure generated from markdown' },
        { status: 400 }
      )
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(blocks)

    // Extract title from first heading or filename
    let title = file.name.replace('.md', '').replace(/[-_]/g, ' ')
    const firstHeading = blocks.find((b) => b.type === 'heading')
    if (firstHeading && firstHeading.type === 'heading') {
      title = firstHeading.content
    }

    return NextResponse.json({
      title,
      content: blocks,
      readingTime,
      blockCount: blocks.length,
    })
  } catch (error) {
    console.error('Markdown import error:', error)
    return NextResponse.json(
      { error: 'Failed to parse markdown file' },
      { status: 500 }
    )
  }
}
