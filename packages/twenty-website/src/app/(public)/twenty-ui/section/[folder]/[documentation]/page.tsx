import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocsContent from '@/app/_components/docs/DocsContent';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: PageProps<'/twenty-ui/section/[folder]/[documentation]'>,
): Promise<Metadata> {
  const { folder, documentation } = await props.params;
  const basePath = `/src/content/twenty-ui/${folder}`;
  const formattedSlug = formatSlug(documentation);
  const mainPost = await fetchArticleFromSlug(documentation, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function TwentyUISlug(
  props: PageProps<'/twenty-ui/section/[folder]/[documentation]'>,
) {
  const { folder, documentation } = await props.params;
  const basePath = `/src/content/twenty-ui/${folder}`;
  const mainPost = await fetchArticleFromSlug(documentation, basePath);
  if (!mainPost) {
    notFound();
  }
  return mainPost && <DocsContent item={mainPost} />;
}
