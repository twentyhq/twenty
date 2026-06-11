import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { Faq } from '@/sections/faq';
import { FeatureCards } from '@/sections/feature-cards';
import { Helped } from '@/sections/helped';
import { HomeHero } from '@/sections/home-hero';
import { Menu } from '@/sections/menu';
import { Testimonials } from '@/sections/testimonials';
import { Problem } from '@/sections/problem';
import { Stepper } from '@/sections/stepper';
import { ThreeCards } from '@/sections/three-cards';
import { TrustedBy } from '@/sections/trusted-by';

export const generateMetadata = buildRouteMetadata('home');

export default async function HomePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);

  return (
    <>
      <Menu communityStats={communityStats} scheme="muted" />
      <main>
        <HomeHero />
        <TrustedBy />
        <Problem />
        <ThreeCards />
        <Stepper />
        <FeatureCards />
        <Helped />
        <Testimonials />
        <Faq />
      </main>
    </>
  );
}
