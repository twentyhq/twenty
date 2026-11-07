import {
  type OAuthClientProvider,
  type OAuthDiscoveryState,
} from '@modelcontextprotocol/sdk/client/auth.js';
import {
  type OAuthClientInformationMixed,
  type OAuthClientMetadata,
  type OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import { isDefined } from 'twenty-shared/utils';

import { type McpServerOAuthStoredClient } from 'src/engine/metadata-modules/mcp-server/oauth/types/mcp-server-oauth-stored-client.type';
import { type McpServerOAuthRegistrationMethod } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-oauth-registration-method.type';

type McpServerOAuthClientProviderOptions = {
  redirectUrl: string;
  clientMetadataUrl: string | undefined;
  clientMetadata: OAuthClientMetadata;
  storedClient: McpServerOAuthStoredClient | null;
  state: string;
  codeVerifier?: string;
  // The authorize step discovers afresh; the callback reuses what it found.
  shouldReuseStoredDiscoveryState: boolean;
  now: Date;
};

// Lets the MCP SDK run discovery, client registration and the code exchange
// while Twenty decides what is persisted, once the SDK is done.
export class McpServerOAuthClientProvider implements OAuthClientProvider {
  authorizationUrl: URL | undefined;
  savedCodeVerifier: string | undefined;
  savedTokens: OAuthTokens | undefined;
  isStoredClientInvalidated = false;

  private registeredClientInformation: OAuthClientInformationMixed | undefined;
  private discoveredState: OAuthDiscoveryState | undefined;
  private isStoredDiscoveryStateInvalidated = false;

  constructor(private readonly options: McpServerOAuthClientProviderOptions) {}

  get redirectUrl(): string {
    return this.options.redirectUrl;
  }

  get clientMetadataUrl(): string | undefined {
    return this.options.clientMetadataUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return this.options.clientMetadata;
  }

  state(): string {
    return this.options.state;
  }

  clientInformation(): OAuthClientInformationMixed | undefined {
    if (isDefined(this.registeredClientInformation)) {
      return this.registeredClientInformation;
    }

    if (this.isStoredClientInvalidated) {
      return undefined;
    }

    return this.isStoredClientUsable()
      ? this.options.storedClient?.clientInformation
      : undefined;
  }

  saveClientInformation(clientInformation: OAuthClientInformationMixed): void {
    this.registeredClientInformation = clientInformation;
  }

  // Connecting always asks the user; refreshing happens outside the SDK flow.
  tokens(): undefined {
    return undefined;
  }

  saveTokens(tokens: OAuthTokens): void {
    this.savedTokens = tokens;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this.authorizationUrl = authorizationUrl;
  }

  saveCodeVerifier(codeVerifier: string): void {
    this.savedCodeVerifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!isDefined(this.options.codeVerifier)) {
      throw new Error('No PKCE code verifier for this MCP server sign-in');
    }

    return this.options.codeVerifier;
  }

  invalidateCredentials(
    scope: 'all' | 'client' | 'tokens' | 'verifier' | 'discovery',
  ): void {
    if (scope === 'all' || scope === 'client') {
      this.isStoredClientInvalidated = true;
      this.registeredClientInformation = undefined;
    }

    if (scope === 'all' || scope === 'discovery') {
      this.isStoredDiscoveryStateInvalidated = true;
      this.discoveredState = undefined;
    }
  }

  saveDiscoveryState(discoveryState: OAuthDiscoveryState): void {
    this.discoveredState = discoveryState;
  }

  discoveryState(): OAuthDiscoveryState | undefined {
    if (isDefined(this.discoveredState)) {
      return this.discoveredState;
    }

    return this.options.shouldReuseStoredDiscoveryState &&
      !this.isStoredDiscoveryStateInvalidated
      ? this.options.storedClient?.discoveryState
      : undefined;
  }

  // What the SDK settled on, to persist once the flow step succeeded.
  getClientToPersist(): Omit<McpServerOAuthStoredClient, 'redirectUri'> | null {
    const clientInformation = this.clientInformation();
    const discoveryState = this.discoveryState();

    if (!isDefined(clientInformation) || !isDefined(discoveryState)) {
      return null;
    }

    return {
      registrationMethod: this.getRegistrationMethod(clientInformation),
      discoveryState,
      clientInformation: {
        redirect_uris: [this.options.redirectUrl],
        ...clientInformation,
      },
    };
  }

  private getRegistrationMethod(
    clientInformation: OAuthClientInformationMixed,
  ): McpServerOAuthRegistrationMethod {
    return clientInformation.client_id === this.options.clientMetadataUrl
      ? 'CLIENT_ID_METADATA_DOCUMENT'
      : 'DYNAMIC_CLIENT_REGISTRATION';
  }

  private isStoredClientUsable(): boolean {
    const { storedClient, redirectUrl, clientMetadataUrl, now } = this.options;

    if (!isDefined(storedClient) || storedClient.redirectUri !== redirectUrl) {
      return false;
    }

    const currentAuthorizationServerUrl =
      this.discoveryState()?.authorizationServerUrl;

    if (
      currentAuthorizationServerUrl !==
      storedClient.discoveryState.authorizationServerUrl
    ) {
      return false;
    }

    if (storedClient.registrationMethod === 'CLIENT_ID_METADATA_DOCUMENT') {
      return storedClient.clientInformation.client_id === clientMetadataUrl;
    }

    const secretExpiresAt =
      storedClient.clientInformation.client_secret_expires_at;

    return (
      !isDefined(secretExpiresAt) ||
      secretExpiresAt === 0 ||
      secretExpiresAt * 1000 > now.getTime()
    );
  }
}
