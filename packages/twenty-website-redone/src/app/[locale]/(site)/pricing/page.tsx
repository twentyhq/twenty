import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { PricingStateProvider } from '@/pricing-state';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PricingEngagementBand } from '@/sections/pricing-engagement-band';
import { PricingPlans } from '@/sections/pricing-plans';

export const generateMetadata = buildRouteMetadata('pricing');

// PlanTable and Salesforce land next, in old-site order; the provider widens to
// wrap PlanTable too (it pivots on the same hosting state). The FAQ JSON-LD
// rides the Faq section itself.
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
          <PricingEngagementBand />
        </PricingStateProvider>
        <Faq />
      </main>
    </>
  );
}
