import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PricingHero } from '@/sections/pricing-hero';

export const generateMetadata = buildRouteMetadata('pricing');

// Sections land in old-site order as their ports arrive: Plans,
// EngagementBand, PlanTable, Salesforce. The FAQ JSON-LD rides the Faq
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
        <PricingHero />
        <Faq />
      </main>
    </>
  );
}
