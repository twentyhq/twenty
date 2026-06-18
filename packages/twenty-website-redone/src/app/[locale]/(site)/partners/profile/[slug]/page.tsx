import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { fetchLiveMarketplacePartners } from '@/partners-marketplace/fetch-live-marketplace-partners';
import { getMarketplacePartnerBySlug } from '@/partners-marketplace/get-marketplace-partner-by-slug';
import { PartnerProfile } from '@/partners-marketplace/PartnerProfile';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Menu } from '@/sections/menu';

type PartnerProfileParams = { locale: string; slug: string };

// The parent [locale] segment sets dynamicParams=false, so each partner slug
// must be enumerated here too or it 404s.
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const partners = await fetchLiveMarketplacePartners();
  return partners.map((partner) => ({ slug: partner.slug }));
}

// Collapse whitespace and cap to a meta-description length.
const truncateDescription = (text: string, max = 160): string => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max - 1)}…`;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PartnerProfileParams>;
}): Promise<Metadata> {
  await getRouteI18n(params);
  const i18n = getServerI18n();
  const { slug } = await params;
  const partner = await getMarketplacePartnerBySlug(slug);
  if (!partner) {
    return { title: i18n._(msg`Partner not found — Twenty Partners`) };
  }
  return {
    title: i18n._(msg`${partner.name} — Twenty Partner`),
    description: truncateDescription(partner.introduction),
  };
}

export default async function PartnerProfilePage({
  params,
}: {
  params: Promise<PartnerProfileParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocaleParam(rawLocale);
  const partner = await getMarketplacePartnerBySlug(slug);
  if (!partner) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Marketplace', path: '/partners/list' },
            { name: partner.name, path: `/partners/profile/${partner.slug}` },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="muted" />
      <main aria-labelledby="partner-name">
        <PartnerProfile partner={partner} />
      </main>
    </>
  );
}
