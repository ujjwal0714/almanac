import fs from 'fs'
import path from 'path'

export const NOTES_DIR = path.join(process.cwd(), 'notes')
const METADATA_PATH = path.join(NOTES_DIR, 'metadata.json')
let METADATA_CACHE = []

function getMetadata() {
  if (METADATA_CACHE.length === 0) {
    const raw = fs.readFileSync(METADATA_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    METADATA_CACHE = parsed.children || []
  }
  return METADATA_CACHE
}

function extractBody(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return match ? match[1].trim() : html
}

// Strips known extensions (.html, .md, .pdf) for use in slugs
function stripExtension(s) {
  return s.replace(/\.(html|md|pdf)$/, '')
}

export function getAllNotes() {
  const nodes = getMetadata()
  const result = []

  function traverse(nodeList) {
    for (const node of nodeList) {
      if (node.type === 'file') {
        const isPdf = node.slug.at(-1)?.endsWith('.pdf')
        const slug = node.slug.map(s => stripExtension(s))
        result.push({
          slug,
          title: node.title || slug.at(-1),
          href: '/blog/' + slug.join('/'),
          isPdf,
        })
      } else if (node.type === 'folder') {
        traverse(node.children || [])
      }
    }
  }

  traverse(nodes)
  return result.sort((a, b) => a.title.localeCompare(b.title))
}

export function buildTree() {
  const nodes = getMetadata()

  function transform(node) {
    if (node.type === 'folder') {
      const children = (node.children || []).map(transform)
      return {
        type: 'folder',
        name: node.slug.at(-1) || '',
        label: (node.slug.at(-1) || '').replace(/-/g, ' '),
        path: node.slug,
        count: countLeaves(children),
        children,
      }
    }
    const isPdf = node.slug.at(-1)?.endsWith('.pdf')
    const slug = node.slug.map(s => stripExtension(s))
    return {
      type: 'leaf',
      name: node.slug.at(-1),
      title: node.title || slug.at(-1),
      slug,
      href: '/blog/' + slug.join('/'),
      isPdf,
    }
  }

  return nodes.map(transform)
}

function countLeaves(nodes) {
  return nodes.reduce((sum, node) => {
    if (node.type === 'leaf') return sum + 1
    return sum + countLeaves(node.children)
  }, 0)
}

export function groupNotesByFolder(notes) {
  return notes.reduce((acc, note) => {
    const folder = note.slug.length > 1 ? note.slug[0] : '_root'
    if (!acc[folder]) acc[folder] = []
    acc[folder].push(note)
    return acc
  }, {})
}

export function getNoteBySlug(slug) {
  const decoded = slug.map(decodeURIComponent)
  const cleanSlug = decoded.map(s => stripExtension(s))
  const base = path.join(NOTES_DIR, ...decoded)

  // Try PDF first, then HTML
  const pdfPath  = base + '.pdf'
  const htmlPath = base + '.html'

  if (fs.existsSync(pdfPath)) {
    return {
      meta: {
        slug: cleanSlug,
        title: cleanSlug.at(-1),
        href: '/blog/' + cleanSlug.join('/'),
      },
      type: 'pdf',
      // relative path from NOTES_DIR, used by /api/pdf?file=
      filePath: decoded.join('/') + '.pdf',
    }
  }

  const raw = fs.readFileSync(htmlPath, 'utf8')
  return {
    meta: {
      slug: cleanSlug,
      title: cleanSlug.at(-1),
      href: '/blog/' + cleanSlug.join('/'),
    },
    type: 'html',
    bodyHtml: extractBody(raw),
  }
}