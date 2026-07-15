import { fetchMarketplaceApps } from './fetch-marketplace-apps';
import { getAppSlug } from './get-app-slug';
import { marketplaceGraphqlRequest } from './marketplace-api-fetch';
import { type MarketplaceAppDetail } from './marketplace-app';

const FIND_MARKETPLACE_APP_DETAIL_QUERY = `
  query PublicMarketplaceAppDetail($universalIdentifier: String!) {
    publicMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      universalIdentifier
      name
      sourcePackage
      latestAvailableVersion
      isVetted
      description
      author
      category
      logo
      websiteUrl
      aboutDescription
      screenshots
    }
  }
`;

type ApiMarketplaceAppDetail = {
  universalIdentifier: string;
  name: string;
  sourcePackage?: string | null;
  latestAvailableVersion?: string | null;
  isVetted: boolean;
  description?: string | null;
  author?: string | null;
  category?: string | null;
  logo?: string | null;
  websiteUrl?: string | null;
  aboutDescription?: string | null;
  screenshots?: string[] | null;
};

type FindMarketplaceAppDetailData = {
  publicMarketplaceAppDetail: ApiMarketplaceAppDetail;
};

export async function fetchMarketplaceAppDetailBySlug(
  slug: string,
): Promise<MarketplaceAppDetail | null> {
  const apps = await fetchMarketplaceApps();
  const app = apps.find((candidate) => candidate.slug === slug);

  if (app === undefined) {
    return null;
  }

  try {
    const data = await marketplaceGraphqlRequest<FindMarketplaceAppDetailData>(
      FIND_MARKETPLACE_APP_DETAIL_QUERY,
      { universalIdentifier: app.universalIdentifier },
    );

    const detail = data.publicMarketplaceAppDetail;

    return {
      universalIdentifier: detail.universalIdentifier,
      slug: getAppSlug(
        detail.sourcePackage ?? undefined,
        detail.universalIdentifier,
      ),
      name: detail.name,
      tagline: app.tagline,
      author: detail.author ?? app.author,
      category: detail.category ?? app.category,
      logoUrl: detail.logo ?? app.logoUrl,
      sourcePackage: detail.sourcePackage ?? undefined,
      isVetted: detail.isVetted,
      description: detail.aboutDescription ?? detail.description ?? app.tagline,
      screenshots: detail.screenshots ?? [],
      websiteUrl: detail.websiteUrl ?? undefined,
      latestAvailableVersion: detail.latestAvailableVersion ?? undefined,
    };
  } catch (error) {
    console.error('[apps-marketplace] detail fetch failed:', error);

    return {
      ...app,
      description: app.tagline,
      screenshots: [],
    };
  }
}
