import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocsContent from '@/app/_components/docs/DocsContent';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const formattedSlug = formatSlug(params.slug);
  const basePath = '/src/content/user-guide';
  const mainPost = await fetchArticleFromSlug(params.slug, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function UserGuideSlug({
  params,
}: {
  params: { slug: string };
}) {
  const basePath = '/src/content/user-guide';
  const mainPost = await fetchArticleFromSlug(params.slug, basePath);
  if (!mainPost) {
    notFound();
  }
  return <DocsContent item={mainPost} />;
}
