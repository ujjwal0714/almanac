# dtbom-blog

Personal notes site — Typora `.md` files hosted on Vercel via Next.js.

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000/blog
```

## Adding notes

Drop `.md` files into the `notes/` folder. Subdirectories become URL segments:

```
notes/
  control-systems/
    intro.md        → /blog/control-systems/intro
    pid-tuning.md   → /blog/control-systems/pid-tuning
  projects/
    digi-blocker.md → /blog/projects/digi-blocker
  quick-ref.md      → /blog/quick-ref
```

### Frontmatter (optional but recommended)

```markdown
---
title: My Note Title
date: 2024-03-15
description: One-line summary shown on the index
tags: [tag1, tag2]
---

Note content here...
```

If `title` is omitted, the filename is used (hyphens → spaces).

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → import the repo
3. Framework: Next.js (auto-detected)
4. Click Deploy

Every `git push` triggers a new deployment automatically.

## Adding notes after deployment

```bash
# Write note in Typora, save to notes/ folder, then:
git add notes/
git commit -m "add: my new note"
git push
# Vercel rebuilds in ~30 seconds
```
