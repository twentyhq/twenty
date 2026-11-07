import { MCP_SERVER_OAUTH_PATH } from 'src/engine/metadata-modules/mcp-server/oauth/constants/mcp-server-oauth-path.constant';

export const buildMcpServerOAuthCallbackUrl = (serverUrl: string): string =>
  new URL(`/${MCP_SERVER_OAUTH_PATH}/callback`, serverUrl).toString();

export const buildMcpServerOAuthClientMetadataUrl = (
  serverUrl: string,
): string =>
  new URL(
    `/${MCP_SERVER_OAUTH_PATH}/client-metadata.json`,
    serverUrl,
  ).toString();
