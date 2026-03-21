import { getAllNotes, getNoteBySlug } from '@/lib/notes'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import PrintButton from '@/components/PrintButton'
import VirtualNote from '@/components/VirtualNote'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false })

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

interface Props {
  params: { slug: string[] }
}

export async function generateStaticParams() {
  return getAllNotes().map(n => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { meta } = getNoteBySlug(params.slug)
    return { title: `${meta.title} — dtbom.space` }
  } catch {
    return { title: 'Note not found' }
  }
}

export default function NotePage({ params }: Props) {
  let note
  try {
    note = getNoteBySlug(params.slug)
  } catch {
    notFound()
  }

  const { meta, type } = note
  const breadcrumbs = meta.slug.slice(0, -1)

  return (
    <div>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/blog">blog</Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <span className="sep">/</span>
              <span style={{ color: 'var(--text3)', textTransform: 'capitalize' }}>
                {crumb.replace(/-/g, ' ')}
              </span>
            </span>
          ))}
          <span className="sep">/</span>
          <span className="current">{meta.title}</span>
        </div>

        <div className="topbar-right">
          {/* Hide print button for PDFs — browser handles that */}
          {type === 'html' && <PrintButton />}
          <ThemeToggle />
        </div>
      </div>

      {type === 'pdf' ? (
        <div className="page-body">
          <PDFViewer
            url={`/api/pdf?file=${encodeURIComponent(note.filePath)}`}
          />
        </div>
      ) : (
        <article className="page-body">
          <VirtualNote
            slug={meta.slug.join('/')}
            totalChunks={splitIntoChunks(note.bodyHtml, CHUNK_SIZE).length}
            firstHtml={splitIntoChunks(note.bodyHtml, CHUNK_SIZE)[0] ?? ''}
          />
        </article>
      )}
    </div>
  )
}