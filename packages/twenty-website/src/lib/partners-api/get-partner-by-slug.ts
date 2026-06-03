import { unstable_cache } from 'next/cache';

import { partnersApiFetch } from './client';
import type { MarketplacePartner } from './partner-types';

type CurrencyValue = { amountMicros: number; currencyCode: string } | null;
type LinkValue = { primaryLinkUrl: string | null } | null;

type ApiPartner = {
  id: string;
  name: string;
  slug: string;
  introduction: string;
  languagesSpoken: MarketplacePartner['languagesSpoken'][number][];
  partnerScope: MarketplacePartner['partnerScope'][number][] | null;
  region: MarketplacePartner['region'][number][];
  calendarLink: LinkValue;
  hourlyRate: CurrencyValue;
  projectBudgetMin: CurrencyValue;
  projectBudgetTypical: CurrencyValue;
  linkedin: LinkValue;
  profilePicture: LinkValue;
  skills: string[] | null;
  city: string | null;
  country: string | null;
};

type ApiResponse =
  | { ok: true; partner: ApiPartner }
  | { ok: false; reason: string };

const normalizeUrl = (raw: string | null | undefined): string => {
  if (!raw) return '';
  return raw.includes('://') ? raw : `https://${raw}`;
};

const linkUrl = (link: LinkValue): string =>
  normalizeUrl(link?.primaryLinkUrl ?? '');

const microsToUsd = (currency: CurrencyValue): number | null => {
  if (!currency || typeof currency.amountMicros !== 'number') return null;
  return Math.round(currency.amountMicros / 1_000_000);
};

const toMarketplacePartner = (p: ApiPartner): MarketplacePartner => ({
  slug: p.slug,
  name: p.name,
  introduction: p.introduction,
  languagesSpoken: p.languagesSpoken,
  partnerScope: p.partnerScope ?? [],
  region: p.region,
  calendarLink: linkUrl(p.calendarLink),
  hourlyRateUsd: microsToUsd(p.hourlyRate),
  projectBudgetMinUsd: microsToUsd(p.projectBudgetMin),
  projectBudgetTypicalUsd: microsToUsd(p.projectBudgetTypical),
  linkedinUrl: linkUrl(p.linkedin),
  profilePictureUrl: linkUrl(p.profilePicture),
  skills: p.skills ?? [],
  city: p.city ?? '',
  country: p.country ?? '',
});

const fetchPartnerBySlugUncached = async (
  slug: string,
): Promise<MarketplacePartner | null> => {
  try {
    const data = (await partnersApiFetch(
      `/s/partner-by-slug?slug=${encodeURIComponent(slug)}`,
    )) as ApiResponse;
    if (!data.ok) return null;
    return toMarketplacePartner(data.partner);
  } catch (error) {
    console.error('[partners-api] getPartnerBySlug failed:', error);
    return null;
  }
};

export const getPartnerBySlug = (
  slug: string,
): Promise<MarketplacePartner | null> =>
  unstable_cache(
    () => fetchPartnerBySlugUncached(slug),
    ['partners-api:by-slug', slug],
    { revalidate: 300, tags: ['partners-api'] },
  )();
