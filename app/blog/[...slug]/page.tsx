import { getAllNotes, getNoteBySlug } from '@/lib/notes'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import PrintButton from '@/components/PrintButton'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string[] }
}

export async function generateStaticParams() {
  return getAllNotes().map(n => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { meta } = await getNoteBySlug(params.slug)
    return {
      title: `${meta.title} — dtbom.space`,
      description: meta.description ?? undefined,
    }
  } catch {
    return { title: 'Note not found' }
  }
}

export default async function NotePage({ params }: Props) {
  let data
  try {
    data = await getNoteBySlug(params.slug)
  } catch {
    notFound()
  }

  const { meta, contentHtml } = data
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
          {meta.tags.map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
          <PrintButton />
          <ThemeToggle />
        </div>
      </div>

      <article className="page-body">
        <header className="note-header">
          <h1 className="note-title">{meta.title}</h1>
          <div className="note-meta">
            {meta.date && (
              <span className="note-meta-date">
                {new Date(meta.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            )}
          </div>
        </header>

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </div>
  )
}
