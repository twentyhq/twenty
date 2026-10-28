import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import { type Tool } from '@modelcontextprotocol/sdk/types.js';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

const MCP_CLIENT_INFO = { name: 'twenty', version: '1.0.0' };
const LIST_TOOLS_TIMEOUT_MS = 20_000;
const LIST_TOOLS_MAX_PAGES = 10;

type McpServerTarget = Pick<
  FlatMcpServer,
  'url' | 'connectionProviderId' | 'workspaceId'
> & { userWorkspaceId?: string | null };

@Injectable()
export class McpServerClientService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  // One deadline spans the handshake and every page: the sync runs inside a mutation.
  async listTools(target: McpServerTarget): Promise<Tool[]> {
    const signal = AbortSignal.timeout(LIST_TOOLS_TIMEOUT_MS);
    const accessToken = await this.resolveAccessToken(target);
    const client = new Client(MCP_CLIENT_INFO);
    const transport = new StreamableHTTPClientTransport(new URL(target.url), {
      fetch: this.buildFetch(target.workspaceId),
      requestInit: isDefined(accessToken)
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    });

    try {
      await client.connect(transport, { signal });

      return await this.listToolPages({ client, signal });
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

  // The SDK reads SSE from a WHATWG Response, which the axios client yields whatever globalThis.fetch is.
  private buildFetch(workspaceId: string): FetchLike {
    const axiosFetch = buildAxiosFetch(
      this.secureHttpClientService.getHttpClient(
        { timeout: LIST_TOOLS_TIMEOUT_MS },
        { workspaceId, source: 'mcp-server' },
      ),
    );

    return (url, init) => axiosFetch(url.toString(), init);
  }

  // The account is picked at call time from the provider's scope: the
  // workspace's shared account, or the caller's own, never the other one.
  private async resolveAccessToken({
    connectionProviderId,
    workspaceId,
    userWorkspaceId,
  }: McpServerTarget): Promise<string | null> {
    if (!isDefined(connectionProviderId)) {
      return null;
    }

    const { flatConnectionProviderMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatConnectionProviderMaps'] },
      );
    const connectionProvider = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: connectionProviderId,
      flatEntityMaps: flatConnectionProviderMaps,
    });

    if (!isDefined(connectionProvider)) {
      throw new McpServerException(
        `Connection provider ${connectionProviderId} not found in workspace ${workspaceId}`,
        McpServerExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
      );
    }

    if (connectionProvider.scope === 'USER' && !isDefined(userWorkspaceId)) {
      throw new McpServerException(
        `MCP server with a user-scoped provider needs a caller to pick the account`,
        McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
      );
    }

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: {
        workspaceId,
        connectionProviderId,
        scope: connectionProvider.scope,
        archivedAt: IsNull(),
        authFailedAt: IsNull(),
        ...(connectionProvider.scope === 'USER' && {
          userWorkspaceId: userWorkspaceId ?? undefined,
        }),
      },
      order: { createdAt: 'ASC' },
    });

    if (!isDefined(connectedAccount)) {
      throw new McpServerException(
        `No connected account for provider ${connectionProviderId} in workspace ${workspaceId}`,
        McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
      );
    }

    const { accessToken } =
      await this.connectedAccountRefreshTokensService.resolveTokens(
        connectedAccount,
        workspaceId,
      );

    return this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: accessToken,
      workspaceId,
    });
  }
}
