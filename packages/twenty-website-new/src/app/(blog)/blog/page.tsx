import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { listBlogPosts } from '@/lib/blog';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  path: '/blog',
  title: 'Blog | Twenty',
  description:
    'Product updates, behind-the-scenes engineering, and stories from the open source CRM community.',
  extend: {
    robots: { index: false, follow: false },
  },
});

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  if (posts.length === 0) {
    notFound();
  }

  notFound();
}
