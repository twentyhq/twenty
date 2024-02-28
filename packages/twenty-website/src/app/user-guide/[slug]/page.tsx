import UserGuideContent from '@/app/_components/user-guide/UserGuideContent';
import { getPost } from '@/app/_server-utils/get-posts';

export default async function UserGuideSlug({
  params,
}: {
  params: { slug: string };
}) {
  const basePath = '/src/content/user-guide';

  const mainPost = await getPost(
    params.slug && params.slug.length ? params.slug : 'home',
    basePath,
  );
  return mainPost && <UserGuideContent item={mainPost} />;
}
