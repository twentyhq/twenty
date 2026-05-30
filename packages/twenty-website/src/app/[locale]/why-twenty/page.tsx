import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { WhyTwentyMarquee } from '@/app/[locale]/why-twenty/_components/WhyTwentyMarquee';
import { WhyTwentyHero } from '@/app/[locale]/why-twenty/_components/WhyTwentyHero';
import { WhyTwentyMeaningEditorial } from '@/app/[locale]/why-twenty/_components/WhyTwentyMeaningEditorial';
import { WhyTwentyOpportunityEditorial } from '@/app/[locale]/why-twenty/_components/WhyTwentyOpportunityEditorial';
import { WhyTwentyShiftEditorial } from '@/app/[locale]/why-twenty/_components/WhyTwentyShiftEditorial';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { WhyTwentySignoff } from '@/app/[locale]/why-twenty/_components/WhyTwentySignoff';
import { theme } from '@/theme';
import { buildRouteMetadata } from '@/lib/seo';

export const generateMetadata = buildRouteMetadata('whyTwenty');

type WhyTwentyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function WhyTwentyPage({ params }: WhyTwentyPageProps) {
  // getRouteI18n sets the request-scoped i18n context the page's components
  // read; the page renders no copy of its own, so the instance is unused here.
  const [, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      {/*
       * Above-the-fold hero scene. Preload kicks off the GLB fetch in
       * parallel with the JS chunk download, so the model is already in
       * the browser cache by the time Three.js asks for it.
       */}
      <link
        as="fetch"
        href="/illustrations/why-twenty/hero/hero.glb"
        rel="preload"
      />
      <Menu
        backgroundColor={theme.colors.secondary.background[100]}
        scheme="secondary"
        socialLinks={menuSocialLinks}
      />

      <WhyTwentyHero />

      <WhyTwentyShiftEditorial />

      <WhyTwentyMeaningEditorial />

      <WhyTwentyOpportunityEditorial />

      <WhyTwentyMarquee />

      <WhyTwentySignoff />
    </>
  );
}
