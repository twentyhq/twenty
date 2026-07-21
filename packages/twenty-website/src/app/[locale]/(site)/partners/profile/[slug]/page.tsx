import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  getMarketplacePartnerBySlug,
  getMarketplacePartners,
} from '@/partners-marketplace/marketplace-partners-source';
import { PartnerProfile } from '@/partners-marketplace/PartnerProfile';
import { richTextExcerpt } from '@/partners-marketplace/rich-text-excerpt';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Menu } from '@/sections/menu';

type PartnerProfileParams = { locale: string; slug: string };

export const dynamic = 'force-dynamic';

export const dynamicParams = true;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const partners = await getMarketplacePartners();
  return partners.map((partner) => ({ slug: partner.slug }));
}

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
    description: richTextExcerpt(partner.description, 160),
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
