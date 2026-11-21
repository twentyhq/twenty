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

export type MarketplaceAppContentKind =
  | 'objects'
  | 'fields'
  | 'views'
  | 'frontComponents'
  | 'workflows'
  | 'logicFunctions'
  | 'agents'
  | 'skills'
  | 'roles'
  | 'connectionProviders';

// Labels of what the app adds, by kind.
export type MarketplaceAppContent = Partial<
  Record<MarketplaceAppContentKind, readonly string[]>
>;

export type MarketplaceAppDetail = MarketplaceApp & {
  aboutDescription?: string;
  screenshots: readonly string[];
  websiteUrl?: string;
  latestAvailableVersion?: string;
  installCount?: number;
  termsUrl?: string;
  emailSupport?: string;
  issueReportUrl?: string;
  content: MarketplaceAppContent;
};
