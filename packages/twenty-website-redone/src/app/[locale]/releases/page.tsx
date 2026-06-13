import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { Menu } from '@/sections/menu';
import { ReleasesHero } from '@/sections/releases-hero';

export const generateMetadata = buildRouteMetadata('releases');

// Hero only for now; the release feed lands below it as its port arrives.
export default async function ReleasesPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Releases', path: '/releases' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <ReleasesHero />
      </main>
    </>
  );
}
