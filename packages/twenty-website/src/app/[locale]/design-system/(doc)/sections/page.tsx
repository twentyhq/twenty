import { type Metadata } from 'next';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { SectionsIndexPage } from '@/platform/design-system/SectionsIndexPage';

export const metadata: Metadata = {
  title: 'Sections · Design system',
  robots: { index: false, follow: false },
};

export default async function DesignSystemSectionsRoute({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  await getRouteI18n(params);
  return <SectionsIndexPage />;
}
