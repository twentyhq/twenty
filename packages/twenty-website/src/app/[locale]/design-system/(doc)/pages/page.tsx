import { type Metadata } from 'next';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { PagesIndexPage } from '@/platform/design-system/PagesIndexPage';

export const metadata: Metadata = {
  title: 'Pages · Design system',
  robots: { index: false, follow: false },
};

export default async function DesignSystemPagesRoute({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  await getRouteI18n(params);
  return <PagesIndexPage />;
}
