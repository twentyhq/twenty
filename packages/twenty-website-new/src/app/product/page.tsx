import { FAQ_DATA, MENU_DATA, TRUSTED_BY_DATA } from '@/app/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import {
  FEATURE_DATA,
  HERO_DATA,
  SIGNOFF_DATA,
  STEPPER_DATA,
  THREE_CARDS_ILLUSTRATION_DATA,
} from '@/app/product/_constants';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Faq } from '@/sections/Faq/components';
import { Feature } from '@/sections/Feature/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { ProductStepper } from '@/sections/ProductStepper/components';
import { Signoff } from '@/sections/Signoff/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product | Twenty',
  description:
    'Track relationships, manage pipelines, and take action quickly with a CRM that feels intuitive from day one.',
};

export default async function ProductPage() {
  const stats = await fetchCommunityStats();
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
        <Hero.Heading page={Pages.Product} segments={HERO_DATA.heading} />
        <Hero.Body body={HERO_DATA.body} page={Pages.Product} />
        <Hero.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Get started"
            type="anchor"
            variant="contained"
          />
        </Hero.Cta>
        <Hero.ProductVisual />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
        <TrustedBy.ClientCount label={TRUSTED_BY_DATA.clientCountLabel.text} />
      </TrustedBy.Root>

      <Feature.Root backgroundColor={theme.colors.primary.background[100]}>
        <Feature.Intro align="center" page={Pages.Product}>
          <Eyebrow
            colorScheme="primary"
            heading={FEATURE_DATA.eyebrow.heading}
          />
          <Heading segments={FEATURE_DATA.heading} size="lg" weight="light" />
        </Feature.Intro>
        <Feature.Tiles mask={FEATURE_DATA.mask} tiles={FEATURE_DATA.tiles} />
      </Feature.Root>

      <ThreeCards.Root backgroundColor={theme.colors.primary.background[100]}>
        <ThreeCards.Intro page={Pages.Product} align="left">
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
        />
      </ThreeCards.Root>

      <ProductStepper.Flow
        body={STEPPER_DATA.body}
        eyebrow={STEPPER_DATA.eyebrow}
        heading={STEPPER_DATA.heading}
        steps={STEPPER_DATA.steps}
      />

      <Signoff.Root
        backgroundColor={theme.colors.secondary.background[5]}
        color={theme.colors.primary.text[100]}
        page={Pages.Partners}
      >
        <Signoff.Heading page={Pages.Partners} segments={SIGNOFF_DATA.heading} />
        <Signoff.Body body={SIGNOFF_DATA.body} page={Pages.Partners} />
        <Signoff.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Get started"
            type="anchor"
            variant="contained"
          />
          <TalkToUsButton
            color="secondary"
            label="Talk to us"
            variant="outlined"
          />
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
    </>
  );
}
