export type DeploymentExpertise = 'CLOUD' | 'SELF_HOST';

export type ServedGeo = 'EUROPE' | 'US' | 'LATAM' | 'MENA' | 'APAC' | 'AFRICA';

export type SpokenLanguage =
  | 'ENGLISH'
  | 'FRENCH'
  | 'GERMAN'
  | 'CHINESE'
  | 'SPANISH';

export type MarketplacePartner = {
  slug: string;
  name: string;
  introduction: string;
  calendlyLink: string;
  deploymentExpertise: readonly DeploymentExpertise[];
  servedGeos: readonly ServedGeo[];
  languagesSpoken: readonly SpokenLanguage[];
};
