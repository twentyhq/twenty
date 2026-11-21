import { msg } from '@lingui/core/macro';

import { fetchMarketplaceApps } from '@/apps-marketplace';
import { AppsStageCraftCatalogue } from '@/apps-marketplace/AppsStageCraftCatalogue';
import { AppsStageCraftHero } from '@/apps-marketplace/AppsStageCraftHero';
import { AppsStageFeatured } from '@/apps-marketplace/AppsStageFeatured';
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
import { FaqBackdrop } from '@/sections/faq/FaqBackdrop';
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
      <Menu communityStats={communityStats} scheme="dark" />
      <main>
        <AppsStageCraftHero apps={apps ?? []} />
        <AppsStageFeatured apps={apps ?? []} />
        <AppsStageCraftCatalogue
          apps={apps ?? []}
          isUnavailable={apps === null}
        />
        <Signoff
          backdrop={<FaqBackdrop />}
          body={i18n._(
            msg`Add objects, logic and interface to Twenty, then publish it for every workspace.`,
          )}
          heading={i18n._(msg`Build your own *app*`)}
          scheme="dark"
        >
          <Button
            href={SITE_URLS.docsDevelopers}
            label={i18n._(msg`Read the docs`)}
            variant="filled"
          />
        </Signoff>
      </main>
    </>
  );
}
