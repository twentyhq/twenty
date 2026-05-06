import { msg } from '@lingui/core/macro';
import { FAQ_DATA } from '@/sections/Faq/data';
import { MENU_DATA } from '@/sections/Menu/data';
import { TalkToUsButton } from '@/lib/contact-cal';
import { BecomePartnerButton } from '@/app/[locale]/partners/components/PartnerApplication';
import { ENGAGEMENT_BAND_COPY } from '@/app/[locale]/pricing/engagement-band.data';
import { HERO_COPY } from '@/app/[locale]/pricing/hero.data';
import { PLAN_TABLE_DATA } from '@/app/[locale]/pricing/plan-table.data';
import { SALESFORCE_DATA } from '@/app/[locale]/pricing/salesforce.data';
import { Eyebrow, HeadingPart, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { Pages } from '@/lib/pages';
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
  const renderText = createMessageDescriptorRenderer(i18n);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(FAQ_DATA.questions, renderText)} />
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
        <Hero.Heading page={Pages.Pricing}>
          <HeadingPart fontFamily="serif">
            {renderText(msg`Simple`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {renderText(msg`Pricing`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body
          body={{ text: HERO_COPY.body }}
          page={Pages.Pricing}
          preserveLineBreaks
          renderText={renderText}
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
                  renderText={renderText}
                  segments={{
                    fontFamily: 'serif',
                    text: ENGAGEMENT_BAND_COPY.heading,
                  }}
                />
                <EngagementBand.Body
                  body={{ text: ENGAGEMENT_BAND_COPY.body }}
                  renderText={renderText}
                />
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

        <PlanTable.Root
          backgroundColor={theme.colors.secondary.background[100]}
        >
          <PlanTable.Content data={PLAN_TABLE_DATA} />
        </PlanTable.Root>
      </PricingStateProvider>

      <Salesforce.Flow
        backgroundColor={theme.colors.secondary.background[5]}
        body={SALESFORCE_DATA.body}
        pricing={SALESFORCE_DATA.pricing}
      >
        <HeadingPart fontFamily="serif">
          {renderText(msg`Trust the n°1 CRM,`)}
        </HeadingPart>{' '}
        <HeadingPart fontFamily="sans">{renderText(msg`or not !`)}</HeadingPart>
      </Salesforce.Flow>

      <Faq.Root>
        <Faq.Intro>
          <Eyebrow
            colorScheme="secondary"
            heading={FAQ_DATA.eyebrow.heading}
            renderText={renderText}
          />
          <Faq.Heading>
            <HeadingPart fontFamily="serif">
              {renderText(msg`Stop fighting custom.`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {renderText(msg`Start building, with Twenty`)}
            </HeadingPart>
          </Faq.Heading>
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label={renderText(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="primary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </>
  );
}
