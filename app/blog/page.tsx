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
      
      {/* Initial Welcome */}
      <div className="min-h-screen flex items-center justify-center bg-[--bg] px-4">
        <div className="w-[80%] border border-dashed border-[--border] rounded-2xl bg-[--bg] shadow-sm p-8 text-center">

          {/* Title */}
          <h1 className="inline-block text-3xl md:text-4xl font-extrabold tracking-tight px-4 py-2 border border-[--border] rounded-lg mb-4">
            dtBOM&apos;s Almanac
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[--text2] mb-4">
            Personal notes, references, and write-ups.
          </p>

          {/* Description */}
          <p className="text-base leading-relaxed text-[--text3] max-w-2xl mx-auto">
            A growing collection of ideas I learn and revisit — spanning development,
            systems, and concepts worth keeping.
          </p>

          {/* Footer note */}
          <p className="text-sm text-[--text4] mt-8">
            Navigate using the sidebar or jump directly into any topic.
          </p>

        </div>
      </div>
      {/* Subject Tiles */}
      <h1> Explore </h1>
      <div className='grid grid-cols-5 justify-evenly border-2'>
        <div className='physics w-12.5 h-12.5 border-2 content-center p-2 m-2'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
        <div className='physics w-12.5 h-12.5 border-2 content-center'> <img className='' src="https://i.pinimg.com/736x/a6/01/3a/a6013a6cf972eacd63bce8172feae089.jpg"/> </div>
      </div>
    </div>
  )
}