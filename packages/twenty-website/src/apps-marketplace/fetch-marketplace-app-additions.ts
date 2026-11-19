import { marketplaceGraphqlRequest } from './marketplace-api-fetch';

// PROTOTYPE (direction B, not for a PR as is): what the public API already
// exposes about an app and the site never asks for.
const CONTENT_ITEM_FIELDS = `{ label parentLabel }`;

const FIND_MARKETPLACE_APP_ADDITIONS_QUERY = `
  query PublicMarketplaceAppAdditions($universalIdentifier: String!) {
    publicMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      installCount
      termsUrl
      emailSupport
      issueReportUrl
      content {
        objects ${CONTENT_ITEM_FIELDS}
        fields ${CONTENT_ITEM_FIELDS}
        frontComponents ${CONTENT_ITEM_FIELDS}
        logicFunctions ${CONTENT_ITEM_FIELDS}
        agents ${CONTENT_ITEM_FIELDS}
        skills ${CONTENT_ITEM_FIELDS}
        workflows ${CONTENT_ITEM_FIELDS}
        views ${CONTENT_ITEM_FIELDS}
      }
    }
  }
`;

type ApiContentItem = { label: string; parentLabel?: string | null };

type ApiAdditions = {
  installCount: number;
  termsUrl?: string | null;
  emailSupport?: string | null;
  issueReportUrl?: string | null;
  content?: Record<string, ApiContentItem[]> | null;
};

export type MarketplaceAppAdditionKind =
  | 'objects'
  | 'fields'
  | 'frontComponents'
  | 'logicFunctions'
  | 'agents'
  | 'skills'
  | 'workflows'
  | 'views';

export type MarketplaceAppAddition = {
  kind: MarketplaceAppAdditionKind;
  labels: readonly string[];
  count: number;
};

export type MarketplaceAppAdditions = {
  installCount?: number;
  termsUrl?: string;
  emailSupport?: string;
  issueReportUrl?: string;
  additions: readonly MarketplaceAppAddition[];
};

const ADDITION_KINDS: readonly MarketplaceAppAdditionKind[] = [
  'objects',
  'fields',
  'frontComponents',
  'logicFunctions',
  'agents',
  'skills',
  'workflows',
  'views',
];

const summarizeFieldsByObject = (items: ApiContentItem[]): string[] => {
  const countByParent = new Map<string, number>();

  for (const item of items) {
    const parent = item.parentLabel ?? '';
    countByParent.set(parent, (countByParent.get(parent) ?? 0) + 1);
  }

  return [...countByParent.entries()]
    .filter(([parent]) => parent.length > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([parent, count]) => `${count} on ${parent}`);
};

export async function fetchMarketplaceAppAdditions(
  universalIdentifier: string,
): Promise<MarketplaceAppAdditions> {
  try {
    const data = await marketplaceGraphqlRequest<{
      publicMarketplaceAppDetail: ApiAdditions;
    }>(FIND_MARKETPLACE_APP_ADDITIONS_QUERY, { universalIdentifier });
    const detail = data.publicMarketplaceAppDetail;
    const content = detail.content ?? {};

    return {
      installCount: detail.installCount,
      termsUrl: detail.termsUrl ?? undefined,
      emailSupport: detail.emailSupport ?? undefined,
      issueReportUrl: detail.issueReportUrl ?? undefined,
      additions: ADDITION_KINDS.map((kind) => {
        const items = content[kind] ?? [];

        return {
          kind,
          count: items.length,
          labels:
            kind === 'fields' && summarizeFieldsByObject(items).length > 0
              ? summarizeFieldsByObject(items)
              : items.map((item) => item.label),
        };
      }).filter((addition) => addition.count > 0),
    };
  } catch (error) {
    console.error('[apps-marketplace] additions fetch failed:', error);

    return { additions: [] };
  }
}
