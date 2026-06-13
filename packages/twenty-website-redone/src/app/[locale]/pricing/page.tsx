import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PricingPlans, PricingStateProvider } from '@/sections/pricing-plans';

export const generateMetadata = buildRouteMetadata('pricing');

// Sections land in old-site order as their ports arrive:
// EngagementBand, PlanTable, Salesforce. The provider will widen to
// wrap them (the plan table pivots on the same hosting state). The FAQ JSON-LD rides the Faq
// section itself.
export default async function PricingPage({
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
        <PricingStateProvider>
          <PricingPlans />
        </PricingStateProvider>
        <Faq />
      </main>
    </>
  );
}
