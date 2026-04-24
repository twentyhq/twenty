import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { findBlogPostBySlug, listBlogPosts } from '@/lib/blog';
import { buildPageMetadata } from '@/lib/seo';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = findBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Not found | Twenty',
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    ogImage: post.ogImage,
    type: 'article',
    extend: {
      robots: { index: false, follow: false },
    },
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = findBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  notFound();
}
