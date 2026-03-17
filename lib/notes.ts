import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

export const NOTES_DIR = path.join(process.cwd(), 'notes')

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NoteMeta {
  slug: string[]
  title: string
  date: string | null
  description: string | null
  tags: string[]
  href: string
}

export interface TreeNode {
  type: 'folder'
  name: string
  label: string
  path: string[]
  count: number
  children: AnyNode[]
}

export interface LeafNode {
  type: 'leaf'
  name: string
  title: string
  href: string
  slug: string[]
}

export type AnyNode = TreeNode | LeafNode

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert an absolute file path to a slug array, cross-platform.
 * Works on Windows (path.sep = '\') and Unix (path.sep = '/').
 * e.g. C:\...\notes\Intellisense\API.md → ['Intellisense', 'API']
 */
function toSlug(absPath: string): string[] {
  const normAbs  = absPath.replace(/\\/g, '/')
  const normBase = NOTES_DIR.replace(/\\/g, '/')
  // Remove the base dir prefix (with trailing slash) then strip .md
  const relative = normAbs
    .slice(normBase.length)          // removes the base portion
    .replace(/^\//, '')              // strip any leading slash
    .replace(/\.md$/, '')
  return relative.split('/')
}

// ── File walking ──────────────────────────────────────────────────────────────

function walkDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walkDir(full) : [full]
  })
}

// ── Get all notes flat list ───────────────────────────────────────────────────

export function getAllNotes(): NoteMeta[] {
  return walkDir(NOTES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const slug = toSlug(file)
      const raw  = fs.readFileSync(file, 'utf8')
      const { data } = matter(raw)
      return {
        slug,
        title:       data.title       ?? slug.at(-1)!.replace(/-/g, ' '),
        date:        data.date        ? String(data.date) : null,
        description: data.description ?? null,
        tags:        Array.isArray(data.tags) ? data.tags : [],
        href:        '/blog/' + slug.join('/'),
      }
    })
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date)
      return a.title.localeCompare(b.title)
    })
}

// ── Build recursive tree ──────────────────────────────────────────────────────

export function buildTree(dir: string = NOTES_DIR, pathParts: string[] = []): AnyNode[] {
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const nodes: AnyNode[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const childPath = [...pathParts, entry.name]
      const children  = buildTree(fullPath, childPath)
      const count     = countLeaves(children)
      nodes.push({
        type: 'folder',
        name:  entry.name,
        label: entry.name.replace(/-/g, ' '),
        path:  childPath,
        count,
        children,
      })
    } else if (entry.name.endsWith('.md')) {
      const raw            = fs.readFileSync(fullPath, 'utf8')
      const { data }       = matter(raw)
      const nameWithoutExt = entry.name.replace(/\.md$/, '')
      const slug           = [...pathParts, nameWithoutExt]
      const title          = data.title ?? nameWithoutExt.replace(/-/g, ' ')
      nodes.push({
        type:  'leaf',
        name:  entry.name,
        title,
        slug,
        href:  '/blog/' + slug.join('/'),
      })
    }
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    const aLabel = a.type === 'folder' ? a.label : a.title
    const bLabel = b.type === 'folder' ? b.label : b.title
    return aLabel.localeCompare(bLabel)
  })
}

function countLeaves(nodes: AnyNode[]): number {
  return nodes.reduce((sum, node) => {
    if (node.type === 'leaf') return sum + 1
    return sum + countLeaves((node as TreeNode).children)
  }, 0)
}

// ── Group flat list by top-level folder ──────────────────────────────────────

export function groupNotesByFolder(notes: NoteMeta[]): Record<string, NoteMeta[]> {
  return notes.reduce<Record<string, NoteMeta[]>>((acc, note) => {
    const folder = note.slug.length > 1 ? note.slug[0] : '_root'
    if (!acc[folder]) acc[folder] = []
    acc[folder].push(note)
    return acc
  }, {})
}

// ── Get single note ───────────────────────────────────────────────────────────

export async function getNoteBySlug(slug: string[]): Promise<{
  meta: NoteMeta
  contentHtml: string
}> {
  const decodedSlug = slug.map(decodeURIComponent)
  const file = path.join(NOTES_DIR, ...decodedSlug) + '.md'
  const raw  = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content)

  return {
    meta: {
      slug,
      title:       data.title       ?? slug.at(-1)!.replace(/-/g, ' '),
      date:        data.date        ? String(data.date) : null,
      description: data.description ?? null,
      tags:        Array.isArray(data.tags) ? data.tags : [],
      href:        '/blog/' + slug.join('/'),
    },
    contentHtml: processed.toString(),
  }
}
