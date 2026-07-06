// RFC 9727 api-catalog: a machine-readable index of Twenty's API surfaces so
// tools and agents can discover them from one URL. Served as a route handler
// (not a public/ file) because the spec requires the application/linkset+json
// content type, which the site's global `nosniff` header would otherwise pin
// to the static handler's default. CORS is opened so browser-based discovery
// clients can read it.
//
// Twenty is multi-tenant: every API surface is workspace-scoped, so anchors
// use a `{your-workspace-url}` placeholder (a workspace host such as
// `mycompany.twenty.com` or a custom domain). The REST OpenAPI documents are
// generated per workspace and therefore live on the workspace host, not here.

const RFC_9727_PROFILE = 'https://www.rfc-editor.org/info/rfc9727';

const WORKSPACE = 'https://{your-workspace-url}';

const API_DOCS = 'https://docs.twenty.com/developers/extend/api';
const MCP_DOCS = 'https://docs.twenty.com/user-guide/ai/capabilities/mcp';

const apiCatalog = {
  linkset: [
    {
      anchor: `${WORKSPACE}/rest`,
      'service-desc': [
        {
          href: `${WORKSPACE}/rest/open-api/core`,
          type: 'application/json',
        },
      ],
      'service-doc': [{ href: API_DOCS, type: 'text/html' }],
      'service-meta': [
        {
          href: `${WORKSPACE}/.well-known/oauth-protected-resource`,
          type: 'application/json',
        },
      ],
    },
    {
      anchor: `${WORKSPACE}/rest/metadata`,
      'service-desc': [
        {
          href: `${WORKSPACE}/rest/open-api/metadata`,
          type: 'application/json',
        },
      ],
      'service-doc': [{ href: API_DOCS, type: 'text/html' }],
    },
    {
      anchor: `${WORKSPACE}/graphql`,
      'service-doc': [{ href: API_DOCS, type: 'text/html' }],
    },
    {
      anchor: `${WORKSPACE}/mcp`,
      'service-desc': [
        {
          href: 'https://twenty.com/.well-known/mcp/server-card.json',
          type: 'application/json',
        },
      ],
      'service-doc': [{ href: MCP_DOCS, type: 'text/html' }],
    },
  ],
};

// Static discovery document — no request-time data, so prerender it.
export const dynamic = 'force-static';

export async function GET() {
  return new Response(JSON.stringify(apiCatalog, null, 2), {
    headers: {
      'Content-Type': `application/linkset+json; profile="${RFC_9727_PROFILE}"`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
