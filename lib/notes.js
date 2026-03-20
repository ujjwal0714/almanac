import fs from 'fs'
import path from 'path'

export const NOTES_DIR = path.join(process.cwd(), 'notes')
const METADATA_PATH = path.join(NOTES_DIR,'metadata.json')
let METADATA_CACHE = []

function getMetadata() {
  if (METADATA_CACHE.length === 0) {
    const raw = fs.readFileSync(METADATA_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    METADATA_CACHE = parsed.children || []
  }
  return METADATA_CACHE
}

// -- Helper Fns

// Extract folder and files from path
function toSlug(absPath){
  const normAbs  = absPath.replace(/\\/g, '/')
  const normBase = NOTES_DIR.replace(/\\/g, '/')
  const relative = normAbs
    .slice(normBase.length)
    .replace(/^\//, '')
    .replace(/\.html$/, '')
  return relative.split('/') // ['DSA', 'Trees']
}

// Extract display name using title from HTML.
function extractTitle(html, fallback){
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) return titleMatch[1].trim()
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match) return h1Match[1].trim()
  return fallback
}

// Extract <body> content from HTML
function extractBody(html){
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return match ? match[1].trim() : html
}

export function getAllNotes(){
  const nodes = getMetadata()
  const result = []

  function traverse(nodeList) {
    for (const node of nodeList) {
      if (node.type === 'file') {
        const slug = node.slug.map((s) =>
          s.replace(/\.md$/, '')
        )

        result.push({
          slug,
          title: node.title || slug.at(-1),
          href: '/blog/' + slug.join('/'),
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
    const slug = node.slug.map((s) =>
      s.replace(/\.md$/, '')
    )
    return {
      type: 'leaf',
      name: node.slug.at(-1),
      title: node.title || slug.at(-1),
      slug,
      href: '/blog/' + slug.join('/'),
    }
  }

  return nodes.map(transform)
}

function countLeaves(nodes){
  return nodes.reduce((sum, node) => {
    if (node.type === 'leaf') return sum + 1
    return sum + countLeaves(node.children)
  }, 0)
}

export function groupNotesByFolder(notes){
  return notes.reduce((acc, note) => {
    const folder = note.slug.length > 1 ? note.slug[0] : '_root'
    if (!acc[folder]) acc[folder] = []
    acc[folder].push(note)
    return acc
  }, {})
}

export function getNoteBySlug(slug) {
  const decodedSlug = slug.map(decodeURIComponent)

  const filePathParts = decodedSlug.map(s =>
    s.replace(/\.md$/, '.html')
  )

  const file = path.join(NOTES_DIR, ...filePathParts)
  const raw  = fs.readFileSync(file, 'utf8')

  const cleanSlug = decodedSlug.map(s => s.replace(/\.md$/, ''))
  console.log(cleanSlug)
  return {
    meta: {
      slug: cleanSlug,
      title: cleanSlug.at(-1),
      href: '/blog/' + cleanSlug.join('/'),
    },
    bodyHtml: extractBody(raw),
  }
}