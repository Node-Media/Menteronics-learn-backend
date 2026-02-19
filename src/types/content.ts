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
export function validateContentBlock(block: unknown): block is ContentBlock {
  if (!block || typeof block !== 'object' || !('type' in block)) {
    return false
  }

  const typedBlock = block as { type: string; [key: string]: unknown }

  switch (typedBlock.type) {
    case 'heading':
      return (
        typeof typedBlock.content === 'string' &&
        'level' in typedBlock &&
        [1, 2, 3, 4, 5, 6].includes(typedBlock.level as number)
      )
    case 'paragraph':
      return typeof typedBlock.content === 'string'
    case 'image':
      return (
        typeof typedBlock.url === 'string' &&
        typeof typedBlock.alt === 'string'
      )
    case 'code':
      return (
        typeof typedBlock.content === 'string' &&
        typeof typedBlock.language === 'string'
      )
    case 'link':
      return (
        typeof typedBlock.url === 'string' &&
        typeof typedBlock.text === 'string'
      )
    case 'list':
      return (
        'ordered' in typedBlock &&
        typeof typedBlock.ordered === 'boolean' &&
        'items' in typedBlock &&
        Array.isArray(typedBlock.items) &&
        typedBlock.items.every((item) => typeof item === 'string')
      )
    case 'table':
      return (
        'headers' in typedBlock &&
        'rows' in typedBlock &&
        Array.isArray(typedBlock.headers) &&
        Array.isArray(typedBlock.rows) &&
        typedBlock.headers.every((h) => typeof h === 'string') &&
        typedBlock.rows.every(
          (row) =>
            Array.isArray(row) && row.every((cell) => typeof cell === 'string')
        )
      )
    default:
      return false
  }
}

export function validateStructuredContent(content: unknown): content is StructuredContent {
  if (!Array.isArray(content)) {
    return false
  }
  return content.every(validateContentBlock)
}
