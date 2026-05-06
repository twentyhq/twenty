import { msg } from '@lingui/core/macro';
import { FAQ_DATA } from '@/sections/Faq/data';
import { MENU_DATA } from '@/sections/Menu/data';
import { TRUSTED_BY_DATA } from '@/sections/TrustedBy/data';
import { TalkToUsButton } from '@/lib/contact-cal';
import { CASE_STUDY_CATALOG_ENTRIES } from '@/lib/customers';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/[locale]/partners/three-cards-illustration.data';
import { HERO_COPY } from '@/app/[locale]/partners/hero.data';
import { SIGNOFF_COPY } from '@/app/[locale]/partners/signoff.data';
import { TESTIMONIALS_DATA } from '@/app/[locale]/partners/testimonials.data';
import {
  PartnerHeroCtas,
  PartnerSignoffCtas,
} from '@/app/[locale]/partners/components/PartnerApplication';
import {
  Body,
  Eyebrow,
  Heading,
  HeadingPart,
  LinkButton,
} from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { createMessageDescriptorRenderer } from '@/lib/i18n/create-message-descriptor-renderer';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/lib/i18n/get-route-i18n';
import { Pages } from '@/lib/pages';
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
  const renderText = createMessageDescriptorRenderer(i18n);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
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
        <Hero.Heading page={Pages.Partners}>
          <HeadingPart fontFamily="serif">
            {renderText(msg`Become`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {renderText(msg`our partner`)}
          </HeadingPart>
        </Hero.Heading>
        <Hero.Body
          page={Pages.Partners}
          body={{ text: HERO_COPY.body }}
          renderText={renderText}
        />
        <Hero.Cta>
          <PartnerHeroCtas />
        </Hero.Cta>
        <Hero.PartnerVisual />
      </Hero.Root>

      <TrustedBy.Root
        backgroundColor={theme.colors.primary.background[100]}
        compactBottom
      >
        <TrustedBy.Separator
          renderText={renderText}
          separator={TRUSTED_BY_DATA.separator}
        />
        <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
        <TrustedBy.ClientCount
          label={TRUSTED_BY_DATA.clientCountLabel.text}
          renderText={renderText}
        />
      </TrustedBy.Root>

      <PromoSpacing>
        <CaseStudyCatalog.Promo
          compactTop
          entries={CASE_STUDY_CATALOG_ENTRIES}
          renderText={renderText}
        />
      </PromoSpacing>

      <ThreeCards.Root backgroundColor={theme.colors.secondary.background[5]}>
        <ThreeCards.Intro page={Pages.Partners} align="left">
          <Eyebrow
            colorScheme="primary"
            heading={THREE_CARDS_ILLUSTRATION_DATA.eyebrow.heading}
            renderText={renderText}
          />
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {renderText(msg`Find the program that fits your business`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`and unlock new opportunities with Twenty`)}
            </HeadingPart>
          </Heading>
          {THREE_CARDS_ILLUSTRATION_DATA.body && (
            <Body
              body={THREE_CARDS_ILLUSTRATION_DATA.body}
              renderText={renderText}
              size="sm"
            />
          )}
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
        <Signoff.Heading page={Pages.Partners}>
          <HeadingPart fontFamily="serif">
            {renderText(msg`Ready to grow`)}
          </HeadingPart>
          <br />
          <HeadingPart fontFamily="sans">
            {renderText(msg`with Twenty?`)}
          </HeadingPart>
        </Signoff.Heading>
        <Signoff.Body
          body={{ text: SIGNOFF_COPY.body }}
          page={Pages.Partners}
          renderText={renderText}
        />
        <Signoff.Cta>
          <PartnerSignoffCtas />
        </Signoff.Cta>
      </Signoff.Root>

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
