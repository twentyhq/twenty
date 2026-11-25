import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ClientBriefModalRoot, GetMatchedButton } from '@/client-brief';
import { richTextExcerpt } from '@/partners-marketplace/rich-text-excerpt';
import { getCommunityStats } from '@/platform/community';
import { getRouteI18n } from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import { buildBreadcrumbListJsonLd, JsonLd } from '@/platform/seo';
import { Menu } from '@/sections/menu';
import {
  loadDirectoryPartner,
  loadDirectoryPartners,
  PartnerDetail,
} from '@/sections/partners-directory';

type PartnerProfileParams = { locale: string; slug: string };

export const dynamic = 'force-dynamic';

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<PartnerProfileParams>;
}): Promise<Metadata> {
  await getRouteI18n(params);
  const i18n = getServerI18n();
  const { slug } = await params;
  const partner = await loadDirectoryPartner(slug);
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
  const { locale: rawLocale, slug } = await params;
  const [, communityStats, partner, partners] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
    loadDirectoryPartner(slug),
    loadDirectoryPartners(),
  ]);
  const locale = resolveLocaleParam(rawLocale);
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
            { name: partner.name, path: `/partners/profile/${partner.slug}` },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} scheme="light" />
      <ClientBriefModalRoot>
        <main aria-label={partner.name}>
          <PartnerDetail
            matchCta={
              <GetMatchedButton
                label={msg`Get matched`}
                partnerSlug={partner.slug}
                variant="filled"
              />
            }
            partner={partner}
            partners={partners}
          />
        </main>
      </ClientBriefModalRoot>
    </>
  );
}
