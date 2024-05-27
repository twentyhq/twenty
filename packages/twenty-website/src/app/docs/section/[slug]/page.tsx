import { Metadata } from 'next';

import DocsMain from '@/app/_components/docs/DocsMain';
import { getUserGuideArticles } from '@/content/user-guide/constants/getUserGuideArticles';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const formattedSlug = formatSlug(params.slug);
  const basePath = '/src/content/docs';
  const mainPost = await fetchArticleFromSlug(params.slug, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function DocsSlug({
  params,
}: {
  params: { slug: string };
}) {
  const filePath = `src/content/docs/${params.slug}/`;
  const userGuideArticleCards = getUserGuideArticles(filePath);
  const isSection = true;

  return (
    <DocsMain
      userGuideArticleCards={userGuideArticleCards}
      isSection={isSection}
    />
  );
}
