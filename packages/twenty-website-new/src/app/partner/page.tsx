import { FAQ_DATA, MENU_DATA, TRUSTED_BY_DATA } from '@/app/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import {
  ENGAGEMENT_BAND_DATA,
  HERO_DATA,
  SIGNOFF_DATA,
  TESTIMONIALS_DATA,
  THREE_CARDS_ILLUSTRATION_DATA,
} from '@/app/partner/_constants';
import {
  PartnerApplicationModalRoot,
  PartnerHeroCtas,
  PartnerSignoffCtas,
} from '@/app/partner/components/PartnerApplication';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { EngagementBand } from '@/sections/EngagementBand/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Signoff } from '@/sections/Signoff/components';
import { Testimonials } from '@/sections/Testimonials/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partners — Twenty',
  description:
    'Join our partner ecosystem and grow with us as we build the #1 open-source CRM.',
};

export default async function PartnerPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <PartnerApplicationModalRoot>
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
        <Hero.Heading page={Pages.Partner} segments={HERO_DATA.heading} />
        <Hero.Body page={Pages.Partner} body={HERO_DATA.body} />
        <Hero.Cta>
          <PartnerHeroCtas />
        </Hero.Cta>
        <Hero.PartnerVisual />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos
          clientCountLabel={TRUSTED_BY_DATA.clientCountLabel}
          logos={TRUSTED_BY_DATA.logos}
        />
      </TrustedBy.Root>

      <EngagementBand.Root
        backgroundColor={theme.colors.primary.background[100]}
      >
        <EngagementBand.Strip
          fillColor={theme.colors.secondary.background[100]}
          variant="secondary"
        >
          <EngagementBand.Copy>
            <EngagementBand.Heading segments={ENGAGEMENT_BAND_DATA.heading} />
            <EngagementBand.Body body={ENGAGEMENT_BAND_DATA.body} />
          </EngagementBand.Copy>
          <EngagementBand.Actions>
            <LinkButton
              color="primary"
              href="/case-studies"
              label="Read our case studies"
              type="link"
              variant="contained"
            />
          </EngagementBand.Actions>
        </EngagementBand.Strip>
      </EngagementBand.Root>

      <ThreeCards.Root backgroundColor={theme.colors.secondary.background[5]}>
        <ThreeCards.Intro page={Pages.Partner} align="left">
          <Eyebrow
            colorScheme="primary"
            heading={THREE_CARDS_ILLUSTRATION_DATA.eyebrow.heading}
          />
          <Heading
            segments={THREE_CARDS_ILLUSTRATION_DATA.heading}
            size="lg"
            weight="light"
          />
          <Body body={THREE_CARDS_ILLUSTRATION_DATA.body} size="sm" />
        </ThreeCards.Intro>
        <ThreeCards.IllustrationCards
          illustrationCards={THREE_CARDS_ILLUSTRATION_DATA.illustrationCards}
          variant="simple"
        />
      </ThreeCards.Root>

      <Testimonials.Root
        backgroundColor={theme.colors.secondary.background[5]}
        color={theme.colors.secondary.text[100]}
        shapeFillColor={theme.colors.secondary.background[100]}
      >
        <Testimonials.PartnerCarousel
          eyebrow={TESTIMONIALS_DATA.eyebrow}
          testimonials={TESTIMONIALS_DATA.testimonials}
        >
          <Testimonials.PartnerVisual />
        </Testimonials.PartnerCarousel>
      </Testimonials.Root>

      <Signoff.Root
        backgroundColor={theme.colors.primary.background[100]}
        color={theme.colors.primary.text[100]}
        page={Pages.Partner}
      >
        <Signoff.Heading page={Pages.Partner} segments={SIGNOFF_DATA.heading} />
        <Signoff.Body body={SIGNOFF_DATA.body} page={Pages.Partner} />
        <Signoff.Cta>
          <PartnerSignoffCtas />
        </Signoff.Cta>
      </Signoff.Root>

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
            <TalkToUsButton
              color="primary"
              label="Talk to us"
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>
    </PartnerApplicationModalRoot>
  );
}
