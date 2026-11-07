import { type OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js';
import { type OAuthClientInformationFull } from '@modelcontextprotocol/sdk/shared/auth.js';

import { type McpServerOAuthRegistrationMethod } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-oauth-registration-method.type';

export type McpServerOAuthStoredClient = {
  registrationMethod: McpServerOAuthRegistrationMethod;
  redirectUri: string;
  discoveryState: OAuthDiscoveryState;
  clientInformation: OAuthClientInformationFull;
};
