import { FAQ_DATA, MENU_DATA, TRUSTED_BY_DATA } from '@/app/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/app/customers/_constants';
import {
  THREE_CARDS_ILLUSTRATION_DATA,
  HERO_DATA,
  SIGNOFF_DATA,
  TESTIMONIALS_DATA,
} from '@/app/partners/_constants';
import {
  PartnerApplicationModalRoot,
  PartnerHeroCtas,
  PartnerSignoffCtas,
} from '@/app/partners/components/PartnerApplication';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Signoff } from '@/sections/Signoff/components';
import { Testimonials } from '@/sections/Testimonials/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import type { ThreeCardsScrollLayoutOptions } from '@/sections/ThreeCards/utils/three-cards-scroll-layout';
import { theme } from '@/theme';
import type { Metadata } from 'next';

const PARTNER_ILLUSTRATION_CARDS_SCROLL_LAYOUT_OPTIONS: ThreeCardsScrollLayoutOptions =
  {
    endEdgeRatio: 0.28,
    initialScale: 0.935,
    initialTranslateY: 132,
    opacityRamp: 0.28,
    stagger: 0.16,
  };

export const metadata: Metadata = {
  title: 'Partners | Twenty',
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
        <Hero.Heading page={Pages.Partners} segments={HERO_DATA.heading} />
        <Hero.Body page={Pages.Partners} body={HERO_DATA.body} />
        <Hero.Cta>
          <PartnerHeroCtas />
        </Hero.Cta>
        <Hero.PartnerVisual />
      </Hero.Root>

      <TrustedBy.Root
        backgroundColor={theme.colors.primary.background[100]}
      >
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
        <TrustedBy.ClientCount label={TRUSTED_BY_DATA.clientCountLabel.text} />
      </TrustedBy.Root>

      <CaseStudyCatalog.Promo entries={CASE_STUDY_CATALOG_ENTRIES} />

      <ThreeCards.Root backgroundColor={theme.colors.secondary.background[5]}>
        <ThreeCards.Intro page={Pages.Partners} align="left">
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
          layoutOptions={PARTNER_ILLUSTRATION_CARDS_SCROLL_LAYOUT_OPTIONS}
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
        page={Pages.Partners}
      >
        <Signoff.Heading page={Pages.Partners} segments={SIGNOFF_DATA.heading} />
        <Signoff.Body body={SIGNOFF_DATA.body} page={Pages.Partners} />
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
