import { Faq, FAQ_QUESTIONS } from '@/sections/Faq';
import { PLAN_TABLE_DATA } from '@/app/[locale]/pricing/plan-table.data';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { PricingEngagementBand } from '@/app/[locale]/pricing/_components/PricingEngagementBand';
import { PricingHero } from '@/app/[locale]/pricing/_components/PricingHero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { Plans, PricingStateProvider } from '@/sections/Plans';
import { PlanTable } from '@/sections/PlanTable';
import { PricingSalesforce } from '@/app/[locale]/pricing/_components/PricingSalesforce';
import { theme } from '@/theme';
import { buildFaqPageJsonLd, buildRouteMetadata, JsonLd } from '@/lib/seo';
import { styled } from '@linaria/react';

const PricingPlansContainer = styled.div`
  display: grid;
  margin: 0 auto;
  row-gap: ${theme.spacing(8)};
  width: 100%;
`;

export const generateMetadata = buildRouteMetadata('pricing');

type PricingPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function PricingPage({ params }: PricingPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(FAQ_QUESTIONS, (d) => i18n._(d))} />
      <Menu backgroundColor="#F3F3F3" socialLinks={menuSocialLinks} />

      <PricingHero />

      <PricingStateProvider>
        <Plans.Root scheme="muted">
          <PricingPlansContainer>
            <Plans.Content />
          </PricingPlansContainer>
        </Plans.Root>

        <PricingEngagementBand />

        <PlanTable.Root scheme="dark">
          <PlanTable.Content data={PLAN_TABLE_DATA} />
        </PlanTable.Root>
      </PricingStateProvider>

      <PricingSalesforce />

      <Faq />
    </>
  );
}
