import { msg } from '@lingui/core/macro';
import { Faq } from '@/sections/Faq';
import { TrustedBy } from '@/sections/TrustedBy';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { PARTNER_ILLUSTRATION_CARDS } from '@/app/[locale]/partners/three-cards-illustration.data';
import { PARTNER_TESTIMONIALS } from '@/app/[locale]/partners/testimonials.data';
import { PartnerHeroCtas } from '@/app/[locale]/partners/components/PartnerApplication';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { Pages } from '@/lib/pages';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudyCatalog } from '@/sections/CaseStudyCatalog';
import { Hero } from '@/sections/Hero';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { PartnerSignoff } from '@/app/[locale]/partners/components/PartnerSignoff';
import { Testimonials } from '@/sections/Testimonials';
import {
  ThreeCards,
  type ThreeCardsScrollLayoutOptions,
} from '@/sections/ThreeCards';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';
import { styled } from '@linaria/react';

const PARTNER_ILLUSTRATION_CARDS_SCROLL_LAYOUT_OPTIONS: ThreeCardsScrollLayoutOptions =
  {
    endEdgeRatio: 0.28,
    initialScale: 0.935,
    initialTranslateY: 132,
    opacityRamp: 0.28,
    stagger: 0.16,
  };

const PromoSpacing = styled.div`
  margin-bottom: ${theme.spacing(8)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-bottom: ${theme.spacing(12)};
  }
`;

export const generateMetadata = buildRouteMetadata('partners');

type PartnerPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function PartnerPage({ params }: PartnerPageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu
        backgroundColor={theme.colors.primary.background[100]}
        socialLinks={menuSocialLinks}
      />

      <Hero.Root scheme="light">
        <Hero.Heading page={Pages.Partners}>
          <HeadingPart fontFamily="serif">{i18n._(msg`Become`)}</HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {i18n._(msg`our partner`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body page={Pages.Partners}>
          {i18n._(
            msg`We're building the #1 Open Source CRM, but we can't do it alone. Join our partner ecosystem and grow with us.`,
          )}
        </Hero.Body>
        <Hero.Cta>
          <PartnerHeroCtas />
        </Hero.Cta>
        <Hero.PartnerVisual />
      </Hero.Root>

      <TrustedBy
        backgroundColor={theme.colors.primary.background[100]}
        compactBottom
      />

      <PromoSpacing>
        <CaseStudyCatalog.Promo
          compactTop
          entries={CASE_STUDY_CATALOG_ENTRIES}
        />
      </PromoSpacing>

      <ThreeCards.Root scheme="muted">
        <ThreeCards.Intro page={Pages.Partners} align="left">
          <Eyebrow>
            <HeadingPart fontFamily="sans">
              {i18n._(msg`Which partner program is right for you?`)}
            </HeadingPart>
          </Eyebrow>
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`Find the program that fits your business`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`and unlock new opportunities with Twenty`)}
            </HeadingPart>
          </Heading>
        </ThreeCards.Intro>
        <ThreeCards.IllustrationCards
          illustrationCards={PARTNER_ILLUSTRATION_CARDS}
          layoutOptions={PARTNER_ILLUSTRATION_CARDS_SCROLL_LAYOUT_OPTIONS}
          variant="simple"
        />
      </ThreeCards.Root>

      <Testimonials.Root
        scheme="muted"
        shapeFillColor={theme.colors.secondary.background[100]}
      >
        <Testimonials.PartnerCarousel
          eyebrow={i18n._(msg`Join our growing partner ecosystem`)}
          testimonials={PARTNER_TESTIMONIALS}
        >
          <Testimonials.PartnerVisual />
        </Testimonials.PartnerCarousel>
      </Testimonials.Root>

      <PartnerSignoff />

      <Faq />
    </>
  );
}
