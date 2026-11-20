import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  fetchMarketplaceAppDetailBySlug,
  fetchMarketplaceApps,
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from '@/apps-marketplace';
import { fetchAppsStageAppContent } from '@/apps-marketplace/apps-stage-app-content';
import { AppsStageAppDetail } from '@/apps-marketplace/AppsStageAppDetail';
import { AppsStageCraftCatalogue } from '@/apps-marketplace/AppsStageCraftCatalogue';
import { AppsStageCraftHero } from '@/apps-marketplace/AppsStageCraftHero';
import { fetchMarketplaceAppAdditions } from '@/apps-marketplace/fetch-marketplace-app-additions';
import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { getWebsiteRoute } from '@/platform/routing';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Menu } from '@/sections/menu';

type AppParams = { locale: string; slug: string };

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<AppParams>;
}): Promise<Metadata> {
  await getRouteI18n(params);
  const i18n = getServerI18n();
  const { slug } = await params;
  let app: MarketplaceAppDetail | null;

  try {
    app = await fetchMarketplaceAppDetailBySlug(slug);
  } catch {
    return { title: i18n._(getWebsiteRoute('apps').title) };
  }

  if (app === null) {
    return { title: i18n._(msg`App not found — Twenty`) };
  }

  return {
    title: i18n._(msg`${app.name} — Twenty Apps`),
    description: app.tagline,
  };
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<AppParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocaleParam(rawLocale);
  let app: MarketplaceAppDetail | null;
  let apps: readonly MarketplaceApp[];

  try {
    [app, apps] = await Promise.all([
      fetchMarketplaceAppDetailBySlug(slug),
      fetchMarketplaceApps(),
    ]);
  } catch (error) {
    console.error('[apps-marketplace] live fetch failed:', error);

    return (
      <>
        <Menu communityStats={communityStats} scheme="dark" />
        <main>
          <AppsStageCraftHero apps={[]} />
          <AppsStageCraftCatalogue apps={[]} isUnavailable />
        </main>
      </>
    );
  }

  if (app === null) {
    notFound();
  }

  const [additions, content] = await Promise.all([
    fetchMarketplaceAppAdditions(app.universalIdentifier),
    fetchAppsStageAppContent(app.universalIdentifier),
  ]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Apps', path: '/apps' },
            { name: app.name, path: `/apps/${slug}` },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="dark" />
      <main>
        <AppsStageAppDetail
          additions={additions}
          app={app}
          apps={apps}
          content={content}
          locale={locale}
        />
      </main>
    </>
  );
}
