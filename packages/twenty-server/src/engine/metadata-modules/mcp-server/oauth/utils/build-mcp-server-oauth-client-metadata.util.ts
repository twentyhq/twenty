import { type OAuthClientMetadata } from '@modelcontextprotocol/sdk/shared/auth.js';

import { buildMcpServerOAuthCallbackUrl } from 'src/engine/metadata-modules/mcp-server/oauth/utils/build-mcp-server-oauth-urls.util';

const TWENTY_WEBSITE_URL = 'https://twenty.com';

// A public client: PKCE protects the code exchange, so there is no secret to leak.
export const buildMcpServerOAuthClientMetadata = (
  serverUrl: string,
): OAuthClientMetadata => ({
  client_name: 'Twenty',
  client_uri: TWENTY_WEBSITE_URL,
  redirect_uris: [buildMcpServerOAuthCallbackUrl(serverUrl)],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
});
