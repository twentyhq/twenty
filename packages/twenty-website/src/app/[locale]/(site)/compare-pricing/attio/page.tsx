import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { ComparePage } from '@/sections/compare/ComparePage';
import { ATTIO_COMPARISON } from '@/sections/compare/compare-data';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('comparePricingAttio');

export default async function CompareAttioPricingPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);

  return (
    <>
      <Menu communityStats={communityStats} scheme="muted" />
      <main>
        <ComparePage comparison={ATTIO_COMPARISON} />
      </main>
    </>
  );
}
