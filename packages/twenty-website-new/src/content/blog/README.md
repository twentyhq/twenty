# Blog content

Author one `.mdx` (or `.md`) file per post in this directory. The filename
becomes the URL slug — e.g. `introducing-twenty.mdx` → `/blog/introducing-twenty`.

## Required frontmatter

```yaml
---
title: "Introducing Twenty"
description: "A one-line teaser used by OG/Twitter cards and the index page."
publishedAt: "2026-04-23"
author: "Twenty Team"
# Optional:
updatedAt: "2026-04-25"
ogImage: "/images/og/introducing-twenty.png"
tags: ["product", "launch"]
draft: false
---
```

The schema is enforced at build time by
`src/lib/blog/blog-frontmatter-schema.ts`. A missing or malformed field will
fail `next build` with a precise error pointing at the offending file —
this is intentional, do not add `?? ''` defaults to suppress it.

Posts with `draft: true` are skipped in production builds and visible in
local development only.

## Notes

- The `(blog)` route group currently 404s by design until prose primitives
  ship. Posts placed here are still picked up by the sitemap so canonicals
  are pre-warmed for crawlers.
- Do not place plain stylesheet (`.css`/`.scss`) files alongside posts.
  All visual chrome belongs in the route group's components (Linaria only).
