import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocsContent from '@/app/_components/docs/DocsContent';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: PageProps<'/twenty-ui/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const formattedSlug = formatSlug(slug);
  const basePath = '/src/content/twenty-ui';
  const mainPost = await fetchArticleFromSlug(slug, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function TwentyUISlug(props: PageProps<'/twenty-ui/[slug]'>) {
  const { slug } = await props.params;
  const basePath = '/src/content/twenty-ui';
  const mainPost = await fetchArticleFromSlug(slug, basePath);
  if (!mainPost) {
    notFound();
  }
  return mainPost && <DocsContent item={mainPost} />;
}
