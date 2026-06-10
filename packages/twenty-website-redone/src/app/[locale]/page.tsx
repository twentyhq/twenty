import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { buildRouteMetadata } from '@/platform/seo';
import { HomeHero } from '@/sections/home-hero';
import { Menu } from '@/sections/menu';
import { TrustedBy } from '@/sections/trusted-by';
import { SectionShell } from '@/ui';

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
        <SectionShell ariaLabel="Trusted by leading organizations">
          <TrustedBy />
        </SectionShell>
      </main>
    </>
  );
}
