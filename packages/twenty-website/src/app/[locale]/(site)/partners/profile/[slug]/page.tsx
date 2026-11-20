import { msg } from '@lingui/core/macro';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ClientBriefModalRoot, GetMatchedButton } from '@/client-brief';
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
// PROTOTYPE direction E, the partner's page built like an app's page; the
// previous profile stays at ?direction=a.
import {
  PartnersStagePartnerDetail,
  PROTOTYPE_SAMPLE_PARTNERS,
} from '@/sections/partners-stage';

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
  const partner =
    (await getMarketplacePartnerBySlug(slug)) ??
    (process.env.NODE_ENV !== 'production'
      ? PROTOTYPE_SAMPLE_PARTNERS.find((sample) => sample.slug === slug)
      : undefined);
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
  searchParams,
}: {
  params: Promise<PartnerProfileParams>;
  searchParams: Promise<{ direction?: string }>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocaleParam(rawLocale);
  // PROTOTYPE: without the partners API (local dev), the directory shows
  // sample partners; their pages must open too.
  const partner =
    (await getMarketplacePartnerBySlug(slug)) ??
    (process.env.NODE_ENV !== 'production'
      ? PROTOTYPE_SAMPLE_PARTNERS.find((sample) => sample.slug === slug)
      : undefined);
  if (!partner) {
    notFound();
  }
  const direction = (await searchParams).direction ?? 'e';

  if (direction === 'e') {
    const listed = await getMarketplacePartners();
    const directory =
      listed.length === 0 && process.env.NODE_ENV !== 'production'
        ? PROTOTYPE_SAMPLE_PARTNERS
        : listed;

    return (
      <>
        <JsonLd
          data={buildBreadcrumbListJsonLd(
            [
              { name: 'Home', path: '/' },
              { name: 'Partners', path: '/partners' },
              {
                name: partner.name,
                path: `/partners/profile/${partner.slug}`,
              },
            ],
            locale,
          )}
        />
        <Menu communityStats={communityStats} scheme="dark" />
        <ClientBriefModalRoot>
          <main aria-label={partner.name}>
            <PartnersStagePartnerDetail
              matchCta={
                <GetMatchedButton
                  label={msg`Get matched`}
                  partnerSlug={partner.slug}
                  variant="filled"
                />
              }
              partner={partner}
              partners={directory}
            />
          </main>
        </ClientBriefModalRoot>
      </>
    );
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
      <Menu communityStats={communityStats} scheme="muted" />
      <ClientBriefModalRoot>
        <main aria-labelledby="partner-name">
          <PartnerProfile
            cta={
              <GetMatchedButton
                label={msg`Submit a brief`}
                partnerSlug={partner.slug}
                variant="outlined"
              />
            }
            partner={partner}
          />
        </main>
      </ClientBriefModalRoot>
    </>
  );
}
