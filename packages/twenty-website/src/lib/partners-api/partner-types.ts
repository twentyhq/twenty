import type {
  PartnerScope,
  ServedGeo,
  SpokenLanguage,
} from './partner-facets';

export type MarketplacePartner = {
  slug: string;
  name: string;
  introduction: string;
  calendarLink: string;
  partnerScope: readonly PartnerScope[];
  region: readonly ServedGeo[];
  languagesSpoken: readonly SpokenLanguage[];
  hourlyRateUsd: number | null;
  projectBudgetMinUsd: number | null;
  projectBudgetTypicalUsd: number | null;
  linkedinUrl: string;
  profilePictureUrl: string;
  city: string;
  country: string;
  skills: readonly string[];
};
