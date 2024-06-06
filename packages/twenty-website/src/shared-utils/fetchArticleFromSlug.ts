import { getPost } from '@/app/_server-utils/get-posts';

export async function fetchArticleFromSlug(slug: string, basePath: string) {
  const effectiveSlug = slug && slug.length > 0 ? slug : 'home';
  return await getPost(effectiveSlug, basePath);
}
