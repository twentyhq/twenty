import { msg } from '@lingui/core/macro';
import { HELPED_CARDS } from '@/app/[locale]/(home)/helped.data';
import { Problem, type ProblemPointType } from '@/sections/Problem';
import { HOME_TESTIMONIALS } from '@/app/[locale]/(home)/testimonials.data';
import { Faq, FAQ_QUESTIONS } from '@/sections/Faq';
import { TrustedBy } from '@/sections/TrustedBy';
import { Eyebrow, Heading, HeadingPart } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Helped } from '@/sections/Helped';
import { HomeHero } from '@/app/[locale]/(home)/_components/HomeHero';
import { HomeStepper, type HomeStepperStepType } from '@/sections/HomeStepper';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { Testimonials } from '@/sections/Testimonials';
import { HomeFeatureThreeCards } from '@/app/[locale]/(home)/_components/HomeFeatureThreeCards';
import { HomeIllustrationThreeCards } from '@/app/[locale]/(home)/_components/HomeIllustrationThreeCards';
import { buildFaqPageJsonLd, buildRouteMetadata, JsonLd } from '@/lib/seo';

export const generateMetadata = buildRouteMetadata('home');

const HOME_TOP_BACKGROUND_COLOR = '#F4F4F4';

type HomePageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function HomePage({ params }: HomePageProps) {
  const [i18n, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);

  const PROBLEM_POINTS: ProblemPointType[] = [
    {
      heading: (
        <HeadingPart fontFamily="sans">
          {i18n._(msg`The Giant Monolith`)}
        </HeadingPart>
      ),
      body: msg`Proprietary languages, slow deployment cycles, and "black box" logic.`,
    },
    {
      heading: (
        <HeadingPart fontFamily="sans">
          {i18n._(msg`The In-house Burden`)}
        </HeadingPart>
      ),
      body: msg`It's fragile. V1 ships quickly, but maintaining and making changes is a long term burden.`,
    },
  ];

  const HOME_STEPPER_STEPS: HomeStepperStepType[] = [
    {
      heading: (
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Begin with production-grade`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`building blocks`)}
          </HeadingPart>
        </Heading>
      ),
      body: msg`Compose your CRM and internal apps with a single extensibility toolkit. Data model, layout, and automation.`,
    },
    {
      heading: (
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Continue iteration`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`without friction`)}
          </HeadingPart>
        </Heading>
      ),
      body: msg`Enjoy unlimited customization using the AI coding tools you already love. Adapt your CRM to fit the way your business grows and wins.`,
    },
    {
      heading: (
        <Heading size="lg" weight="light">
          <HeadingPart fontFamily="serif">
            {i18n._(msg`Stay in control with our`)}
          </HeadingPart>{' '}
          <HeadingPart fontFamily="sans">
            {i18n._(msg`open-source software`)}
          </HeadingPart>
        </Heading>
      ),
      body: msg`Don't get locked into someone else's ecosystem. Twenty's developer experience looks like normal software, with local setup, real data, live testing, and no proprietary tooling.`,
    },
  ];
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <JsonLd data={buildFaqPageJsonLd(FAQ_QUESTIONS, (d) => i18n._(d))} />
      {/*
       * Above-the-fold home hero background texture. Preload warms the
       * HTTP cache so it is ready by the time HomeBackgroundHalftone
       * binds it to the WebGL pipeline.
       */}
      <link
        as="image"
        fetchPriority="high"
        href="/illustrations/generated/home-background-bridge.png"
        rel="preload"
      />
      <link
        rel="prefetch"
        href="/illustrations/home/helped/target.glb"
        as="fetch"
      />
      <link
        rel="prefetch"
        href="/illustrations/home/helped/spaceship.glb"
        as="fetch"
      />
      <link
        rel="prefetch"
        href="/illustrations/home/helped/money.glb"
        as="fetch"
      />
      <Menu
        backgroundColor={HOME_TOP_BACKGROUND_COLOR}
        socialLinks={menuSocialLinks}
      />

      <HomeHero />

      <TrustedBy />

      <Problem.Root>
        <Problem.Visual />
        <Problem.Content>
          <Eyebrow>
            <HeadingPart fontFamily="sans">
              {i18n._(msg`The Problem.`)}
            </HeadingPart>
          </Eyebrow>
          <Problem.Heading>
            <HeadingPart fontFamily="serif">
              {i18n._(msg`A custom CRM gives your org an edge,`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`but building one`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="serif">
              {i18n._(msg`comes with`)}
            </HeadingPart>{' '}
            <HeadingPart fontFamily="sans">
              {i18n._(msg`tradeoffs`)}
            </HeadingPart>
          </Problem.Heading>
          <Problem.Points points={PROBLEM_POINTS} />
        </Problem.Content>
      </Problem.Root>

      <HomeIllustrationThreeCards />

      <HomeStepper.ScrollSection steps={HOME_STEPPER_STEPS} />

      <HomeFeatureThreeCards />

      <Helped.Root scheme="muted">
        <Helped.Scene cards={HELPED_CARDS} />
      </Helped.Root>

      <Testimonials.Root scheme="muted">
        <Testimonials.Carousel
          eyebrow={i18n._(msg`They are the real sales`)}
          testimonials={HOME_TESTIMONIALS}
        >
          <Testimonials.HourglassVisual />
        </Testimonials.Carousel>
      </Testimonials.Root>

      <Faq />
    </>
  );
}
