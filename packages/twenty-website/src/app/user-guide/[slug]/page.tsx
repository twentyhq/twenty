import UserGuideContent from '@/app/components/user-guide/UserGuideContent';
import { getPost } from '@/app/get-posts';
import { DeviceType, useDeviceType } from '@/app/ui/utilities/useDeviceType';

export default async function UserGuideSlug({
  params,
}: {
  params: { slug: string };
}) {
  const basePath = '/src/content/user-guide';
  const deviceType = useDeviceType();
  const navElement = document.getElementsByName('nav')[0];

  if (deviceType !== DeviceType.DESKTOP) {
    navElement.style.display = 'none';
  }

  const mainPost = await getPost(
    params.slug && params.slug.length ? params.slug : 'home',
    basePath,
  );
  return mainPost && <UserGuideContent item={mainPost} />;
}
