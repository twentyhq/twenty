import { msg } from '@lingui/core/macro';
import { HELPED_DATA } from '@/app/[locale]/(home)/helped.data';
import { HERO_COPY, HERO_DATA } from '@/app/[locale]/(home)/hero.data';
import { HOME_STEPPER_DATA } from '@/app/[locale]/(home)/home-stepper.data';
import { PROBLEM_DATA } from '@/app/[locale]/(home)/problem.data';
import { TESTIMONIALS_DATA } from '@/app/[locale]/(home)/testimonials.data';
import { THREE_CARDS_FEATURE_DATA } from '@/app/[locale]/(home)/three-cards-feature.data';
import { THREE_CARDS_ILLUSTRATION_DATA } from '@/app/[locale]/(home)/three-cards-illustration.data';
import { TalkToUsButton } from '@/lib/contact-cal';
import { FAQ_DATA } from '@/sections/Faq/data';
import { MENU_DATA } from '@/sections/Menu/data';
import { TRUSTED_BY_DATA } from '@/sections/TrustedBy/data';
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
import { Faq } from '@/sections/Faq/components';
import { Helped } from '@/sections/Helped/components';
import { Hero } from '@/sections/Hero/components';
import { HomeStepper } from '@/sections/HomeStepper/components';
import { Menu } from '@/sections/Menu/components';
import { Problem } from '@/sections/Problem/components';
import { Testimonials } from '@/sections/Testimonials/components';
import { ThreeCards } from '@/sections/ThreeCards/components';
import { buildFaqPageJsonLd, buildRouteMetadata, JsonLd } from '@/lib/seo';
import { TrustedBy } from '@/sections/TrustedBy/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

export const generateMetadata = buildRouteMetadata('home');

const HOME_TOP_BACKGROUND_COLOR = '#F4F4F4';

const HeroHeadingGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  width: 100%;

  > *:last-child {
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
    max-width: ${theme.layout.editorial};
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

type HomePageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function HomePage({ params }: HomePageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const renderText = createMessageDescriptorRenderer(i18n);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(FAQ_DATA.questions, renderText)} />
      {/*
       * Above-the-fold home hero background texture. Preload warms the
       * HTTP cache so it is ready by the time HomeBackgroundHalftone
       * binds it to the WebGL pipeline.
       */}
      <link
        as="image"
        href="/illustrations/generated/home-background-bridge.png"
        rel="preload"
      />
      <Menu.Root
        backgroundColor={HOME_TOP_BACKGROUND_COLOR}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <Hero.Root backgroundColor={HOME_TOP_BACKGROUND_COLOR} showHomeBackground>
        <HeroIntroGroup data-halftone-exclude>
          <HeroHeadingGroup>
            <Hero.Heading page={Pages.Home}>
              <HeadingPart fontFamily="serif">
                {renderText(msg`Build your Enterprise CRM`)}
              </HeadingPart>{' '}
              <HeadingPart fontFamily="sans">
                {renderText(msg`at\u00A0AI\u00A0Speed`)}
              </HeadingPart>
            </Hero.Heading>
            <Hero.Body
              page={Pages.Home}
              body={{ text: HERO_COPY.body }}
              renderText={renderText}
              size="sm"
            />
          </HeroHeadingGroup>
          <Hero.Cta>
            <LinkButton
              color="secondary"
              href="https://app.twenty.com/welcome"
              label={renderText(msg`Get started`)}
              variant="contained"
            />
            <TalkToUsButton
              color="secondary"
              label={msg`Talk to us`}
              variant="outlined"
            />
          </Hero.Cta>
        </HeroIntroGroup>
        <Hero.HomeVisual visual={HERO_DATA.visual} />
      </Hero.Root>

      <TrustedBy.Root>
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

      <Problem.Root>
        <Problem.Visual />
        <Problem.Content>
          <Eyebrow
            colorScheme="primary"
            heading={PROBLEM_DATA.eyebrow.heading}
            renderText={renderText}
          />
          <Problem.Heading>
            <HeadingPart fontFamily="serif">
              {renderText(msg`A custom CRM gives your org an edge,`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`but building one`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="serif">
              {renderText(msg`comes with`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`tradeoffs`)}
            </HeadingPart>
          </Problem.Heading>
          <Problem.Points
            points={PROBLEM_DATA.points}
            renderText={renderText}
          />
        </Problem.Content>
      </Problem.Root>

      <ThreeCards.Root backgroundColor={theme.colors.primary.background[100]}>
        <ThreeCards.Intro page={Pages.Home} align="left">
          <ThreeCardsIllustrationIntroContent>
            <ThreeCardsIllustrationIntroHeader>
              <Eyebrow
                colorScheme="primary"
                heading={THREE_CARDS_ILLUSTRATION_DATA.eyebrow.heading}
                renderText={renderText}
              />
              <Heading
                className={threeCardsIllustrationHeadingClassName}
                size="lg"
                weight="light"
              >
                <HeadingPart fontFamily="serif">
                  {renderText(msg`Assemble, iterate and adapt a robust CRM,`)}
                </HeadingPart>{' '}
                <HeadingPart fontFamily="sans">
                  {renderText(msg`that's quick to flex`)}
                </HeadingPart>
              </Heading>
            </ThreeCardsIllustrationIntroHeader>
            {THREE_CARDS_ILLUSTRATION_DATA.body && (
              <Body
                body={THREE_CARDS_ILLUSTRATION_DATA.body}
                className={threeCardsIllustrationBodyClassName}
                renderText={renderText}
                size="sm"
              />
            )}
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
            renderText={renderText}
          />
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {renderText(msg`Make your GTM team happy`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="serif">
              {renderText(msg`with`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {renderText(msg`a CRM they'll love`)}
            </HeadingPart>
          </Heading>
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
