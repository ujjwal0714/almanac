import Link from 'next/link'
import { getAllNotes, groupNotesByFolder } from '@/lib/notes'
import ThemeToggle from '@/components/ThemeToggle'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notes — dtbom.space' }

export default function BlogIndex() {
  const notes = getAllNotes()
  const grouped = groupNotesByFolder(notes)
  const folderNames = Object.keys(grouped).filter(k => k !== '_root').sort()
  const rootNotes = grouped['_root'] ?? []

  return (
    <div>
      <div className="topbar">
        <div className="breadcrumb">
          <Link href="/blog">blog</Link>
          <span className="sep">/</span>
          <span className="current">all notes</span>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: '11px', color: 'var(--text4)', fontFamily: 'var(--font-mono)' }}>
            {notes.length} notes
          </span>
          <ThemeToggle />
        </div>
      </div>

      <div className="page-body">
        <div className="index-header">
          <h1 className="index-title">
            My <em>Notes</em>
          </h1>
          <p className="index-desc">
            Personal notes, references, and write-ups — synced from Typora.
          </p>
        </div>

        {rootNotes.length > 0 && (
          <div className="folder-section">
            {rootNotes.map(note => (
              <NoteCard key={note.href} note={note} />
            ))}
          </div>
        )}

        {folderNames.map(folder => (
          <div key={folder} className="folder-section">
            <div className="folder-heading">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M1 3.5A1.5 1.5 0 012.5 2h3.172a1.5 1.5 0 011.06.44l.829.828A1.5 1.5 0 008.62 3.75H13.5A1.5 1.5 0 0115 5.25v7a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.25V3.5z"/>
              </svg>
              {folder.replace(/-/g, ' ')}
              <span style={{ fontWeight: 400, opacity: 0.7 }}>{grouped[folder].length}</span>
            </div>
            {grouped[folder].map(note => (
              <NoteCard key={note.href} note={note} />
            ))}
          </div>
        ))}

        {notes.length === 0 && (
          <p style={{ color: 'var(--text4)', fontSize: '13px', marginTop: '32px' }}>
            No notes yet. Add <code style={{ fontSize: '12px' }}>.md</code> files to the{' '}
            <code style={{ fontSize: '12px' }}>notes/</code> folder.
          </p>
        )}
      </div>
    </div>
  )
}

function NoteCard({ note }: { note: ReturnType<typeof getAllNotes>[0] }) {
  return (
    <Link href={note.href} className="note-card">
      <div className="note-card-left">
        <div className="note-card-title">{note.title}</div>
        {note.description && (
          <div className="note-card-desc">{note.description}</div>
        )}
      </div>
      {note.date && (
        <span className="note-card-date">
          {new Date(note.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </span>
      )}
    </Link>
  )
}
