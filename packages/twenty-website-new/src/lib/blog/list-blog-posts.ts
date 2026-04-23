import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';

import {
  blogFrontmatterSchema,
  type BlogPost,
} from './blog-frontmatter-schema';

/**
 * Locates the blog content directory regardless of how the build is rooted.
 *
 * Mirrors the resolution strategy used by the local release-notes loader so
 * monorepo and single-package Docker builds both work without configuration.
 */
function resolveBlogDirectory(): string | null {
  const candidates = [
    path.join(process.cwd(), 'src', 'content', 'blog'),
    path.join(
      process.cwd(),
      'packages',
      'twenty-website-new',
      'src',
      'content',
      'blog',
    ),
  ];

  for (const directoryPath of candidates) {
    if (fs.existsSync(directoryPath)) {
      return directoryPath;
    }
  }

  return null;
}

/**
 * Reads all blog posts, parses + validates frontmatter with Zod, drops
 * drafts in production, and returns posts sorted newest-first.
 *
 * Returns an empty list when the content directory is missing or empty —
 * the rest of the site (sitemap, route stubs) is built to handle this.
 */
export function listBlogPosts(): BlogPost[] {
  const directoryPath = resolveBlogDirectory();
  if (!directoryPath) {
    return [];
  }

  const fileNames = fs.readdirSync(directoryPath);
  const posts: BlogPost[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md') && !fileName.endsWith('.mdx')) {
      continue;
    }

    // README.md (or any underscore-prefixed file) is documentation, not a post.
    if (fileName.toLowerCase() === 'readme.md' || fileName.startsWith('_')) {
      continue;
    }

    const fullPath = path.join(directoryPath, fileName);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(raw);

    const parsed = blogFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid blog frontmatter in ${fileName}:\n${parsed.error.issues
          .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
          .join('\n')}`,
      );
    }

    if (parsed.data.draft && process.env.NODE_ENV === 'production') {
      continue;
    }

    posts.push({
      ...parsed.data,
      slug: fileName.replace(/\.mdx?$/i, ''),
      content,
    });
  }

  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return posts;
}

export function findBlogPostBySlug(slug: string): BlogPost | null {
  return listBlogPosts().find((post) => post.slug === slug) ?? null;
}
