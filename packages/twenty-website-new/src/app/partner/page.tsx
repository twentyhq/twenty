import { TRUSTED_BY_DATA } from '@/app/(home)/constants/trusted-by';
import { HERO_DATA } from '@/app/partner/constants/hero';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/partner/constants/three-cards-illustration';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { Hero } from '@/sections/Hero/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';

export default function PartnerPage() {
  return (
    <>
      <Hero.Root backgroundColor={theme.colors.primary.background[100]}>
        <Hero.Heading page={Pages.Partner} segments={HERO_DATA.heading} />
        <Hero.Body page={Pages.Partner} body={HERO_DATA.body} />
        <Hero.Cta>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Become a partner"
            type="anchor"
            variant="outlined"
          />
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Find a partner"
            type="anchor"
            variant="contained"
          />
        </Hero.Cta>
        <Hero.Illustration
          src="https://app.endlesstools.io/embed/1c6c8259-3276-4cf2-84d8-6b7e87e7ec95"
          title="Endless Tools Editor"
          backgroundColor={theme.colors.secondary.background[100]}
        />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos
          clientCountLabel={TRUSTED_BY_DATA.clientCountLabel}
          logos={TRUSTED_BY_DATA.logos}
        />
      </TrustedBy.Root>

      <ThreeCards.Root backgroundColor={theme.colors.secondary.background[5]}>
        <ThreeCards.Intro align="left">
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
    </>
  );
}
