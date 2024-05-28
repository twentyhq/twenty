import { Metadata } from 'next';

import UserGuideContent from '@/app/_components/user-guide/UserGuideContent';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { folder: string; documentation: string };
}): Promise<Metadata> {
  const basePath = `/src/content/user-guide/${params.folder}`;
  const formattedSlug = formatSlug(params.documentation);
  const mainPost = await fetchArticleFromSlug(params.documentation, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function UserGuideSlug({
  params,
}: {
  params: { documentation: string; folder: string };
}) {
  const basePath = `/src/content/user-guide/${params.folder}`;
  const mainPost = await fetchArticleFromSlug(params.documentation, basePath);
  return mainPost && <UserGuideContent item={mainPost} />;
}
