import { type PartnerScope } from './partner-scopes';
import { type ServedGeo } from './served-geos';
import { type SpokenLanguage } from './spoken-languages';

// The normalized partner shape the marketplace renders — already mapped out of
// the CRM's currency/link wrappers (micros → USD, link objects → URL strings).
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
