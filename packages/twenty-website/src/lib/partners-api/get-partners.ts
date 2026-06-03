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

type ApiResponse = { ok: boolean; count: number; partners: ApiPartner[] };

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

const fetchPartnersUncached = async (): Promise<
  readonly MarketplacePartner[]
> => {
  try {
    const data = (await partnersApiFetch('/s/partners')) as ApiResponse;
    if (!Array.isArray(data.partners)) {
      throw new Error(
        '[partners-api] Unexpected API shape: missing partners array',
      );
    }
    return data.partners.map((p) => ({
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
    }));
  } catch (error) {
    console.error('[partners-api] getPartners failed:', error);
    return [];
  }
};

export const getPartners = unstable_cache(
  fetchPartnersUncached,
  ['partners-api:list'],
  { revalidate: 300, tags: ['partners-api'] },
);
