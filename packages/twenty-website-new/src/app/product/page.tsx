import { TRUSTED_BY_DATA } from '@/app/(home)/constants/trusted-by';
import { HERO_DATA } from '@/app/product/constants/hero';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/product/constants/three-cards';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
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
          src="https://app.endlesstools.io/embed/0bcf3ac2-58cf-4cd5-90bd-e8fada9816a9"
          title="Endless Tools Editor"
          backgroundColor={theme.colors.secondary.background[5]}
        />

        <TrustedBy.Root>
          <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
          <TrustedBy.Logos
            clientCountLabel={TRUSTED_BY_DATA.clientCountLabel}
            logos={TRUSTED_BY_DATA.logos}
          />
        </TrustedBy.Root>

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
      </Hero.Root>
    </>
  );
}
