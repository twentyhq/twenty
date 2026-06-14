import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { MarketplaceGrid } from '@/partners-marketplace/marketplace-grid';
import { MarketplaceHeader } from '@/partners-marketplace/marketplace-header';
import { loadMarketplacePartners } from '@/partners-marketplace/load-marketplace-partners';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { Menu } from '@/sections/menu';
import { SectionShell } from '@/ui';

export const generateMetadata = buildRouteMetadata('partnersList');

export default async function PartnersMarketplacePage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats, partners] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    loadMarketplacePartners(),
  ]);
  const locale = resolveLocaleParam((await params).locale);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Marketplace', path: '/partners/list' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="light" />
      <main>
        <MarketplaceHeader />
        <SectionShell rhythm="section" scheme="light">
          <MarketplaceGrid partners={partners} locale={locale} />
        </SectionShell>
      </main>
    </>
  );
}
