import { type CurrencyValue, type LinkValue } from './marketplace-api-types';
import { linkUrl } from './link-url';
import { microsToUsd } from './micros-to-usd';
import {
  type MarketplacePartner,
  type PartnerCaseStudy,
  type PartnerService,
} from './marketplace-partner';
import { partnersApiFetch } from './partners-api-fetch';
import { type PartnerScope } from './partner-scopes';
import { type ServedGeo } from './served-geos';
import { type SpokenLanguage } from './spoken-languages';

type ApiProfilePartner = {
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
  profileLinks: LinkValue[];
  skills: string[] | null;
  city: string | null;
  country: string | null;
  services: PartnerService[];
  portfolio: PartnerCaseStudy[];
};

type ApiProfileResponse =
  | { ok: true; partner: ApiProfilePartner }
  | { ok: false; reason: string };

const mapProfilePartner = (
  apiPartner: ApiProfilePartner,
): MarketplacePartner => {
  const linkUrls = apiPartner.profileLinks
    .map((link) => linkUrl(link))
    .filter((url) => url.length > 0);

  return {
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
    linkUrls,
    profilePictureUrl: linkUrl(apiPartner.profilePicture),
    skills: apiPartner.skills ?? [],
    city: apiPartner.city ?? '',
    country: apiPartner.country ?? '',
    services: apiPartner.services ?? [],
    portfolio: apiPartner.portfolio ?? [],
    clients: [],
  };
};

export async function fetchLivePartnerProfile(
  slug: string,
): Promise<MarketplacePartner | undefined> {
  try {
    const data = (await partnersApiFetch(
      `/s/partner-by-slug?slug=${encodeURIComponent(slug)}`,
      { cache: 'no-store' },
    )) as ApiProfileResponse;

    if (!data.ok || !('partner' in data)) {
      return undefined;
    }

    return mapProfilePartner(data.partner);
  } catch (error) {
    console.error('[partners-marketplace] profile fetch failed:', error);
    return undefined;
  }
}
