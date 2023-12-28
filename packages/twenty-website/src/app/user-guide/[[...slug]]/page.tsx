import { getPost } from '@/app/user-guide/get-posts';

export default async function UserGuideHome({ params }: { params: { slug: string[] } }) {

    const mainPost = await getPost(params.slug && params.slug.length ? params.slug : ['home']);

    return <div>
      <h2>{mainPost?.itemInfo.title}</h2>
      <div>{mainPost?.content}</div>
  </div>;
}