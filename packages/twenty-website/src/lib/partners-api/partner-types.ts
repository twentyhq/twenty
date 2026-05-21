import type {
  DeploymentExpertise,
  ServedGeo,
  SpokenLanguage,
} from './partner-facets';

export type MarketplacePartner = {
  slug: string;
  name: string;
  introduction: string;
  calendarLink: string;
  deploymentExpertise: readonly DeploymentExpertise[];
  region: readonly ServedGeo[];
  languagesSpoken: readonly SpokenLanguage[];
};
