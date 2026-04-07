import { FAQ_DATA, MENU_DATA } from '@/app/_constants';
import {
  ENGAGEMENT_BAND_DATA,
  HERO_DATA,
  PLAN_TABLE_DATA,
  SALESFORCE_DATA,
} from '@/app/pricing/_constants';
import { Eyebrow, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { EngagementBand } from '@/sections/EngagementBand/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Plans } from '@/sections/Plans/components';
import { PlanTable } from '@/sections/PlanTable/components';
import { Salesforce } from '@/sections/Salesforce/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Twenty',
  description:
    'Plans that scale with your team. Compare tiers and see how Twenty stacks up for your open source CRM.',
};

export default async function PricingPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.secondary.background[5]}
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
        <Hero.Body page={Pages.Pricing} body={HERO_DATA.body} />
      </Hero.Root>

      <Plans.Root backgroundColor={theme.colors.secondary.background[5]}>
        <Plans.Content />
      </Plans.Root>

      <EngagementBand.Root
        backgroundColor={theme.colors.secondary.background[5]}
      >
        <EngagementBand.Strip
          fillColor={theme.colors.primary.background[100]}
          variant="primary"
        >
          <EngagementBand.Copy>
            <EngagementBand.Heading segments={ENGAGEMENT_BAND_DATA.heading} />
            <EngagementBand.Body body={ENGAGEMENT_BAND_DATA.body} />
          </EngagementBand.Copy>
          <EngagementBand.Actions>
            <LinkButton
              color="secondary"
              href="https://app.twenty.com/welcome"
              label="Read our case studies"
              type="anchor"
              variant="contained"
            />
          </EngagementBand.Actions>
        </EngagementBand.Strip>
      </EngagementBand.Root>

      <PlanTable.Root backgroundColor={theme.colors.secondary.background[100]}>
        <PlanTable.Content data={PLAN_TABLE_DATA} />
      </PlanTable.Root>

      <Salesforce.Flow
        backgroundColor={theme.colors.secondary.background[5]}
        body={SALESFORCE_DATA.body}
        heading={SALESFORCE_DATA.heading}
        pricing={SALESFORCE_DATA.pricing}
      />

      <Faq.Root illustration={FAQ_DATA.illustration}>
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
            <LinkButton
              color="primary"
              href="https://twenty.com/contact"
              label="Talk to us"
              type="anchor"
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </>
  );
}
