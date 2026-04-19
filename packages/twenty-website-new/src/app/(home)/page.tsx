import {
  HELPED_DATA,
  HERO_DATA,
  HOME_STEPPER_DATA,
  PROBLEM_DATA,
  TESTIMONIALS_DATA,
  THREE_CARDS_FEATURE_DATA,
  THREE_CARDS_ILLUSTRATION_DATA,
} from '@/app/(home)/_constants';
import { TalkToUsButton } from '@/app/components/ContactCalModal';
import { FAQ_DATA, MENU_DATA, TRUSTED_BY_DATA } from '@/app/_constants';
import { Body, Eyebrow, Heading, LinkButton } from '@/design-system/components';
import { Pages } from '@/enums/pages';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Faq } from '@/sections/Faq/components';
import { Helped } from '@/sections/Helped/components';
import { Hero } from '@/sections/Hero/components';
import { HomeStepper } from '@/sections/HomeStepper/components';
import { Menu } from '@/sections/Menu/components';
import { Problem } from '@/sections/Problem/components';
import { Testimonials } from '@/sections/Testimonials/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twenty — Open Source CRM',
  description: 'Modular, scalable open source CRM for modern teams.',
};

const HeroHeadingGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  width: 100%;

  > *:nth-child(2) {
    margin-top: 0;
  }
`;

const HeroIntroGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(8)};
  width: 100%;
`;

const ThreeCardsIllustrationIntroContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(2)};
  width: 100%;
`;

const ThreeCardsIllustrationIntroHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(6)};
  width: 100%;
`;

const threeCardsIllustrationHeadingClassName = css`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 921px;
  }

  [data-family='sans'] {
    letter-spacing: -0.02em;
  }
`;

const threeCardsIllustrationBodyClassName = css`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 571px;
  }
`;

export default async function HomePage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.secondary.background[5]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <Hero.Root
        backgroundColor={theme.colors.secondary.background[5]}
        showHomeBackground
      >
        <HeroIntroGroup data-halftone-exclude>
          <HeroHeadingGroup>
            <Hero.Heading page={Pages.Home} segments={HERO_DATA.heading} />
            <Hero.Body page={Pages.Home} body={HERO_DATA.body} size="sm" />
          </HeroHeadingGroup>
          <Hero.Cta>
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
          </Hero.Cta>
        </HeroIntroGroup>
        <Hero.HomeVisual visual={HERO_DATA.visual} />
      </Hero.Root>

      <TrustedBy.Root>
        <TrustedBy.Separator separator={TRUSTED_BY_DATA.separator} />
        <TrustedBy.Logos logos={TRUSTED_BY_DATA.logos} />
        <TrustedBy.ClientCount
          label={TRUSTED_BY_DATA.clientCountLabel.text}
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
          <ThreeCardsIllustrationIntroContent>
            <ThreeCardsIllustrationIntroHeader>
              <Eyebrow
                colorScheme="primary"
                heading={THREE_CARDS_ILLUSTRATION_DATA.eyebrow.heading}
              />
              <Heading
                className={threeCardsIllustrationHeadingClassName}
                segments={THREE_CARDS_ILLUSTRATION_DATA.heading}
                size="lg"
                weight="light"
              />
            </ThreeCardsIllustrationIntroHeader>
            <Body
              body={THREE_CARDS_ILLUSTRATION_DATA.body}
              className={threeCardsIllustrationBodyClassName}
              size="sm"
            />
          </ThreeCardsIllustrationIntroContent>
        </ThreeCards.Intro>
        <ThreeCards.IllustrationCards
          illustrationCards={THREE_CARDS_ILLUSTRATION_DATA.illustrationCards}
        />
      </ThreeCards.Root>

      <HomeStepper.ScrollSection steps={HOME_STEPPER_DATA.steps} />

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
          <LinkButton
            color="secondary"
            href="/product"
            label="Visit product page"
            type="link"
            variant="contained"
          />
        </ThreeCards.Intro>
        <ThreeCards.FeatureCards
          featureCards={THREE_CARDS_FEATURE_DATA.featureCards}
        />
      </ThreeCards.Root>

      <Helped.Root backgroundColor={theme.colors.secondary.background[5]}>
        <Helped.Scene data={HELPED_DATA} />
      </Helped.Root>

      <Testimonials.Root
        backgroundColor={theme.colors.secondary.background[5]}
        color={theme.colors.primary.text[100]}
      >
        <Testimonials.Carousel
          eyebrow={TESTIMONIALS_DATA.eyebrow}
          testimonials={TESTIMONIALS_DATA.testimonials}
        >
          <Testimonials.HomeVisual />
        </Testimonials.Carousel>
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
