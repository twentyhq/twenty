import { msg } from '@lingui/core/macro';

import { fetchMarketplaceApps } from '@/apps-marketplace';
import { AppsCatalogue } from '@/apps-marketplace/AppsCatalogue';
import { AppsHero } from '@/apps-marketplace/AppsHero';
import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { SITE_URLS } from '@/platform/site-urls';
import { Faq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { Button, Signoff } from '@/ui';

export const generateMetadata = buildRouteMetadata('apps');

export const dynamic = 'force-dynamic';

export default async function AppsMarketplacePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats, apps] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    fetchMarketplaceApps().catch((error: unknown) => {
      console.error('[apps-marketplace] live fetch failed:', error);

      return null;
    }),
  ]);
  const locale = resolveLocaleParam((await params).locale);
  const i18n = getServerI18n();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Apps', path: '/apps' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="muted" />
      <main>
        <AppsHero apps={apps ?? []} />
        <AppsCatalogue apps={apps ?? []} isUnavailable={apps === null} />
        <Signoff
          body={i18n._(
            msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
          )}
          heading={i18n._(msg`Build your own *app*`)}
          scheme="muted"
        >
          <Button
            href={SITE_URLS.docsDevelopers}
            label={i18n._(msg`Read the docs`)}
            variant="filled"
          />
        </Signoff>
        <Faq />
      </main>
    </>
  );
}
