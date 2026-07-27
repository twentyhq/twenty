import { type MarketplacePartner } from './marketplace-partner';
import { type CurrencyValue, type LinkValue } from './marketplace-api-types';
import { linkUrl } from './link-url';
import { microsToUsd } from './micros-to-usd';
import { partnersApiFetch } from './partners-api-fetch';
import { type PartnerScope } from './partner-scopes';
import { type ServedGeo } from './served-geos';
import { type SpokenLanguage } from './spoken-languages';

type ApiPartner = {
  name: string;
  slug: string;
  introduction: string;
  languagesSpoken: SpokenLanguage[];
  partnerScope: PartnerScope[] | null;
  region: ServedGeo[];
  calendarLink: LinkValue;
  hourlyRate: CurrencyValue;
  projectBudgetMin: CurrencyValue;
  linkedin: LinkValue;
  website: LinkValue;
  profilePicture: LinkValue;
  skills: string[] | null;
  city: string | null;
  country: string | null;
};

type ApiResponse = {
  partners?: ApiPartner[];
  ok?: boolean;
};

// The live source: normalize the CRM payload into MarketplacePartner. Degrades
// to [] on any failure (matching the old getPartners) so the page renders the
// empty state rather than crashing.
export async function fetchLiveMarketplacePartners(): Promise<
  readonly MarketplacePartner[]
> {
  try {
    const data = (await partnersApiFetch('/s/partners')) as ApiResponse;
    const partners = data.partners;
    if (!Array.isArray(partners)) {
      throw new Error('partners API response missing partners array');
    }
    return partners.map((apiPartner) => ({
      slug: apiPartner.slug,
      name: apiPartner.name,
      description: apiPartner.introduction ?? '',
      languagesSpoken: apiPartner.languagesSpoken,
      partnerScope: apiPartner.partnerScope ?? [],
      region: apiPartner.region,
      calendarLink: linkUrl(apiPartner.calendarLink),
      hourlyRateUsd: microsToUsd(apiPartner.hourlyRate),
      projectBudgetMinUsd: microsToUsd(apiPartner.projectBudgetMin),
      links: {
        linkedin: linkUrl(apiPartner.linkedin) || null,
        website: linkUrl(apiPartner.website) || null,
        x: null,
        github: null,
      },
      profilePictureUrl: linkUrl(apiPartner.profilePicture),
      skills: apiPartner.skills ?? [],
      city: apiPartner.city ?? '',
      country: apiPartner.country ?? '',
      services: [],
      portfolio: [],
      clients: [],
    }));
  } catch (error) {
    console.error('[partners-marketplace] live fetch failed:', error);
    return [];
  }
}
