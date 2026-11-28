import { type Metadata } from 'next';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { GalleryPage } from '@/platform/design-system/GalleryPage';

export const metadata: Metadata = {
  title: 'All components · Design system',
  robots: { index: false, follow: false },
};

export default async function DesignSystemGalleryRoute({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  await getRouteI18n(params);

  return <GalleryPage />;
}
