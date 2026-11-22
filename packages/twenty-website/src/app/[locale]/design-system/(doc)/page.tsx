import { type Metadata } from 'next';

import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { DesignSystemPage } from '@/platform/design-system/DesignSystemPage';

// Internal dev tool, like /halftone: the website's design system rendered
// from src/tokens and src/ui themselves, so it cannot drift from the code.
export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
};

export default async function DesignSystemRoute({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  await getRouteI18n(params);

  return <DesignSystemPage />;
}
