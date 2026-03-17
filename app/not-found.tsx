import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>This note doesn&apos;t exist or has been moved.</p>
      <Link href="/blog">
        ← Back to notes
      </Link>
    </div>
  )
}
