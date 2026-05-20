import { msg } from '@lingui/core/macro';
import { Faq, FAQ_QUESTIONS } from '@/sections/Faq';
import { TalkToUsButton } from '@/sections/ContactCal';
import { BecomePartnerButton } from '@/app/[locale]/partners/components/PartnerApplication';
import { PLAN_TABLE_DATA } from '@/app/[locale]/pricing/plan-table.data';
import { SALESFORCE_DATA } from '@/app/[locale]/pricing/salesforce.data';
import { Eyebrow, HeadingPart, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/utils/get-route-i18n';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { EngagementBand } from '@/sections/EngagementBand';
import { Hero } from '@/sections/Hero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { Plans, PricingStateProvider } from '@/sections/Plans';
import { PlanTable } from '@/sections/PlanTable';
import { Salesforce } from '@/sections/Salesforce';
import { theme } from '@/theme';
import { buildFaqPageJsonLd, buildRouteMetadata, JsonLd } from '@/lib/seo';
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

      <Hero.Root scheme="muted">
        <Hero.Heading page={Pages.Pricing}>
          <HeadingPart fontFamily="serif">{i18n._(msg`Simple`)}</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">{i18n._(msg`Pricing`)}</HeadingPart>
        </Hero.Heading>
        <Hero.Body page={Pages.Pricing} preserveLineBreaks>
          {i18n._(msg`Start your free trial today\nwithout credit card.`)}
        </Hero.Body>
      </Hero.Root>

      <PricingStateProvider>
        <Plans.Root scheme="muted">
          <PricingPlansContainer>
            <Plans.Content />
          </PricingPlansContainer>
        </Plans.Root>

        <EngagementBand.Root scheme="muted">
          <PricingBannerContainer>
            <EngagementBand.Strip
              desktopCopyMaxWidth="60%"
              fillColor={theme.colors.primary.background[100]}
              variant="primary"
            >
              <EngagementBand.Copy>
                <EngagementBand.Heading>
                  <HeadingPart fontFamily="serif">
                    {i18n._(msg`Need help with customization?`)}
                  </HeadingPart>
                </EngagementBand.Heading>
                <EngagementBand.Body>
                  {i18n._(
                    msg`Find the right partner to implement, customize, and tailor Twenty to your team.`,
                  )}
                </EngagementBand.Body>
              </EngagementBand.Copy>
              <EngagementBand.Actions>
                <BecomePartnerButton
                  color="secondary"
                  label={msg`Find a partner`}
                  variant="outlined"
                />
              </EngagementBand.Actions>
            </EngagementBand.Strip>
          </PricingBannerContainer>
        </EngagementBand.Root>

        <PlanTable.Root scheme="dark">
          <PlanTable.Content data={PLAN_TABLE_DATA} />
        </PlanTable.Root>
      </PricingStateProvider>

      <Salesforce.Flow
        scheme="muted"
        body={SALESFORCE_DATA.body}
        pricing={SALESFORCE_DATA.pricing}
      >
        <HeadingPart fontFamily="serif">
          {i18n._(msg`Trust the n°1 CRM,`)}
        </HeadingPart>{' '}
        <HeadingPart fontFamily="sans">{i18n._(msg`or not !`)}</HeadingPart>
      </Salesforce.Flow>

      <Faq.Root>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary">
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Any Questions?`)}
            </HeadingPart>
          </Eyebrow>
          <Faq.Heading>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Stop fighting custom.`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Start building, with Twenty`)}
            </HeadingPart>
          </Faq.Heading>
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_QUESTIONS} />
      </Faq.Root>
    </>
  );
}
