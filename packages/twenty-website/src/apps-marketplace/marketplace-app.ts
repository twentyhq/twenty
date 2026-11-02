export type MarketplaceApp = {
  universalIdentifier: string;
  slug: string;
  name: string;
  tagline: string;
  author: string;
  category: string;
  logoUrl?: string;
  sourcePackage?: string;
};

export type MarketplaceAppDetail = MarketplaceApp & {
  aboutDescription?: string;
  screenshots: readonly string[];
  websiteUrl?: string;
  latestAvailableVersion?: string;
};
