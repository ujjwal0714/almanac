'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AnyNode, TreeNode } from '@/lib/notes'

interface Props {
  tree: AnyNode[]
  isOpen: boolean
  onClose: () => void
}

function FolderNode({ node, depth, query }: { node: TreeNode; depth: number; query: string }) {
  const pathname = usePathname()

  const hasActiveChild = (nodes: AnyNode[]): boolean =>
    nodes.some(n =>
      n.type === 'leaf'
        ? pathname === n.href
        : hasActiveChild(n.children)
    )

  const [open, setOpen] = useState(() => hasActiveChild(node.children))

  useEffect(() => {
    if (hasActiveChild(node.children)) setOpen(true)
  }, [pathname])

  const matchesQuery = (nodes: AnyNode[], q: string): AnyNode[] => {
    if (!q) return nodes
    return nodes.flatMap(n => {
      if (n.type === 'leaf') {
        return n.title.toLowerCase().includes(q) || n.slug.join('/').toLowerCase().includes(q)
          ? [n] : []
      }
      const filteredChildren = matchesQuery(n.children, q)
      return filteredChildren.length > 0 ? [{ ...n, children: filteredChildren }] : []
    })
  }

  const visibleChildren = matchesQuery(node.children, query.toLowerCase())
  if (visibleChildren.length === 0) return null

  const depthClass = `depth-${Math.min(depth, 2)}`

  return (
    <div className={`tree-folder ${depthClass}`}>
      <div className="tree-folder-row" onClick={() => setOpen(o => !o)}>
        <svg className={`tree-chevron ${open ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2l4 4-4 4" />
        </svg>
        <svg className="tree-folder-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M1 3.5A1.5 1.5 0 012.5 2h3.172a1.5 1.5 0 011.06.44l.829.828A1.5 1.5 0 008.62 3.75H13.5A1.5 1.5 0 0115 5.25v7a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 12.25V3.5z" />
        </svg>
        <span className="tree-folder-name">{node.label}</span>
        <span className="tree-folder-count">{node.count}</span>
      </div>

      <div className={`tree-children ${open ? '' : 'collapsed'}`}>
        {visibleChildren.map((child, i) =>
          child.type === 'folder' ? (
            <FolderNode key={i} node={child} depth={depth + 1} query={query} />
          ) : (
            <LeafLink key={i} href={child.href} title={child.title} depth={depth} />
          )
        )}
      </div>
    </div>
  )
}

function LeafLink({ href, title, depth }: { href: string; title: string; depth: number }) {
  const pathname = usePathname()
  const active = pathname === href
  const depthClass = `depth-${Math.min(depth, 2)}`
  return (
    <Link href={href} className={`nav-link ${depthClass} ${active ? 'active' : ''}`} title={title}>
      <span className="nav-link-dot" />
      {title}
    </Link>
  )
}

export default function Sidebar({ tree, isOpen, onClose }: Props) {
  const pathname = usePathname()
  const [query, setQuery] = useState('')

  useEffect(() => { onClose() }, [pathname])

  const filteredTree = query
    ? tree.flatMap(n => {
        if (n.type === 'leaf') {
          const q = query.toLowerCase()
          return n.title.toLowerCase().includes(q) || n.slug.join('/').toLowerCase().includes(q)
            ? [n] : []
        }
        return [n]
      })
    : tree

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link href="/blog" className="sidebar-logo">
          dtbom<span>.space</span>
        </Link>
        <span className="sidebar-sub">Notes &amp; Writing</span>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search notes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search notes"
        />
      </div>

      <nav className="sidebar-nav" aria-label="Notes navigation">
        {filteredTree.map((node, i) =>
          node.type === 'folder' ? (
            <FolderNode key={i} node={node} depth={0} query={query} />
          ) : (
            <LeafLink key={i} href={node.href} title={node.title} depth={0} />
          )
        )}
        {filteredTree.length === 0 && (
          <div style={{ padding: '20px 12px', fontSize: '12px', color: 'var(--text4)', textAlign: 'center' }}>
            No notes match &ldquo;{query}&rdquo;
          </div>
        )}
      </nav>
    </aside>
  )
}
