import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocsContent from '@/app/_components/docs/DocsContent';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ folder: string; documentation: string }> }): Promise<Metadata> {
  const { folder, documentation } = await props.params;
  const basePath = `/src/content/developers/${folder}`;
  const formattedSlug = formatSlug(documentation);
  const mainPost = await fetchArticleFromSlug(documentation, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function DocsSlug(props: { params: Promise<{ folder: string; documentation: string }> }) {
  const { folder, documentation } = await props.params;
  const basePath = `/src/content/developers/${folder}`;
  const mainPost = await fetchArticleFromSlug(documentation, basePath);
  if (!mainPost) {
    notFound();
  }
  return <DocsContent item={mainPost} />;
}
