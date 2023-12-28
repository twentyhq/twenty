import { getPost } from '@/app/get-posts';

export default async function UserGuideHome({
  params,
}: {
  params: { slug: string[] };
}) {
  const basePath = '/src/content/user-guide';

  const mainPost = await getPost(
    params.slug && params.slug.length ? params.slug : ['home'],
    basePath,
  );

  return (
    <div>
      <h2>{mainPost?.itemInfo.title}</h2>
      <div>{mainPost?.content}</div>
    </div>
  );
}
