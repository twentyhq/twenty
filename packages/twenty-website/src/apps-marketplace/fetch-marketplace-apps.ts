import { getAppSlug } from './get-app-slug';
import { isGeneratedCover } from './is-generated-cover';
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
      logoUrl
      sourcePackage
    }
  }
`;

type ApiMarketplaceApp = {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  logoUrl?: string | null;
  sourcePackage?: string | null;
};

// The list query has no gallery field, so each app's first image comes from
// its detail query. Cached like every marketplace request.
const FIND_MARKETPLACE_APP_COVER_QUERY = `
  query PublicMarketplaceAppCover($universalIdentifier: String!) {
    publicMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      galleryImages
    }
  }
`;

type FindMarketplaceAppCoverData = {
  publicMarketplaceAppDetail: { galleryImages?: string[] | null };
};

// A missing cover is not an outage: the card falls back to the default band.
const fetchCoverUrl = async (
  universalIdentifier: string,
): Promise<string | undefined> => {
  try {
    const data = await marketplaceGraphqlRequest<FindMarketplaceAppCoverData>(
      FIND_MARKETPLACE_APP_COVER_QUERY,
      { universalIdentifier },
    );

    return (data.publicMarketplaceAppDetail.galleryImages ?? []).find(
      (url) => !isGeneratedCover(url),
    );
  } catch {
    return undefined;
  }
};

type FindManyMarketplaceAppsData = {
  publicMarketplaceApps: ApiMarketplaceApp[];
};

const normalizeApp = (
  apiApp: ApiMarketplaceApp,
  coverUrl: string | undefined,
): MarketplaceApp => ({
  universalIdentifier: apiApp.id,
  slug: getAppSlug(apiApp.sourcePackage ?? undefined, apiApp.id),
  name: apiApp.name,
  tagline: apiApp.description,
  author: apiApp.author,
  category: apiApp.category,
  logoUrl: apiApp.logoUrl ?? undefined,
  sourcePackage: apiApp.sourcePackage ?? undefined,
  coverUrl,
});

// Throws when the marketplace API is unreachable or shapeless: an outage must
// not read as an empty catalog, or every app page turns into a 404.
export async function fetchMarketplaceApps(): Promise<
  readonly MarketplaceApp[]
> {
  const data = await marketplaceGraphqlRequest<FindManyMarketplaceAppsData>(
    FIND_MANY_MARKETPLACE_APPS_QUERY,
  );

  if (!Array.isArray(data.publicMarketplaceApps)) {
    throw new Error('marketplace API response missing apps array');
  }

  const coverUrls = await Promise.all(
    data.publicMarketplaceApps.map((apiApp) => fetchCoverUrl(apiApp.id)),
  );

  return data.publicMarketplaceApps.map((apiApp, index) =>
    normalizeApp(apiApp, coverUrls[index]),
  );
}
