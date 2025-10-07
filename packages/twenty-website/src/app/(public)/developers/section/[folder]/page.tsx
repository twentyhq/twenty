import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import DocsMain from '@/app/_components/docs/DocsMain';
import { getDocsArticles } from '@/content/user-guide/constants/getDocsArticles';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export async function generateMetadata(props: PageProps<'/developers/section/[folder]'>): Promise<Metadata> {
  const { folder } = await props.params;
  const formattedSlug = formatSlug(folder);
  const basePath = '/src/content/developers';
  const mainPost = await fetchArticleFromSlug(folder, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function DocsSlug(props: PageProps<'/developers/section/[folder]'>) {
  const { folder } = await props.params;
  const filePath = `src/content/developers/${folder}/`;
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
