import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { ComparePage } from '@/sections/compare/ComparePage';
import { COMPARISONS } from '@/sections/compare/compare-data';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('comparePricingHubspot');

export default async function CompareHubspotPricingPage({
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
        <ComparePage comparison={COMPARISONS.hubspot} />
      </main>
    </>
  );
}
