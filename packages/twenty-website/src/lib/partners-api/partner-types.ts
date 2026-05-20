import type {
  DeploymentExpertise,
  ServedGeo,
  SpokenLanguage,
} from './partner-facets';

export type MarketplacePartner = {
  slug: string;
  name: string;
  introduction: string;
  calendlyLink: string;
  deploymentExpertise: readonly DeploymentExpertise[];
  servedGeos: readonly ServedGeo[];
  languagesSpoken: readonly SpokenLanguage[];
};
