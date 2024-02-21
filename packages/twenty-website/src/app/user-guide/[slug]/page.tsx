'use client';
import { use } from 'react';

import UserGuideContent from '@/app/components/user-guide/UserGuideContent';
import { getPost } from '@/app/get-posts';
import { DeviceType, useDeviceType } from '@/app/ui/utilities/useDeviceType';

export default function UserGuideSlug({
  params,
}: {
  params: { slug: string };
}) {
  const basePath = '/src/content/user-guide';
  const deviceType = useDeviceType();
  const mainPost = use(
    getPost(
      params.slug && params.slug.length ? params.slug : 'home',
      basePath,
      deviceType === DeviceType.DESKTOP,
    ),
  );
  return mainPost && <UserGuideContent item={mainPost} />;
}
