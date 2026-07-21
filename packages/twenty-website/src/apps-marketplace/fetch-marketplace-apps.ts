import { getAppSlug } from './get-app-slug';
import { marketplaceGraphqlRequest } from './marketplace-api-fetch';
import { type MarketplaceApp } from './marketplace-app';

const FIND_MANY_MARKETPLACE_APPS_QUERY = `
  query PublicMarketplaceApps {
    publicMarketplaceApps {
      id
      name
      description
      author
      category
      logo
      sourcePackage
      isVetted
    }
  }
`;

type ApiMarketplaceApp = {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  logo?: string | null;
  sourcePackage?: string | null;
  isVetted: boolean;
};

type FindManyMarketplaceAppsData = {
  publicMarketplaceApps: ApiMarketplaceApp[];
};

const normalizeApp = (apiApp: ApiMarketplaceApp): MarketplaceApp => ({
  universalIdentifier: apiApp.id,
  slug: getAppSlug(apiApp.sourcePackage ?? undefined, apiApp.id),
  name: apiApp.name,
  tagline: apiApp.description,
  author: apiApp.author,
  category: apiApp.category,
  logoUrl: apiApp.logo ?? undefined,
  sourcePackage: apiApp.sourcePackage ?? undefined,
  isVetted: apiApp.isVetted,
});

export async function fetchMarketplaceApps(): Promise<
  readonly MarketplaceApp[]
> {
  try {
    const data = await marketplaceGraphqlRequest<FindManyMarketplaceAppsData>(
      FIND_MANY_MARKETPLACE_APPS_QUERY,
    );

    if (!Array.isArray(data.publicMarketplaceApps)) {
      throw new Error('marketplace API response missing apps array');
    }

    return data.publicMarketplaceApps.map(normalizeApp);
  } catch (error) {
    console.error('[apps-marketplace] live fetch failed:', error);

    return [];
  }
}
