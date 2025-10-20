import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocsMain from '@/app/_components/docs/DocsMain';
import { getDocsArticles } from '@/content/user-guide/constants/getDocsArticles';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ folder: string }> },
): Promise<Metadata> {
  const { folder } = await props.params;
  const formattedSlug = formatSlug(folder);
  const basePath = '/src/content/twenty-ui';
  const mainPost = await fetchArticleFromSlug(folder, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function TwentyUISlug(
  props: { params: Promise<{ folder: string }> },
) {
  const { folder } = await props.params;
  const filePath = `src/content/twenty-ui/${folder}/`;
  const docsArticleCards = getDocsArticles(filePath);
  const isSection = true;
  const hasOnlyEmptySections = docsArticleCards.every(
    (article) => article.topic === 'Empty Section',
  );
  if (!docsArticleCards || hasOnlyEmptySections) {
    notFound();
  }
  return <DocsMain docsArticleCards={docsArticleCards} isSection={isSection} />;
}
