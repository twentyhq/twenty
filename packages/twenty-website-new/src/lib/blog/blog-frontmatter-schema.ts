import { z } from 'zod';

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
  slug: string;
  content: string;
};
