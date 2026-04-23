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
    // Until the blog is launched the page surface returns 404. We still
    // advertise the route to crawlers via the sitemap so the canonical is
    // pre-warmed; once posts land the `notFound()` below is removed.
    robots: { index: false, follow: false },
  },
});

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  if (posts.length === 0) {
    notFound();
  }

  // The visible blog index ships in a follow-up phase along with prose
  // primitives. Until then a populated content directory still 404s here
  // by design — surfacing posts requires the full design pass to land.
  notFound();
}
