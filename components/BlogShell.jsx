'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

export default function BlogShell({ tree, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="layout">
      <Sidebar tree={tree} isOpen={open} onClose={() => setOpen(false)} />

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
          }}
        />
      )}

      <div className="main">
        {/* Mobile burger — only visible on small screens via CSS */}
        <div className="mobile-topbar-strip">
          <button
            className="mobile-menu-btn border-2"
            onClick={() => setOpen(o => !o)}
            aria-label="Open navigation"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="4" x2="15" y2="4"/>
              <line x1="1" y1="8" x2="15" y2="8"/>
              <line x1="1" y1="12" x2="15" y2="12"/>
            </svg>
          </button>
        </div>

        {children}
      </div>

      <style>
        {
        `
        .mobile-topbar-strip {
          display: none;
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 768px) {
          .mobile-topbar-strip { display: flex; }
        }`
        }</style>
    </div>
  )
}
