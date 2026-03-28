import { HERO_DATA } from '@/app/(home)/constants/hero';
import { PROBLEM_DATA } from '@/app/(home)/constants/problem';
import { THREE_CARDS_FEATURE_DATA } from '@/app/(home)/constants/three-cards-feature';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/(home)/constants/three-cards-illustration';
import { TRUSTED_BY_DATA } from '@/app/(home)/constants/trusted-by';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
import { Problem } from '@/sections/Problem/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';

export default function HomePage() {
  return (
    <>
      <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
        <Hero.Heading page={Pages.Home} segments={HERO_DATA.heading} />
        <Hero.Body page={Pages.Home} body={HERO_DATA.body} size="sm" />
        <Hero.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Get started"
            type="anchor"
            variant="contained"
          />
        </Hero.Cta>
        <Hero.HomeVisual />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos
          clientCountLabel={TRUSTED_BY_DATA.clientCountLabel}
          logos={TRUSTED_BY_DATA.logos}
        />
      </TrustedBy.Root>

      <Problem.Root>
        <Problem.Visual />
        <Problem.Content>
          <Eyebrow
            colorScheme="primary"
            heading={PROBLEM_DATA.eyebrow.heading}
          />
          <Problem.Heading segments={PROBLEM_DATA.heading} />
          <Problem.Points points={PROBLEM_DATA.points} />
        </Problem.Content>
      </Problem.Root>

      <ThreeCards.Root backgroundColor={theme.colors.primary.background[100]}>
        <ThreeCards.Intro page={Pages.Home} align="left">
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

      <ThreeCards.Root backgroundColor={theme.colors.primary.background[100]}>
        <ThreeCards.Intro page={Pages.Home} align="center">
          <Eyebrow
            colorScheme="primary"
            heading={THREE_CARDS_FEATURE_DATA.eyebrow.heading}
          />
          <Heading
            segments={THREE_CARDS_FEATURE_DATA.heading}
            size="lg"
            weight="light"
          />
        </ThreeCards.Intro>
        <ThreeCards.FeatureCards
          featureCards={THREE_CARDS_FEATURE_DATA.featureCards}
        />
      </ThreeCards.Root>
    </>
  );
}
