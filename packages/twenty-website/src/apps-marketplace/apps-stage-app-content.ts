import { marketplaceGraphqlRequest } from './marketplace-api-fetch';

// What an app adds, grouped like the product's own
// app page (twenty-front ApplicationContentSections: Data, Interface,
// Automation and AI, Access), read from the public API before install.
export type AppsStageAppContentKind =
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

export type AppsStageAppContent = Partial<
  Record<AppsStageAppContentKind, readonly string[]>
>;

const KINDS: readonly AppsStageAppContentKind[] = [
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

const QUERY = `
  query AppsStageAppContent($universalIdentifier: String!) {
    publicMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      content { ${KINDS.map((kind) => `${kind} { label }`).join(' ')} }
    }
  }
`;

export async function fetchAppsStageAppContent(
  universalIdentifier: string,
): Promise<AppsStageAppContent> {
  try {
    const data = await marketplaceGraphqlRequest<{
      publicMarketplaceAppDetail: {
        content?: Partial<Record<AppsStageAppContentKind, { label: string }[]>>;
      };
    }>(QUERY, { universalIdentifier });
    const content = data.publicMarketplaceAppDetail.content ?? {};

    return Object.fromEntries(
      KINDS.map((kind) => [
        kind,
        (content[kind] ?? []).map((item) => item.label),
      ]),
    );
  } catch (error) {
    console.error('[apps-marketplace] content fetch failed:', error);

    return {};
  }
}
