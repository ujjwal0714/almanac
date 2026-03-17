import { buildTree } from '@/lib/notes'
import BlogShell from '@/components/BlogShell'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const tree = buildTree()
  return <BlogShell tree={tree}>{children}</BlogShell>
}
