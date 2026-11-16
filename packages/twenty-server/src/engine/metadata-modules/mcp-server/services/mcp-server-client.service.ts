import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  type CallToolResult,
  CallToolResultSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

const MCP_CLIENT_INFO = { name: 'twenty', version: '1.0.0' };
const LIST_TOOLS_TIMEOUT_MS = 20_000;
const CALL_TOOL_TIMEOUT_MS = 60_000;
const LIST_TOOLS_MAX_PAGES = 10;

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
    const accessToken = await this.resolveAccessToken(target);
    const signal = AbortSignal.timeout(timeoutMs);
    const client = new Client(MCP_CLIENT_INFO);
    const transport = new StreamableHTTPClientTransport(new URL(target.url), {
      fetch: this.buildFetch({ workspaceId: target.workspaceId, timeoutMs }),
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

    return this.connectedAccountRepository.findOne({
      where: isDefined(userWorkspaceId)
        ? buildConnectedAccountUsableByCallerWhere({
            baseWhere,
            userWorkspaceId,
          })
        : { ...baseWhere, scope: 'WORKSPACE' },
      order: { createdAt: 'ASC' },
    });
  }

  private async resolveAccessToken(
    target: McpServerTarget,
  ): Promise<string | null> {
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
