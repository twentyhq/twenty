import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  auth,
  extractWWWAuthenticateParams,
  isHttpsUrl,
} from '@modelcontextprotocol/sdk/client/auth.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import { type OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import { randomBytes } from 'crypto';
import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import {
  ConnectedAccountEntity,
  type ConnectedAccountScope,
} from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatMcpServerByIdOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/find-flat-mcp-server-by-id-or-throw.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerOAuthClientService } from 'src/engine/metadata-modules/mcp-server/oauth/services/mcp-server-oauth-client.service';
import { type McpServerOAuthStoredClient } from 'src/engine/metadata-modules/mcp-server/oauth/types/mcp-server-oauth-stored-client.type';
import { type McpServerOAuthSession } from 'src/engine/metadata-modules/mcp-server/oauth/types/mcp-server-oauth-session.type';
import { buildMcpServerOAuthClientMetadata } from 'src/engine/metadata-modules/mcp-server/oauth/utils/build-mcp-server-oauth-client-metadata.util';
import {
  buildMcpServerOAuthCallbackUrl,
  buildMcpServerOAuthClientMetadataUrl,
} from 'src/engine/metadata-modules/mcp-server/oauth/utils/build-mcp-server-oauth-urls.util';
import { computeAccessTokenExpiresAt } from 'src/engine/metadata-modules/mcp-server/oauth/utils/compute-access-token-expires-at.util';
import { McpServerOAuthClientProvider } from 'src/engine/metadata-modules/mcp-server/oauth/utils/mcp-server-oauth-client-provider';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { buildMcpServerFetch } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-server-fetch.util';

const OAUTH_REQUEST_TIMEOUT_MS = 15_000;
const SESSION_TTL_MS = 10 * 60 * 1000;
const SESSION_KEY_PREFIX = 'mcp-server-oauth-session';

@Injectable()
export class McpServerOAuthFlowService {
  private readonly logger = new Logger(McpServerOAuthFlowService.name);

  constructor(
    private readonly appConnectionAccessService: AppConnectionAccessService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly mcpServerOAuthClientService: McpServerOAuthClientService,
    private readonly mcpServerToolSyncService: McpServerToolSyncService,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectCacheStorage(CacheStorageNamespace.EngineAuthSession)
    private readonly cacheStorage: CacheStorageService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async startAuthorization(
    session: Omit<McpServerOAuthSession, 'codeVerifier' | 'clientId'>,
  ): Promise<{ authorizationUrl: string }> {
    await this.assertCallerCanConnect(session);

    const mcpServer = await this.findMcpServerSigningInOrThrow(session);
    const fetchFn = this.buildFetch(session.workspaceId);
    const { resourceMetadataUrl, scope } = await this.probeAuthorizationOrThrow(
      {
        mcpServer,
        fetchFn,
      },
    );

    const state = randomBytes(32).toString('base64url');
    const storedClient =
      await this.mcpServerOAuthClientService.findStoredClient({
        mcpServerId: mcpServer.id,
        workspaceId: session.workspaceId,
      });
    const prepareAuthorization = ({
      storedClient,
      isClientIdMetadataDocumentAllowed,
    }: {
      storedClient: McpServerOAuthStoredClient | null;
      isClientIdMetadataDocumentAllowed: boolean;
    }) =>
      this.prepareAuthorizationOrThrow({
        mcpServer,
        fetchFn,
        resourceMetadataUrl,
        scope,
        provider: this.buildClientProvider({
          state,
          storedClient,
          shouldReuseStoredDiscoveryState: false,
          isClientIdMetadataDocumentAllowed,
        }),
      });

    const firstAttempt = await prepareAuthorization({
      storedClient,
      isClientIdMetadataDocumentAllowed: true,
    });

    // A server that forgot our client, or rejects our metadata document, would strand the user on its error page.
    const { clientToPersist, authorizationUrl, codeVerifier } =
      (await this.isClientRejectedByAuthorizationServer({
        authorizationUrl: firstAttempt.authorizationUrl,
        fetchFn,
      }))
        ? await prepareAuthorization({
            storedClient: null,
            isClientIdMetadataDocumentAllowed:
              firstAttempt.clientToPersist.registrationMethod !==
              'CLIENT_ID_METADATA_DOCUMENT',
          })
        : firstAttempt;

    await this.mcpServerOAuthClientService.saveClient({
      ...clientToPersist,
      mcpServerId: mcpServer.id,
      workspaceId: session.workspaceId,
      redirectUri: this.getRedirectUrl(),
    });

    await this.cacheStorage.set<McpServerOAuthSession>(
      this.getSessionKey(state),
      {
        ...session,
        codeVerifier,
        clientId: clientToPersist.clientInformation.client_id,
      },
      SESSION_TTL_MS,
    );

    return { authorizationUrl: authorizationUrl.toString() };
  }

  private async prepareAuthorizationOrThrow({
    mcpServer,
    fetchFn,
    resourceMetadataUrl,
    scope,
    provider,
  }: {
    mcpServer: FlatMcpServer;
    fetchFn: FetchLike;
    resourceMetadataUrl: URL | undefined;
    scope: string | undefined;
    provider: McpServerOAuthClientProvider;
  }) {
    await this.runSdkAuthOrThrow({
      mcpServer,
      run: () =>
        auth(provider, {
          serverUrl: mcpServer.url,
          resourceMetadataUrl,
          scope,
          fetchFn,
        }),
    });

    const clientToPersist = provider.getClientToPersist();

    if (
      !isDefined(provider.authorizationUrl) ||
      !isDefined(provider.savedCodeVerifier) ||
      !isDefined(clientToPersist)
    ) {
      throw new McpServerException(
        `MCP server ${mcpServer.id} did not start an authorization code flow`,
        McpServerExceptionCode.MCP_SERVER_SIGN_IN_FAILED,
      );
    }

    return {
      clientToPersist,
      authorizationUrl: provider.authorizationUrl,
      codeVerifier: provider.savedCodeVerifier,
    };
  }

  // Without a browser session the server answers with its login page, unless it does not know the client.
  private async isClientRejectedByAuthorizationServer({
    authorizationUrl,
    fetchFn,
  }: {
    authorizationUrl: URL;
    fetchFn: FetchLike;
  }): Promise<boolean> {
    try {
      const response = await fetchFn(authorizationUrl, {
        method: 'GET',
        redirect: 'manual',
      });

      await response.body?.cancel().catch(() => undefined);

      return response.status === 400 || response.status === 401;
    } catch {
      return false;
    }
  }

  // Single use, so a replayed callback finds nothing.
  async consumeSession(state: string): Promise<McpServerOAuthSession | null> {
    const sessionKey = this.getSessionKey(state);
    const session =
      await this.cacheStorage.get<McpServerOAuthSession>(sessionKey);

    await this.cacheStorage.del(sessionKey);

    return session ?? null;
  }

  async completeAuthorization({
    session,
    state,
    code,
  }: {
    session: McpServerOAuthSession;
    state: string;
    code: string;
  }): Promise<void> {
    await this.assertCallerCanConnect(session);

    const mcpServer = await this.findMcpServerSigningInOrThrow(session);
    const storedClient =
      await this.mcpServerOAuthClientService.findStoredClient({
        mcpServerId: mcpServer.id,
        workspaceId: session.workspaceId,
      });

    // Another sign-in re-registered the client while the user was away.
    if (storedClient?.clientInformation.client_id !== session.clientId) {
      throw new McpServerException(
        `OAuth client of MCP server ${mcpServer.id} changed during sign-in`,
        McpServerExceptionCode.MCP_SERVER_SIGN_IN_FAILED,
      );
    }

    const provider = this.buildClientProvider({
      state,
      storedClient,
      codeVerifier: session.codeVerifier,
      shouldReuseStoredDiscoveryState: true,
    });

    try {
      await this.runSdkAuthOrThrow({
        mcpServer,
        run: () =>
          auth(provider, {
            serverUrl: mcpServer.url,
            authorizationCode: code,
            fetchFn: this.buildFetch(session.workspaceId),
          }),
      });
    } finally {
      if (provider.isStoredClientInvalidated) {
        await this.mcpServerOAuthClientService.deleteClient({
          mcpServerId: mcpServer.id,
          workspaceId: session.workspaceId,
        });
      }
    }

    if (!isDefined(provider.savedTokens)) {
      throw new McpServerException(
        `MCP server ${mcpServer.id} returned no tokens`,
        McpServerExceptionCode.MCP_SERVER_SIGN_IN_FAILED,
      );
    }

    await this.saveConnectedAccount({
      session,
      mcpServer,
      tokens: provider.savedTokens,
    });

    // Not awaited: the user is waiting on the redirect, and a sync never throws.
    void this.mcpServerToolSyncService.syncTools({
      ...mcpServer,
      userWorkspaceId: session.userWorkspaceId,
    });
  }

  private async probeAuthorizationOrThrow({
    mcpServer,
    fetchFn,
  }: {
    mcpServer: FlatMcpServer;
    fetchFn: FetchLike;
  }): Promise<{ resourceMetadataUrl?: URL; scope?: string }> {
    const response = await fetchFn(mcpServer.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'ping',
      }),
    });

    await response.body?.cancel().catch(() => undefined);

    if (response.status !== 401) {
      throw new McpServerException(
        `MCP server ${mcpServer.id} answered ${response.status} without credentials`,
        McpServerExceptionCode.MCP_SERVER_SIGN_IN_NOT_AVAILABLE,
        {
          userFriendlyMessage: msg`This MCP server does not ask for sign-in.`,
        },
      );
    }

    const { resourceMetadataUrl, scope } =
      extractWWWAuthenticateParams(response);

    return { resourceMetadataUrl, scope };
  }

  private async runSdkAuthOrThrow({
    mcpServer,
    run,
  }: {
    mcpServer: FlatMcpServer;
    run: () => Promise<unknown>;
  }): Promise<void> {
    try {
      await run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `OAuth with MCP server ${mcpServer.id} in workspace ${mcpServer.workspaceId} failed: ${message}`,
      );

      throw new McpServerException(
        `OAuth with MCP server ${mcpServer.id} failed: ${message}`,
        McpServerExceptionCode.MCP_SERVER_SIGN_IN_FAILED,
      );
    }
  }

  private async saveConnectedAccount({
    session,
    mcpServer,
    tokens,
  }: {
    session: McpServerOAuthSession;
    mcpServer: FlatMcpServer;
    tokens: OAuthTokens;
  }): Promise<void> {
    const { workspaceId, userId, userWorkspaceId, scope } = session;

    const { encryptedAccessToken, encryptedRefreshToken } =
      this.connectedAccountTokenEncryptionService.encryptTokenPair({
        accessToken: tokens.access_token as PlaintextString,
        refreshToken: (tokens.refresh_token ?? null) as PlaintextString | null,
        workspaceId,
      });

    const credentials = {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      scopes: isDefined(tokens.scope) ? tokens.scope.split(' ') : null,
      lastCredentialsRefreshedAt: new Date(),
      accessTokenExpiresAt: computeAccessTokenExpiresAt({
        expiresInSeconds: tokens.expires_in,
        now: new Date(),
      }),
      authFailedAt: null,
      authFailedReason: null,
      archivedAt: null,
    };

    // Signing in again replaces the caller's account instead of adding one.
    const existingConnectedAccount =
      await this.connectedAccountRepository.findOneBy({
        workspaceId,
        mcpServerId: mcpServer.id,
        scope,
        ...(scope === 'USER' && { userWorkspaceId }),
      });

    if (isDefined(existingConnectedAccount)) {
      await this.connectedAccountRepository.update(
        { id: existingConnectedAccount.id, workspaceId },
        { ...credentials, userWorkspaceId },
      );

      return;
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    await this.connectedAccountRepository.save(
      this.connectedAccountRepository.create({
        ...credentials,
        workspaceId,
        userWorkspaceId,
        scope,
        mcpServerId: mcpServer.id,
        provider: ConnectedAccountProvider.MCP,
        handle: user?.email ?? mcpServer.label,
        name: mcpServer.label,
      }),
    );
  }

  private async assertCallerCanConnect({
    workspaceId,
    userWorkspaceId,
    scope,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    scope: ConnectedAccountScope;
  }): Promise<void> {
    await this.appConnectionAccessService.validateCallerCanManageConnection({
      isWorkspaceShared: scope === 'WORKSPACE',
      workspaceId,
      userWorkspaceId,
    });
  }

  private async findMcpServerSigningInOrThrow({
    mcpServerId,
    workspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
  }): Promise<FlatMcpServer> {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    const mcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps,
      mcpServerId,
    });

    if (isDefined(mcpServer.connectionProviderId)) {
      throw new McpServerException(
        `MCP server ${mcpServerId} authenticates through its connection provider`,
        McpServerExceptionCode.MCP_SERVER_SIGN_IN_NOT_AVAILABLE,
        {
          userFriendlyMessage: msg`This MCP server signs in through its connection provider.`,
        },
      );
    }

    return mcpServer;
  }

  private buildClientProvider({
    state,
    storedClient,
    codeVerifier,
    shouldReuseStoredDiscoveryState,
    isClientIdMetadataDocumentAllowed = true,
  }: Pick<
    ConstructorParameters<typeof McpServerOAuthClientProvider>[0],
    | 'state'
    | 'storedClient'
    | 'codeVerifier'
    | 'shouldReuseStoredDiscoveryState'
  > & {
    isClientIdMetadataDocumentAllowed?: boolean;
  }): McpServerOAuthClientProvider {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');
    const clientMetadataUrl = buildMcpServerOAuthClientMetadataUrl(serverUrl);

    return new McpServerOAuthClientProvider({
      redirectUrl: this.getRedirectUrl(),
      // An authorization server only fetches a metadata document over HTTPS.
      clientMetadataUrl:
        isClientIdMetadataDocumentAllowed && isHttpsUrl(clientMetadataUrl)
          ? clientMetadataUrl
          : undefined,
      clientMetadata: buildMcpServerOAuthClientMetadata(serverUrl),
      storedClient,
      state,
      codeVerifier,
      shouldReuseStoredDiscoveryState,
      now: new Date(),
    });
  }

  private buildFetch(workspaceId: string): FetchLike {
    return buildMcpServerFetch({
      secureHttpClientService: this.secureHttpClientService,
      workspaceId,
      timeoutMs: OAUTH_REQUEST_TIMEOUT_MS,
    });
  }

  private getRedirectUrl(): string {
    return buildMcpServerOAuthCallbackUrl(
      this.twentyConfigService.get('SERVER_URL'),
    );
  }

  private getSessionKey(state: string): string {
    return `${SESSION_KEY_PREFIX}:${state}`;
  }
}
