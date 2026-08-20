import {
  PARTNER_TIERS,
  type PartnerTier,
  type RankedMarketplacePartner,
} from './marketplace-partner';
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
  partnerTier: PartnerTier | null;
  serviceCount: number;
  approvedCaseStudyCount: number;
  approvedCaseStudyWithCoverCount: number;
  rotationKey: string;
};

type ApiResponse = {
  partners?: ApiPartner[];
  ok?: boolean;
};

const RANKING_COUNTS = [
  'serviceCount',
  'approvedCaseStudyCount',
  'approvedCaseStudyWithCoverCount',
] as const;

// The ranking tuple carries no defaults on purpose. A missing count turns the
// score into NaN, which the comparator silently skips, so a partial payload
// would seat a partner in a slot it never earned.
const assertRankingContract = (apiPartner: ApiPartner): void => {
  if (
    typeof apiPartner.rotationKey !== 'string' ||
    apiPartner.rotationKey.length === 0
  ) {
    throw new Error(
      `partners API returned no rotationKey for "${apiPartner.slug}" (${JSON.stringify(apiPartner.rotationKey)})`,
    );
  }

  const invalidCount = RANKING_COUNTS.find(
    (count) => !Number.isInteger(apiPartner[count]) || apiPartner[count] < 0,
  );

  if (invalidCount !== undefined) {
    throw new Error(
      `partners API returned an invalid ${invalidCount} for "${apiPartner.slug}" (${JSON.stringify(apiPartner[invalidCount])})`,
    );
  }
};

// partnerTier is a CRM select the API owns, so it can gain values this build
// never heard of. An unknown one ranks as unset instead of breaking the tier
// comparison.
const readPartnerTier = (value: unknown): PartnerTier | null =>
  PARTNER_TIERS.find((tier) => tier === value) ?? null;

// The live source: normalize the CRM payload into MarketplacePartner. Degrades
// to [] when the API is unreachable or shapeless (matching the old getPartners)
// so the page renders the empty state rather than crashing. A payload that
// breaks the ranking contract throws instead — see assertRankingContract.
export async function fetchLiveMarketplacePartners(): Promise<
  readonly RankedMarketplacePartner[]
> {
  let data: ApiResponse;

  try {
    data = (await partnersApiFetch('/s/partners')) as ApiResponse;
  } catch (error) {
    console.error('[partners-marketplace] live fetch failed:', error);
    return [];
  }

  const partners = data.partners;

  if (!Array.isArray(partners)) {
    console.error(
      '[partners-marketplace] live fetch failed:',
      new Error('partners API response missing partners array'),
    );
    return [];
  }

  return partners.map((apiPartner) => {
    assertRankingContract(apiPartner);

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
      profilePictureUrl: linkUrl(apiPartner.profilePicture),
      skills: apiPartner.skills ?? [],
      city: apiPartner.city ?? '',
      country: apiPartner.country ?? '',
      services: [],
      portfolio: [],
      clients: [],
      partnerTier: readPartnerTier(apiPartner.partnerTier),
      serviceCount: apiPartner.serviceCount,
      approvedCaseStudyCount: apiPartner.approvedCaseStudyCount,
      approvedCaseStudyWithCoverCount:
        apiPartner.approvedCaseStudyWithCoverCount,
      rotationKey: apiPartner.rotationKey,
    };
  });
}
