import { type PartnerScope } from './partner-scopes';
import { type ServedGeo } from './served-geos';
import { type SpokenLanguage } from './spoken-languages';

export type PartnerService = { title: string; description: string };
export type PartnerCaseStudy = {
  client: string;
  title: string;
  body: string; // markdown
  imageUrl: string | null;
  link: string | null;
};
export type PartnerClient = { name: string; logoUrl: string | null };
export type PartnerLinks = {
  website: string | null;
  linkedin: string | null;
  x: string | null;
  github: string | null;
};

export type MarketplacePartner = {
  slug: string;
  name: string;
  description: string; // markdown; was `introduction`
  calendarLink: string;
  partnerScope: readonly PartnerScope[];
  region: readonly ServedGeo[];
  languagesSpoken: readonly SpokenLanguage[];
  hourlyRateUsd: number | null;
  projectBudgetMinUsd: number | null;
  links: PartnerLinks;
  /** Flat profile URLs from `/s/partner-by-slug`; preferred over typed `links` on profile pages. */
  linkUrls?: readonly string[];
  profilePictureUrl: string;
  city: string;
  country: string;
  skills: readonly string[];
  services: readonly PartnerService[];
  portfolio: readonly PartnerCaseStudy[];
  clients: readonly PartnerClient[];
};
