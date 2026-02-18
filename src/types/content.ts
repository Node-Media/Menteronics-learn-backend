// Structured Content Block Types for Tutorials and Blogs

export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'code'
  | 'link'
  | 'list'
  | 'table'

export interface BaseBlock {
  id?: string
  type: ContentBlockType
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  content: string
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  content: string
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  url: string
  alt: string
  caption?: string
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  content: string
  filename?: string
}

export interface LinkBlock extends BaseBlock {
  type: 'link'
  url: string
  text: string
}

export interface ListBlock extends BaseBlock {
  type: 'list'
  ordered: boolean
  items: string[]
}

export interface TableBlock extends BaseBlock {
  type: 'table'
  headers: string[]
  rows: string[][]
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageBlock
  | CodeBlock
  | LinkBlock
  | ListBlock
  | TableBlock

export type StructuredContent = ContentBlock[]

// Validation function
export function validateContentBlock(block: any): block is ContentBlock {
  if (!block || typeof block !== 'object' || !block.type) {
    return false
  }

  switch (block.type) {
    case 'heading':
      return (
        typeof block.content === 'string' &&
        [1, 2, 3, 4, 5, 6].includes(block.level)
      )
    case 'paragraph':
      return typeof block.content === 'string'
    case 'image':
      return (
        typeof block.url === 'string' &&
        typeof block.alt === 'string'
      )
    case 'code':
      return (
        typeof block.content === 'string' &&
        typeof block.language === 'string'
      )
    case 'link':
      return (
        typeof block.url === 'string' &&
        typeof block.text === 'string'
      )
    case 'list':
      return (
        typeof block.ordered === 'boolean' &&
        Array.isArray(block.items) &&
        block.items.every((item: any) => typeof item === 'string')
      )
    case 'table':
      return (
        Array.isArray(block.headers) &&
        Array.isArray(block.rows) &&
        block.headers.every((h: any) => typeof h === 'string') &&
        block.rows.every(
          (row: any) =>
            Array.isArray(row) && row.every((cell: any) => typeof cell === 'string')
        )
      )
    default:
      return false
  }
}

export function validateStructuredContent(content: any): content is StructuredContent {
  if (!Array.isArray(content)) {
    return false
  }
  return content.every(validateContentBlock)
}
