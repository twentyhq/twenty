export type MarketplaceApp = {
  universalIdentifier: string;
  slug: string;
  name: string;
  tagline: string;
  author: string;
  category: string;
  logoUrl?: string;
  sourcePackage?: string;
  isVetted: boolean;
};

export type MarketplaceAppDetail = MarketplaceApp & {
  description: string;
  screenshots: readonly string[];
  websiteUrl?: string;
  latestAvailableVersion?: string;
};
