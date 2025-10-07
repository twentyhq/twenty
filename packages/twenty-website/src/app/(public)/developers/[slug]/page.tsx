import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocsContent from '@/app/_components/docs/DocsContent';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export async function generateMetadata(props: PageProps<'/developers/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const formattedSlug = formatSlug(slug);
  const basePath = '/src/content/developers';
  const mainPost = await fetchArticleFromSlug(slug, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function DocsSlug(props: PageProps<'/developers/[slug]'>) {
  const { slug } = await props.params;
  const basePath = '/src/content/developers';
  const mainPost = await fetchArticleFromSlug(slug, basePath);
  if (!mainPost) {
    notFound();
  }
  return <DocsContent item={mainPost} />;
}
