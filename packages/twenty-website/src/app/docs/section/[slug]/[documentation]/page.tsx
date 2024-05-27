import { Metadata } from 'next';
import { headers } from 'next/headers';

import UserGuideContent from '@/app/_components/user-guide/UserGuideContent';
import { fetchArticleFromSlug } from '@/shared-utils/fetchArticleFromSlug';
import { formatSlug } from '@/shared-utils/formatSlug';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const headersList = headers();
  const fullUrl = headersList.get('referer') || '';
  const fileNameWithExtension = fullUrl.split('/').pop();
  const folderName = fileNameWithExtension?.split('.')[0];
  const basePath = `/src/content/docs/${folderName}`;
  const formattedSlug = formatSlug(params.slug);
  const mainPost = await fetchArticleFromSlug(params.slug, basePath);
  return {
    title: 'Twenty - ' + formattedSlug,
    description: mainPost?.itemInfo?.info,
  };
}

export default async function DocsSlug({
  params,
}: {
  params: { documentation: string };
}) {
  const headersList = headers();
  const fullUrl = headersList.get('referer') || '';
  const fileNameWithExtension = fullUrl.split('/').pop();
  const folderName = fileNameWithExtension?.split('.')[0];
  const basePath = `/src/content/docs/${folderName}`;
  const mainPost = await fetchArticleFromSlug(params.documentation, basePath);
  return mainPost && <UserGuideContent item={mainPost} />;
}
