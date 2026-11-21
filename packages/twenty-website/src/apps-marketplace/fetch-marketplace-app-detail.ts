import { fetchMarketplaceApps } from './fetch-marketplace-apps';
import { getAppSlug } from './get-app-slug';
import { marketplaceGraphqlRequest } from './marketplace-api-fetch';
import {
  type MarketplaceAppContent,
  type MarketplaceAppContentKind,
  type MarketplaceAppDetail,
} from './marketplace-app';

const CONTENT_KINDS: readonly MarketplaceAppContentKind[] = [
  'objects',
  'fields',
  'views',
  'frontComponents',
  'workflows',
  'logicFunctions',
  'agents',
  'skills',
  'roles',
  'connectionProviders',
];

const FIND_MARKETPLACE_APP_DETAIL_QUERY = `
  query PublicMarketplaceAppDetail($universalIdentifier: String!) {
    publicMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      universalIdentifier
      name
      sourcePackage
      latestAvailableVersion
      author
      category
      logoUrl
      websiteUrl
      aboutDescription
      galleryImages
      installCount
      termsUrl
      emailSupport
      issueReportUrl
      content { ${CONTENT_KINDS.map((kind) => `${kind} { label }`).join(' ')} }
    }
  }
`;

type ApiMarketplaceAppDetail = {
  universalIdentifier: string;
  name: string;
  sourcePackage?: string | null;
  latestAvailableVersion?: string | null;
  author?: string | null;
  category?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  aboutDescription?: string | null;
  galleryImages?: string[] | null;
  installCount?: number | null;
  termsUrl?: string | null;
  emailSupport?: string | null;
  issueReportUrl?: string | null;
  content?: Partial<
    Record<MarketplaceAppContentKind, { label: string }[] | null>
  > | null;
};

type FindMarketplaceAppDetailData = {
  publicMarketplaceAppDetail: ApiMarketplaceAppDetail;
};

const toContent = (
  content: ApiMarketplaceAppDetail['content'],
): MarketplaceAppContent =>
  Object.fromEntries(
    CONTENT_KINDS.map((kind) => [
      kind,
      (content?.[kind] ?? []).map((item) => item.label),
    ]),
  );

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
      logoUrl: detail.logoUrl ?? app.logoUrl,
      sourcePackage: detail.sourcePackage ?? undefined,
      aboutDescription: detail.aboutDescription ?? undefined,
      screenshots: detail.galleryImages ?? [],
      websiteUrl: detail.websiteUrl ?? undefined,
      latestAvailableVersion: detail.latestAvailableVersion ?? undefined,
      installCount: detail.installCount ?? undefined,
      termsUrl: detail.termsUrl ?? undefined,
      emailSupport: detail.emailSupport ?? undefined,
      issueReportUrl: detail.issueReportUrl ?? undefined,
      content: toContent(detail.content),
    };
  } catch (error) {
    // The catalogue entry still renders a usable page; the logged error is
    // what tells us the detail query broke.
    console.error('[apps-marketplace] detail fetch failed:', error);

    return {
      ...app,
      screenshots: [],
      content: {},
    };
  }
}
