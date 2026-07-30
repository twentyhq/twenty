import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { ComparePage } from '@/sections/compare/ComparePage';
import { SALESFORCE_COMPARISON } from '@/sections/compare/compare-data';
import { Menu } from '@/sections/menu';

export const generateMetadata = buildRouteMetadata('comparePricingSalesforce');

export default async function CompareSalesforcePricingPage({
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
        <ComparePage comparison={SALESFORCE_COMPARISON} />
      </main>
    </>
  );
}
