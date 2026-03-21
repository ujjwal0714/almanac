import fs from 'fs'
import path from 'path'
import { NOTES_DIR } from '@/lib/notes'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const fileParam = searchParams.get('file')

  if (!fileParam) {
    return new Response('File not specified', { status: 400 })
  }

  // Prevent path traversal
  const filePath = path.join(NOTES_DIR, ...fileParam.split('/').map(decodeURIComponent))
  if (!filePath.startsWith(NOTES_DIR)) {
    return new Response('Forbidden', { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    return new Response('File not found', { status: 404 })
  }

  const file = fs.readFileSync(filePath)
  return new Response(file, {
    headers: { 'Content-Type': 'application/pdf' },
  })
}