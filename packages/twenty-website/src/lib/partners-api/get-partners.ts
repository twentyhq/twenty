import { unstable_cache } from 'next/cache';

import { partnersApiFetch } from './client';
import type { MarketplacePartner } from './partner-types';

type ApiPartner = {
  id: string;
  name: string;
  slug: string;
  introduction: string;
  languagesSpoken: MarketplacePartner['languagesSpoken'][number][];
  deploymentExpertise: MarketplacePartner['deploymentExpertise'][number][];
  region: MarketplacePartner['region'][number][];
  calendarLink: { primaryLinkUrl: string | null } | null;
};

type ApiResponse = { ok: boolean; count: number; partners: ApiPartner[] };

// Bare domains stored in the CRM (e.g. "calendly.com/x") lack a scheme.
// Prepend https:// so the URL is absolute; isSafeHttpUrl in PartnerCard will
// still reject anything that doesn't parse as a valid http(s) URL.
const normalizeUrl = (raw: string): string =>
  raw && !raw.includes('://') ? `https://${raw}` : raw;

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
      deploymentExpertise: p.deploymentExpertise,
      region: p.region,
      calendarLink: normalizeUrl(p.calendarLink?.primaryLinkUrl ?? ''),
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
