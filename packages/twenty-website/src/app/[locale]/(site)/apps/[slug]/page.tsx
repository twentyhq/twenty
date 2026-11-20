import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  AppDetail,
  AppsMarketplaceClient,
  AppsMarketplaceHeader,
  fetchMarketplaceAppDetailBySlug,
  fetchMarketplaceApps,
  type MarketplaceApp,
  type MarketplaceAppDetail,
} from '@/apps-marketplace';
import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { getWebsiteRoute } from '@/platform/routing';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Menu } from '@/sections/menu';
// PROTOTYPE direction B: remove with the two files below.
import { AppDetailDirectionB } from '@/apps-marketplace/AppDetailDirectionB';
import { fetchMarketplaceAppAdditions } from '@/apps-marketplace/fetch-marketplace-app-additions';
// PROTOTYPE direction E, the "craft" app page (?direction=e).
import { AppsStageAppDetail } from '@/apps-marketplace/AppsStageAppDetail';
import { fetchAppsStageAppContent } from '@/apps-marketplace/apps-stage-app-content';

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
  searchParams,
}: {
  params: Promise<AppParams>;
  searchParams: Promise<{
    direction?: string;
    shape?: string;
    tone?: string;
  }>;
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
        <Menu communityStats={communityStats} scheme="light" />
        <main>
          <AppsMarketplaceHeader />
          <AppsMarketplaceClient apps={[]} isUnavailable />
        </main>
      </>
    );
  }

  if (app === null) {
    notFound();
  }

  const searchPrototype = await searchParams;
  const prototype = {
    ...searchPrototype,
    direction: searchPrototype.direction ?? 'e',
  };
  const relatedApps = apps.filter(
    (candidate) =>
      candidate.category === app.category && candidate.slug !== app.slug,
  );

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
      <Menu
        communityStats={communityStats}
        scheme={
          prototype.direction === 'e' ||
          (prototype.direction === 'b' && prototype.tone === 'dark')
            ? 'dark'
            : 'light'
        }
      />
      <main>
        {prototype.direction === 'e' ? (
          <AppsStageAppDetail
            additions={await fetchMarketplaceAppAdditions(
              app.universalIdentifier,
            )}
            content={await fetchAppsStageAppContent(app.universalIdentifier)}
            app={app}
            apps={apps}
            locale={locale}
          />
        ) : prototype.direction === 'b' ? (
          <AppDetailDirectionB
            app={app}
            additions={await fetchMarketplaceAppAdditions(
              app.universalIdentifier,
            )}
            relatedApps={relatedApps}
            shape={prototype.shape === 'notched' ? 'notched' : 'square'}
            tone={prototype.tone === 'dark' ? 'dark' : 'light'}
          />
        ) : (
          <AppDetail app={app} relatedApps={relatedApps} />
        )}
      </main>
    </>
  );
}
