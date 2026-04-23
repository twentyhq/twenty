import type { MetadataRoute } from 'next';

import { listBlogPosts } from './list-blog-posts';

/**
 * Returns sitemap entries for every published blog post. The blog directory
 * may be empty during the rollout — the sitemap still validates because we
 * just append zero entries.
 */
export function listBlogPostSitemapEntries(
  siteUrl: string,
): MetadataRoute.Sitemap {
  return listBlogPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));
}
