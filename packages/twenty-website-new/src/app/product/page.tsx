import { TRUSTED_BY_DATA } from '@/app/(home)/constants/trusted-by';
import { HERO_DATA } from '@/app/product/constants/hero';
import { TABS_DATA } from '@/app/product/constants/tabs';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/product/constants/three-cards';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
import { Tabs } from '@/sections/Tabs/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';

export default function ProductPage() {
  return (
    <>
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
        <Hero.Illustration
          illustration={HERO_DATA.illustration}
          backgroundColor={theme.colors.secondary.background[5]}
        />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos
          clientCountLabel={TRUSTED_BY_DATA.clientCountLabel}
          logos={TRUSTED_BY_DATA.logos}
        />
      </TrustedBy.Root>

      <Tabs.Root>
        <Eyebrow
          colorScheme="secondary"
          heading={TABS_DATA.eyebrow.heading}
        />
        <Heading
          segments={TABS_DATA.heading}
          size="lg"
          weight="light"
        />
        <Body body={TABS_DATA.body} size="sm" />
        <Tabs.TabGroup tabs={TABS_DATA.tabs} />
      </Tabs.Root>

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
    </>
  );
}
