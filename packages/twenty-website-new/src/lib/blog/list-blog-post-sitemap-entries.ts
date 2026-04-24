import type { MetadataRoute } from 'next';

import { listBlogPosts } from './list-blog-posts';

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
