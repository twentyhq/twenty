import { FAQ_DATA } from '@/sections/Faq/data';
import { MENU_DATA } from '@/sections/Menu/data';
import { TalkToUsButton } from '@/lib/contact-cal';
import { BecomePartnerButton } from '@/app/[locale]/partners/components/PartnerApplication';
import { ENGAGEMENT_BAND_DATA } from '@/app/[locale]/pricing/engagement-band.data';
import { HERO_DATA } from '@/app/[locale]/pricing/hero.data';
import { PLAN_TABLE_DATA } from '@/app/[locale]/pricing/plan-table.data';
import { SALESFORCE_DATA } from '@/app/[locale]/pricing/salesforce.data';
import { Eyebrow, LinkButton } from '@/design-system/components';
import { Pages } from '@/lib/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { EngagementBand } from '@/sections/EngagementBand/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Plans } from '@/sections/Plans/components';
import { PricingStateProvider } from '@/sections/Plans/context/PricingStateContext';
import { PlanTable } from '@/sections/PlanTable/components';
import { Salesforce } from '@/sections/Salesforce/components';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { styled } from '@linaria/react';

const PricingPlansContainer = styled.div`
  display: grid;
  margin: 0 auto;
  row-gap: ${theme.spacing(8)};
  width: 100%;
`;

const PricingBannerContainer = styled.div`
  margin: 0 auto;
  width: 100%;
`;

export const generateMetadata = buildRouteMetadata('pricing');

export default async function PricingPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu.Root
        backgroundColor="#F3F3F3"
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <Hero.Root backgroundColor={theme.colors.secondary.background[5]}>
        <Hero.Heading page={Pages.Pricing} segments={HERO_DATA.heading} />
        <Hero.Body
          body={HERO_DATA.body}
          page={Pages.Pricing}
          preserveLineBreaks
        />
      </Hero.Root>

      <PricingStateProvider>
        <Plans.Root backgroundColor={theme.colors.secondary.background[5]}>
          <PricingPlansContainer>
            <Plans.Content />
          </PricingPlansContainer>
        </Plans.Root>

        <EngagementBand.Root
          backgroundColor={theme.colors.secondary.background[5]}
        >
          <PricingBannerContainer>
            <EngagementBand.Strip
              desktopCopyMaxWidth="60%"
              fillColor={theme.colors.primary.background[100]}
              variant="primary"
            >
              <EngagementBand.Copy>
                <EngagementBand.Heading
                  segments={ENGAGEMENT_BAND_DATA.heading}
                />
                <EngagementBand.Body body={ENGAGEMENT_BAND_DATA.body} />
              </EngagementBand.Copy>
              <EngagementBand.Actions>
                <BecomePartnerButton
                  color="secondary"
                  label="Find a partner"
                  variant="outlined"
                />
              </EngagementBand.Actions>
            </EngagementBand.Strip>
          </PricingBannerContainer>
        </EngagementBand.Root>

        <PlanTable.Root
          backgroundColor={theme.colors.secondary.background[100]}
        >
          <PlanTable.Content data={PLAN_TABLE_DATA} />
        </PlanTable.Root>
      </PricingStateProvider>

      <Salesforce.Flow
        backgroundColor={theme.colors.secondary.background[5]}
        body={SALESFORCE_DATA.body}
        heading={SALESFORCE_DATA.heading}
        pricing={SALESFORCE_DATA.pricing}
      />

      <Faq.Root>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary" heading={FAQ_DATA.eyebrow.heading} />
          <Faq.Heading segments={FAQ_DATA.heading} />
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label="Get started"
              type="anchor"
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label="Talk to us"
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </>
  );
}
