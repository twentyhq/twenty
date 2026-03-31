import { FAQ_DATA } from '@/app/(home)/constants/faq';
import { MENU_DATA } from '@/app/(home)/constants/menu';
import { TRUSTED_BY_DATA } from '@/app/(home)/constants/trusted-by';
import { ENGAGEMENT_BAND_DATA } from '@/app/partner/constants/engagement-band';
import { HERO_DATA } from '@/app/partner/constants/hero';
import { TESTIMONIALS_DATA } from '@/app/partner/constants/testimonials';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/partner/constants/three-cards-illustration';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { EngagementBand } from '@/sections/EngagementBand/components';
import { Faq } from '@/sections/Faq/components';
import { Hero } from '@/sections/Hero/components';
import { Menu } from '@/sections/Menu/components';
import { Testimonials } from '@/sections/Testimonials/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';

export default function PartnerPage() {
  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={MENU_DATA.socialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={MENU_DATA.socialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

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
          illustration={HERO_DATA.illustration}
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
              href="https://app.twenty.com/welcome"
              label="Read our case studies"
              type="anchor"
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
        color={theme.colors.primary.text[100]}
      >
        <Testimonials.Carousel
          eyebrow={TESTIMONIALS_DATA.eyebrow}
          illustration={TESTIMONIALS_DATA.illustration}
          testimonials={TESTIMONIALS_DATA.testimonials}
        />
      </Testimonials.Root>

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
