import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  StreamableHTTPClientTransport,
  StreamableHTTPError,
} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  type CallToolResult,
  CallToolResultSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { buildSecureFetchLike } from 'src/engine/core-modules/secure-http-client/utils/build-secure-fetch-like.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

const MCP_CLIENT_INFO = { name: 'twenty', version: '1.0.0' };
const LIST_TOOLS_TIMEOUT_MS = 20_000;
const CALL_TOOL_TIMEOUT_MS = 60_000;
const LIST_TOOLS_MAX_PAGES = 10;
const SIGN_IN_PROBE_TIMEOUT_MS = 5_000;
// Waiters outlast a refresh that discovers the authorization server and then exchanges the token, 15 s each.
const CONNECTED_ACCOUNT_REFRESH_LOCK_OPTIONS = { ms: 250, maxRetries: 120 };
const UNRECOVERABLE_REFRESH_CODES: ConnectedAccountRefreshAccessTokenExceptionCode[] =
  [
    ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
    ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
  ];

const isUnauthorizedError = (error: unknown): boolean =>
  error instanceof StreamableHTTPError && error.code === 401;

// Lands in toolsSyncError, which settings show as is.
const buildSignInRequiredException = (): McpServerException =>
  new McpServerException(
    'This MCP server requires signing in. Connect an account to use it.',
    McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
  );

type McpServerTarget = Pick<
  FlatMcpServer,
  'url' | 'connectionProviderId' | 'workspaceId'
> & { userWorkspaceId?: string };

@Injectable()
export class McpServerClientService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly cacheLockService: CacheLockService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  // One deadline spans the handshake and every page: the sync runs inside a mutation.
  async listTools({
    target,
    timeoutMs = LIST_TOOLS_TIMEOUT_MS,
  }: {
    target: McpServerTarget;
    timeoutMs?: number;
  }): Promise<Tool[]> {
    return this.withConnectedClient({
      target,
      timeoutMs,
      run: ({ client, signal }) => this.listToolPages({ client, signal }),
    });
  }

  async callTool({
    target,
    toolName,
    toolArguments,
  }: {
    target: McpServerTarget;
    toolName: string;
    toolArguments: Record<string, unknown>;
  }): Promise<CallToolResult> {
    return this.withConnectedClient({
      target,
      timeoutMs: CALL_TOOL_TIMEOUT_MS,
      run: ({ client, signal }) =>
        client.request(
          {
            method: 'tools/call',
            params: { name: toolName, arguments: toolArguments },
          },
          CallToolResultSchema,
          { signal },
        ),
    });
  }

  private async withConnectedClient<TResult>({
    target,
    timeoutMs,
    run,
  }: {
    target: McpServerTarget;
    timeoutMs: number;
    run: (connection: {
      client: Client;
      signal: AbortSignal;
    }) => Promise<TResult>;
  }): Promise<TResult> {
    const { workspaceId } = target;
    const connectedAccount = await this.findConnectedAccountOrThrow(target);
    const accessToken = isDefined(connectedAccount)
      ? await this.resolveAccessTokenOrMarkAuthFailed({
          connectedAccount,
          workspaceId,
        })
      : undefined;

    try {
      return await this.connectAndRun({ target, timeoutMs, run, accessToken });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }

      if (!isDefined(connectedAccount)) {
        throw buildSignInRequiredException();
      }
    }

    // The server may stop honoring a token before its assumed expiry; one refresh tells a stale token from a revoked account.
    const refreshedAccessToken = await this.resolveAccessTokenOrMarkAuthFailed({
      connectedAccount,
      workspaceId,
      shouldForceRefresh: true,
    });

    try {
      return await this.connectAndRun({
        target,
        timeoutMs,
        run,
        accessToken: refreshedAccessToken,
      });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }

      // A revoked token would otherwise keep being picked ahead of a fresh connection
      await this.markConnectedAccountAuthFailed({
        connectedAccountId: connectedAccount.id,
        workspaceId,
        reason: 'The MCP server rejected the access token',
      });

      throw buildSignInRequiredException();
    }
  }

  private async connectAndRun<TResult>({
    target,
    timeoutMs,
    run,
    accessToken,
  }: {
    target: McpServerTarget;
    timeoutMs: number;
    run: (connection: {
      client: Client;
      signal: AbortSignal;
    }) => Promise<TResult>;
    accessToken?: string;
  }): Promise<TResult> {
    const signal = AbortSignal.timeout(timeoutMs);
    const client = new Client(MCP_CLIENT_INFO);
    const transport = new StreamableHTTPClientTransport(new URL(target.url), {
      fetch: buildSecureFetchLike({
        secureHttpClientService: this.secureHttpClientService,
        context: { workspaceId: target.workspaceId, source: 'mcp-server' },
        timeoutMs,
      }),
      requestInit: isDefined(accessToken)
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    });

    try {
      await client.connect(transport, { signal });

      return await run({ client, signal });
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  private async listToolPages({
    client,
    signal,
    cursor,
    pageIndex = 0,
  }: {
    client: Client;
    signal: AbortSignal;
    cursor?: string;
    pageIndex?: number;
  }): Promise<Tool[]> {
    if (pageIndex >= LIST_TOOLS_MAX_PAGES) {
      throw new McpServerException(
        `MCP server returned more than ${LIST_TOOLS_MAX_PAGES} pages of tools`,
        McpServerExceptionCode.MCP_SERVER_TOOL_LIST_TOO_LARGE,
      );
    }

    const page = await client.listTools({ cursor }, { signal });

    if (!isDefined(page.nextCursor)) {
      return page.tools;
    }

    const nextPages = await this.listToolPages({
      client,
      signal,
      cursor: page.nextCursor,
      pageIndex: pageIndex + 1,
    });

    return [...page.tools, ...nextPages];
  }

  // An unauthenticated request answered with 401 means the server wants its own sign-in.
  async requiresSignIn({
    url,
    workspaceId,
  }: Pick<McpServerTarget, 'url' | 'workspaceId'>): Promise<boolean> {
    const fetchFn = this.buildFetch({
      workspaceId,
      timeoutMs: SIGN_IN_PROBE_TIMEOUT_MS,
    });

    try {
      const response = await fetchFn(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping' }),
      });

      await response.body?.cancel().catch(() => undefined);

      return response.status === 401;
    } catch {
      return false;
    }
>>>>>>> 52481aa5b83 (Sign in to MCP servers through an oauth-discovery connection provider)
  }

  private buildFetch({
    workspaceId,
    timeoutMs,
  }: {
    workspaceId: string;
    timeoutMs: number;
  }): FetchLike {
    return this.secureHttpClientService.createFetchLike({
      context: { workspaceId, source: 'mcp-server' },
      timeoutMs,
    });
  }

  async canCallerConnect(target: McpServerTarget): Promise<boolean> {
    return (
      !isDefined(target.connectionProviderId) ||
      isDefined(await this.findUsableConnectedAccount(target))
    );
  }

  private async findUsableConnectedAccount({
    connectionProviderId,
    workspaceId,
    userWorkspaceId,
  }: McpServerTarget): Promise<ConnectedAccountEntity | null> {
    if (!isDefined(connectionProviderId)) {
      return null;
    }

    const baseWhere = {
      workspaceId,
      connectionProviderId,
      archivedAt: IsNull(),
      authFailedAt: IsNull(),
    };

    const connectedAccounts = await this.connectedAccountRepository.find({
      where: isDefined(userWorkspaceId)
        ? buildConnectedAccountUsableByCallerWhere({
            baseWhere,
            userWorkspaceId,
          })
        : { ...baseWhere, scope: 'WORKSPACE' },
      order: { createdAt: 'ASC' },
    });

    return (
      connectedAccounts.find(
        (connectedAccount) =>
          connectedAccount.userWorkspaceId === userWorkspaceId,
      ) ??
      connectedAccounts[0] ??
      null
    );
  }

  private async findConnectedAccountOrThrow(
    target: McpServerTarget,
  ): Promise<ConnectedAccountEntity | null> {
    const { connectionProviderId, workspaceId } = target;

    if (!isDefined(connectionProviderId)) {
      return null;
    }

    const connectedAccount = await this.findUsableConnectedAccount(target);

    if (!isDefined(connectedAccount)) {
      throw new McpServerException(
        `No connected account usable by the caller for provider ${connectionProviderId} in workspace ${workspaceId}`,
        McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
      );
    }

    return connectedAccount;
  }

  private async markConnectedAccountAuthFailed({
    connectedAccountId,
    workspaceId,
    reason,
  }: {
    connectedAccountId: string;
    workspaceId: string;
    reason: string;
  }): Promise<void> {
    await this.connectedAccountRepository.update(
      { id: connectedAccountId, workspaceId },
      { authFailedAt: new Date(), authFailedReason: reason },
    );
  }

  // No app logic reports failures for these accounts, so a rejected refresh is flagged here
  // and the member is asked to sign in again instead of the account being retried forever.
  private async resolveAccessTokenOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
    shouldForceRefresh = false,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    shouldForceRefresh?: boolean;
  }): Promise<string> {
    const { accessToken } =
      !shouldForceRefresh &&
      (await this.connectedAccountRefreshTokensService.isAccessTokenStillValid(
        connectedAccount,
      ))
        ? await this.connectedAccountRefreshTokensService.resolveTokens(
            connectedAccount,
            workspaceId,
          )
        : await this.refreshTokensOrMarkAuthFailed({
            connectedAccount,
            workspaceId,
            shouldForceRefresh,
          });

    return this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: accessToken,
      workspaceId,
    });
  }

  // Refresh tokens rotate: the later of two concurrent refreshes must reuse the first one's tokens, not burn the consumed one.
  private async refreshTokensOrMarkAuthFailed({
    connectedAccount,
    workspaceId,
    shouldForceRefresh,
  }: {
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
    shouldForceRefresh: boolean;
  }) {
    return this.cacheLockService.withLock(
      async () => {
        const latestConnectedAccount =
          (await this.connectedAccountRepository.findOneBy({
            id: connectedAccount.id,
            workspaceId,
          })) ?? connectedAccount;
        const isAlreadyRefreshed =
          latestConnectedAccount.lastCredentialsRefreshedAt?.getTime() !==
          connectedAccount.lastCredentialsRefreshedAt?.getTime();

        try {
          return shouldForceRefresh && !isAlreadyRefreshed
            ? await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
                latestConnectedAccount,
                workspaceId,
              )
            : await this.connectedAccountRefreshTokensService.resolveTokens(
                latestConnectedAccount,
                workspaceId,
              );
        } catch (error) {
          if (
            !(error instanceof ConnectedAccountRefreshAccessTokenException) ||
            !UNRECOVERABLE_REFRESH_CODES.includes(error.code)
          ) {
            throw error;
          }

          await this.markConnectedAccountAuthFailed({
            connectedAccountId: connectedAccount.id,
            workspaceId,
            reason: error.message,
          });

          throw new McpServerException(
            'The connected account for this MCP server was signed out. Sign in again to use it.',
            McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
          );
        }
      },
      `mcp-server-connected-account-refresh:${workspaceId}:${connectedAccount.id}`,
      CONNECTED_ACCOUNT_REFRESH_LOCK_OPTIONS,
    );
  }
}
