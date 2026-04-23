import { z } from 'zod';

/**
 * Required shape of every blog post's frontmatter. Validated with Zod so a
 * malformed or partially-edited post fails fast at build time instead of
 * shipping a half-rendered page.
 *
 * Keep fields strict: optional fields here become opt-in escape hatches
 * later, and that's fine, but a missing required field should be a build
 * error, not a `?? ''` runtime workaround.
 */
export const blogFrontmatterSchema = z.object({
  title: z.string().min(1, 'Blog post `title` is required'),
  description: z
    .string()
    .min(1, 'Blog post `description` is required for OG/Twitter cards'),
  publishedAt: z.iso.date('Blog post `publishedAt` must be an ISO date'),
  updatedAt: z.iso.date().optional(),
  author: z.string().min(1, 'Blog post `author` is required'),
  ogImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

export type BlogPost = BlogFrontmatter & {
  /** Slug derived from the source filename (without extension). */
  slug: string;
  /** Raw MDX/Markdown body (post-frontmatter). */
  content: string;
};
