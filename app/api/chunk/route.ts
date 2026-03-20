import { NextRequest, NextResponse } from 'next/server'
import { getNoteBySlug } from '@/lib/notes'

const CHUNK_SIZE = 8

function splitIntoChunks(html: string, size: number): string[] {
  const parts = html
    .split(/(?=<(?:h[1-6]|p|ul|ol|pre|blockquote|table|div|hr|figure)[\s\/>])/i)
    .map(s => s.trim())
    .filter(Boolean)

  if (parts.length === 0) return [html]

  const chunks: string[] = []
  for (let i = 0; i < parts.length; i += size) {
    chunks.push(parts.slice(i, i + size).join('\n'))
  }
  return chunks
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slugParam  = searchParams.get('slug')
  const chunkIndex = parseInt(searchParams.get('chunk') ?? '0', 10)

  if (!slugParam) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  const slug = slugParam.split('/').map(decodeURIComponent)

  try {
    const { bodyHtml } = getNoteBySlug(slug)
    const chunks = splitIntoChunks(bodyHtml, CHUNK_SIZE)

    if (chunkIndex < 0 || chunkIndex >= chunks.length) {
      return NextResponse.json({ error: 'Out of range' }, { status: 404 })
    }

    return NextResponse.json({
      html:        chunks[chunkIndex],
      totalChunks: chunks.length,
      chunkIndex,
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
