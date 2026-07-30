import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { ComparePage } from '@/sections/compare/ComparePage';
import { DYNAMICS_COMPARISON } from '@/sections/compare/compare-data';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('comparePricingDynamics');

export default async function CompareMicrosoftDynamicsPricingPage({
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
        <ComparePage comparison={DYNAMICS_COMPARISON} />
      </main>
    </>
  );
}
