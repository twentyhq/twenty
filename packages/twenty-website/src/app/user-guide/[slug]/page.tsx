import { Metadata } from 'next';

import UserGuideContent from '@/app/_components/user-guide/UserGuideContent';
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
  return mainPost && <UserGuideContent item={mainPost} />;
}
