import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AppDetail, fetchMarketplaceAppDetailBySlug } from '@/apps-marketplace';
import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
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
  const app = await fetchMarketplaceAppDetailBySlug(slug);

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
  const app = await fetchMarketplaceAppDetailBySlug(slug);

  if (app === null) {
    notFound();
  }

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
      <Menu communityStats={communityStats} scheme="light" />
      <main>
        <AppDetail app={app} />
      </main>
    </>
  );
}
