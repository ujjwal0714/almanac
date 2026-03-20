'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const OVERSCAN = 1     // chunks to keep loaded above/below the visible ones
const SENTINEL_H = 400  // px height of placeholder when chunk is evicted

export default function VirtualNote({ slug, totalChunks, firstHtml }) {
  const [chunks, setChunks] = useState(() =>
    Array.from({ length: totalChunks }, (_, i) => ({
      html: i === 0 ? firstHtml : null,
      height: SENTINEL_H,
      loaded: i === 0,
      loading: false,
      error: false,
    }))
  )

  const rowRefs = useRef([])
  const visibleSet = useRef(new Set([0]))
  const fetchingSet = useRef(new Set())
  const loadTimeout = useRef(null)

  const fetchChunk = useCallback(async (index) => {
    if (fetchingSet.current.has(index)) return
    fetchingSet.current.add(index)

    setChunks(prev => {
      if (prev[index].loaded || prev[index].loading) return prev
      const next = [...prev]
      next[index] = { ...next[index], loading: true }
      return next
    })

    try {
      // await new Promise(res => setTimeout(res, 2000))
      const res = await fetch(`/api/chunk?slug=${encodeURIComponent(slug)}&chunk=${index}`)
      const data = await res.json()
      setChunks(prev => {
        const next = [...prev]
        next[index] = { ...next[index], html: data.html, loaded: true, loading: false, error: false }
        return next
      })
    } catch {
      setChunks(prev => {
        const next = [...prev]
        next[index] = { ...next[index], loading: false, error: true }
        return next
      })
    } finally {
      fetchingSet.current.delete(index)
    }
  }, [slug])

  const evict = useCallback((visible) => {
    setChunks(prev => {
      const next = [...prev]
      let changed = false
      for (let i = 0; i < next.length; i++) {
        const inWindow = [...visible].some(v => Math.abs(v - i) <= OVERSCAN)
        if (!inWindow && next[i].html !== null) {
          // Capture real height before evicting
          const el = rowRefs.current[i]
          const h = el ? el.getBoundingClientRect().height : next[i].height
          next[i] = { ...next[i], html: null, loaded: false, height: h || SENTINEL_H }
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [])

  const loadNear = useCallback((visible) => {
    for (const v of visible) {
      for (let d = -OVERSCAN; d <= OVERSCAN; d++) {
        const idx = v + d
        if (idx >= 0 && idx < totalChunks) {
          setChunks(prev => {
            if (!prev[idx].loaded && !prev[idx].loading) {
              fetchChunk(idx)
            }
            return prev
          })
        }
      }
    }
  }, [totalChunks, fetchChunk])

  // ── IntersectionObserver ─────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const idx = parseInt(entry.target.dataset.chunkIndex ?? '-1', 10)
          if (idx < 0) return
          if (entry.isIntersecting) {
            visibleSet.current.add(idx)
          } else {
            visibleSet.current.delete(idx)
          }
        })
        if (loadTimeout.current) clearTimeout(loadTimeout.current)

        loadTimeout.current = setTimeout(() => {
          loadNear(visibleSet.current)
          evict(visibleSet.current)
        }, 800) // adjust delay
      },
      { rootMargin: '300px 0px' }   // start loading 300px before entering view
    )

    rowRefs.current.forEach((el, i) => {
      if (el) {
        el.dataset.chunkIndex = String(i)
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [totalChunks, loadNear, evict])

  // ── Prevent select / right-click on the whole note ──────────────────────────
  useEffect(() => {
    const block = (e) => e.preventDefault()
    document.addEventListener('contextmenu', block)
    return () => document.removeEventListener('contextmenu', block)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="virtual-note">
      {chunks.map((chunk, i) => (
        <div
          key={i}
          ref={el => { rowRefs.current[i] = el }}
          data-chunk-index={i}
          className="chunk-row"
          style={{
            minHeight: chunk.html === null ? `${chunk.height}px` : undefined,
          }}
        >
          {chunk.html !== null ? (
            <div
              className="prose typora-note"
              dangerouslySetInnerHTML={{ __html: chunk.html }}
            />
          ) : chunk.loading ? (
            <div className="chunk-loading">
              <span className="chunk-spinner" />
            </div>
          ) : chunk.error ? (
            <div className="chunk-error" onClick={() => fetchChunk(i)}>
              Failed to load — click to retry
            </div>
          ) : (
            // Placeholder — invisible but keeps scroll height
            <div style={{ height: `${chunk.height}px` }} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  )
}
