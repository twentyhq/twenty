import { SITE_URLS } from '@/platform/site-urls';

// Route handler (not a public/ file) so the RFC 9727 application/linkset+json
// content type survives the site's global nosniff header.
//
// Twenty is multi-tenant, so anchors use a `{your-workspace-url}` placeholder
// (a workspace host such as `mycompany.twenty.com` or a custom domain).

const WORKSPACE = 'https://{your-workspace-url}';

const apiCatalog = {
  linkset: [
    {
      anchor: `${WORKSPACE}/rest`,
      'service-desc': [
        { href: `${WORKSPACE}/rest/open-api/core`, type: 'application/json' },
      ],
      'service-doc': [{ href: SITE_URLS.docsApi, type: 'text/html' }],
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
      'service-doc': [{ href: SITE_URLS.docsApi, type: 'text/html' }],
    },
    {
      anchor: `${WORKSPACE}/graphql`,
      'service-doc': [{ href: SITE_URLS.docsApi, type: 'text/html' }],
    },
    {
      anchor: `${WORKSPACE}/mcp`,
      'service-desc': [
        {
          href: 'https://twenty.com/.well-known/mcp/server-card.json',
          type: 'application/json',
        },
      ],
      'service-doc': [{ href: SITE_URLS.docsMcp, type: 'text/html' }],
    },
  ],
};

export const dynamic = 'force-static';

export async function GET() {
  return new Response(JSON.stringify(apiCatalog, null, 2), {
    headers: {
      'Content-Type':
        'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
