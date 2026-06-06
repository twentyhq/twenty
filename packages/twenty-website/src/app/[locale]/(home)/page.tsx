import { HELPED_CARDS } from '@/app/[locale]/(home)/helped.data';
import { HomeProblem } from '@/app/[locale]/(home)/_components/HomeProblem';
import { Faq, FAQ_QUESTIONS } from '@/sections/Faq';
import { TrustedBy } from '@/sections/TrustedBy';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Helped } from '@/sections/Helped';
import { HomeHero } from '@/app/[locale]/(home)/_components/HomeHero';
import { HomeStepperSection } from '@/app/[locale]/(home)/_components/HomeStepperSection';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { HomeTestimonials } from '@/app/[locale]/(home)/_components/HomeTestimonials';
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

      <HomeProblem />

      <HomeIllustrationThreeCards />

      <HomeStepperSection />

      <HomeFeatureThreeCards />

      <Helped scheme="muted" cards={HELPED_CARDS} />

      <HomeTestimonials />

      <Faq />
    </>
  );
}
