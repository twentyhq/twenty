import { FAQ_DATA, MENU_DATA, TRUSTED_BY_DATA } from '@/app/_constants';
import {
  DEMO_DATA,
  FEATURE_DATA,
  HERO_DATA,
  STEPPER_DATA,
  TABS_DATA,
  THREE_CARDS_ILLUSTRATION_DATA,
} from '@/app/product/_constants';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Demo } from '@/sections/Demo/components';
import { Faq } from '@/sections/Faq/components';
import { Feature } from '@/sections/Feature/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { ProductStepper } from '@/sections/ProductStepper/components';
import { Tabs } from '@/sections/Tabs/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product — Twenty',
  description:
    'Modern interface. AI assistance. All the features you need, ready from day one.',
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
        <Hero.Body page={Pages.Product} body={HERO_DATA.body} />
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
        <TrustedBy.Logos
          clientCountLabel={TRUSTED_BY_DATA.clientCountLabel}
          logos={TRUSTED_BY_DATA.logos}
        />
      </TrustedBy.Root>

      <Tabs.Root>
        <Eyebrow colorScheme="secondary" heading={TABS_DATA.eyebrow.heading} />
        <Tabs.Heading segments={TABS_DATA.heading} />
        <Tabs.Body body={TABS_DATA.body} />
        <Tabs.TabGroup tabs={TABS_DATA.tabs} />
      </Tabs.Root>

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

      <Demo.Root>
        <Eyebrow colorScheme="primary" heading={DEMO_DATA.eyebrow.heading} />
        <Demo.Heading segments={DEMO_DATA.heading} />
        <Demo.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Try twenty cloud"
            type="anchor"
            variant="contained"
          />
        </Demo.Cta>
        <Demo.Screenshot image={DEMO_DATA.image} />
      </Demo.Root>

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
