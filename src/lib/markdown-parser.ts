import { remark } from 'remark'
import type { Root, Content } from 'mdast'
import type { ContentBlock } from '../types/content'

// Convert Markdown to structured content blocks
export async function markdownToBlocks(markdown: string): Promise<ContentBlock[]> {
  const processor = remark()
  const ast = processor.parse(markdown) as Root
  const blocks: ContentBlock[] = []

  function processNode(node: Content) {
    switch (node.type) {
      case 'heading':
        if (node.depth >= 1 && node.depth <= 6) {
          blocks.push({
            type: 'heading',
            level: node.depth as 1 | 2 | 3 | 4 | 5 | 6,
            content: extractText(node),
          })
        }
        break

      case 'paragraph':
        const text = extractText(node)
        if (text.trim()) {
          blocks.push({
            type: 'paragraph',
            content: text,
          })
        }
        break

      case 'code':
        blocks.push({
          type: 'code',
          language: node.lang || 'text',
          content: node.value,
        })
        break

      case 'list':
        const items = node.children.map((item) => {
          if (item.type === 'listItem') {
            return extractText(item)
          }
          return ''
        }).filter(Boolean)

        blocks.push({
          type: 'list',
          ordered: node.ordered || false,
          items,
        })
        break

      case 'image':
        blocks.push({
          type: 'image',
          url: node.url,
          alt: node.alt || '',
          caption: node.title || undefined,
        })
        break

      case 'table':
        if (node.children.length > 0) {
          const headers: string[] = []
          const rows: string[][] = []

          node.children.forEach((row, idx) => {
            if (row.type === 'tableRow') {
              const cells = row.children.map(cell => extractText(cell))
              if (idx === 0) {
                headers.push(...cells)
              } else {
                rows.push(cells)
              }
            }
          })

          if (headers.length > 0) {
            blocks.push({
              type: 'table',
              headers,
              rows,
            })
          }
        }
        break

      // Recursively process children for other node types
      default:
        if ('children' in node && Array.isArray(node.children)) {
          node.children.forEach(processNode)
        }
    }
  }

  // Process all nodes in the AST
  ast.children.forEach(processNode)

  return blocks
}

// Extract text content from a node
function extractText(node: Content | { type: string; value?: string; children?: unknown[] }): string {
  if (node.type === 'text' && 'value' in node) {
    return node.value || ''
  }

  if (node.type === 'inlineCode' && 'value' in node) {
    return `\`${node.value || ''}\``
  }

  if (node.type === 'strong' && 'children' in node && Array.isArray(node.children) && node.children[0]) {
    return `**${extractText(node.children[0] as Content)}**`
  }

  if (node.type === 'emphasis' && 'children' in node && Array.isArray(node.children) && node.children[0]) {
    return `*${extractText(node.children[0] as Content)}*`
  }

  if (node.type === 'link' && 'children' in node && 'url' in node) {
    const text = (node.children as Content[]).map((c) => extractText(c)).join('')
    return `[${text}](${node.url as string})`
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => extractText(child as Content)).join('')
  }

  if ('value' in node && node.value) {
    return node.value
  }

  return ''
}

// Calculate reading time from content blocks
export function calculateReadingTime(blocks: ContentBlock[]): number {
  let wordCount = 0

  blocks.forEach((block) => {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
        wordCount += block.content.split(/\s+/).length
        break
      case 'code':
        // Code takes longer to read
        wordCount += block.content.split(/\s+/).length * 1.5
        break
      case 'list':
        block.items.forEach((item) => {
          wordCount += item.split(/\s+/).length
        })
        break
      case 'table':
        wordCount += block.headers.length * 2
        block.rows.forEach((row) => {
          row.forEach((cell) => {
            wordCount += cell.split(/\s+/).length
          })
        })
        break
    }
  })

  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200)
}
