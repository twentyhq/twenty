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
  calendarLink: { primaryLinkUrl: string };
};

type ApiResponse = { ok: boolean; count: number; partners: ApiPartner[] };

export const getPartners = async (): Promise<readonly MarketplacePartner[]> => {
  try {
    const data = (await partnersApiFetch('/s/partners')) as ApiResponse;
    if (!Array.isArray(data.partners)) {
      throw new Error('[partners-api] Unexpected API shape: missing partners array');
    }
    return data.partners.map((p) => ({
      slug: p.slug,
      name: p.name,
      introduction: p.introduction,
      languagesSpoken: p.languagesSpoken,
      deploymentExpertise: p.deploymentExpertise,
      region: p.region,
      calendarLink: p.calendarLink.primaryLinkUrl,
    }));
  } catch (error) {
    console.error('[partners-api] getPartners failed:', error);
    return [];
  }
};
