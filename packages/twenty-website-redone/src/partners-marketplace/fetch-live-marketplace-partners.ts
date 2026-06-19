import { type MarketplacePartner } from './marketplace-partner';
import { partnersApiFetch } from './partners-api-fetch';
import { type PartnerScope } from './partner-scopes';
import { type ServedGeo } from './served-geos';
import { type SpokenLanguage } from './spoken-languages';

type CurrencyValue = { amountMicros: number; currencyCode: string } | null;
type LinkValue = { primaryLinkUrl: string | null } | null;

// The raw CRM shape, before normalization (currency wrappers, link objects,
// nullable multi-selects).
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
  projectBudgetTypical: CurrencyValue;
  linkedin: LinkValue;
  profilePicture: LinkValue;
  skills: string[] | null;
  city: string | null;
  country: string | null;
};

type ApiResponse = { partners: ApiPartner[] };

const normalizeUrl = (raw: string | null | undefined): string => {
  if (!raw) return '';
  return raw.includes('://') ? raw : `https://${raw}`;
};

const linkUrl = (link: LinkValue): string =>
  normalizeUrl(link?.primaryLinkUrl ?? '');

const microsToUsd = (currency: CurrencyValue): number | null =>
  currency && typeof currency.amountMicros === 'number'
    ? Math.round(currency.amountMicros / 1_000_000)
    : null;

// The live source: normalize the CRM payload into MarketplacePartner. Degrades
// to [] on any failure (matching the old getPartners) so the page renders the
// empty state rather than crashing.
export async function fetchLiveMarketplacePartners(): Promise<
  readonly MarketplacePartner[]
> {
  try {
    const data = (await partnersApiFetch('/s/partners')) as ApiResponse;
    if (!Array.isArray(data.partners)) {
      throw new Error('partners API response missing partners array');
    }
    return data.partners.map((apiPartner) => ({
      slug: apiPartner.slug,
      name: apiPartner.name,
      introduction: apiPartner.introduction,
      languagesSpoken: apiPartner.languagesSpoken,
      partnerScope: apiPartner.partnerScope ?? [],
      region: apiPartner.region,
      calendarLink: linkUrl(apiPartner.calendarLink),
      hourlyRateUsd: microsToUsd(apiPartner.hourlyRate),
      projectBudgetMinUsd: microsToUsd(apiPartner.projectBudgetMin),
      projectBudgetTypicalUsd: microsToUsd(apiPartner.projectBudgetTypical),
      linkedinUrl: linkUrl(apiPartner.linkedin),
      profilePictureUrl: linkUrl(apiPartner.profilePicture),
      skills: apiPartner.skills ?? [],
      city: apiPartner.city ?? '',
      country: apiPartner.country ?? '',
    }));
  } catch (error) {
    console.error('[partners-marketplace] live fetch failed:', error);
    return [];
  }
}
