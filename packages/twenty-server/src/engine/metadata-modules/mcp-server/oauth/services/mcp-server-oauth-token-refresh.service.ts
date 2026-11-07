import { Injectable, Logger } from '@nestjs/common';

import { refreshAuthorization } from '@modelcontextprotocol/sdk/client/auth.js';
import {
  InvalidClientError,
  OAuthError,
  ServerError,
  TemporarilyUnavailableError,
  TooManyRequestsError,
  UnauthorizedClientError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { isDefined } from 'twenty-shared/utils';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { McpServerOAuthClientService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-oauth-client.service';
import { type McpServerOAuthRefreshedTokens } from 'src/engine/metadata-modules/mcp-server/oauth/types/mcp-server-oauth-refreshed-tokens.type';
import { computeAccessTokenExpiresAt } from 'src/engine/metadata-modules/mcp-server/oauth/utils/compute-access-token-expires-at.util';
import { buildMcpServerFetch } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-fetch.util';

const TOKEN_REFRESH_TIMEOUT_MS = 15_000;

@Injectable()
export class McpServerOAuthTokenRefreshService {
  private readonly logger = new Logger(McpServerOAuthTokenRefreshService.name);

  constructor(
    private readonly mcpServerOAuthClientService: McpServerOAuthClientService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async refreshTokens(
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'id' | 'workspaceId' | 'mcpServerId'
    >,
    refreshToken: PlaintextString,
  ): Promise<McpServerOAuthRefreshedTokens> {
    const { id, workspaceId, mcpServerId } = connectedAccount;

    const storedClient = isDefined(mcpServerId)
      ? await this.mcpServerOAuthClientService.findStoredClient({
          mcpServerId,
          workspaceId,
        })
      : null;

    if (!isDefined(mcpServerId) || !isDefined(storedClient)) {
      throw new ConnectedAccountRefreshAccessTokenException(
        `MCP server OAuth client of connected account ${id} is gone`,
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );
    }

    const {
      authorizationServerUrl,
      authorizationServerMetadata,
      resourceMetadata,
    } = storedClient.discoveryState;

    try {
      const tokens = await refreshAuthorization(authorizationServerUrl, {
        metadata: authorizationServerMetadata,
        clientInformation: storedClient.clientInformation,
        refreshToken,
        resource: isDefined(resourceMetadata)
          ? new URL(resourceMetadata.resource)
          : undefined,
        fetchFn: buildMcpServerFetch({
          secureHttpClientService: this.secureHttpClientService,
          workspaceId,
          timeoutMs: TOKEN_REFRESH_TIMEOUT_MS,
        }),
      });

      return {
        accessToken: tokens.access_token as PlaintextString,
        refreshToken: (tokens.refresh_token ?? refreshToken) as PlaintextString,
        accessTokenExpiresAt: computeAccessTokenExpiresAt({
          expiresInSeconds: tokens.expires_in,
          now: new Date(),
        }),
      };
    } catch (error) {
      this.logger.warn(
        `MCP server token refresh failed for connected account ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );

      // The authorization server forgot the client: the next sign-in registers a new one.
      if (
        error instanceof InvalidClientError ||
        error instanceof UnauthorizedClientError
      ) {
        await this.mcpServerOAuthClientService.deleteClient({
          mcpServerId,
          workspaceId,
        });
      }

      throw new ConnectedAccountRefreshAccessTokenException(
        `MCP server token refresh failed: ${error instanceof Error ? error.message : String(error)}`,
        this.isTransient(error)
          ? ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR
          : ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );
    }
  }

  private isTransient(error: unknown): boolean {
    return (
      !(error instanceof OAuthError) ||
      error instanceof ServerError ||
      error instanceof TemporarilyUnavailableError ||
      error instanceof TooManyRequestsError
    );
  }
}
