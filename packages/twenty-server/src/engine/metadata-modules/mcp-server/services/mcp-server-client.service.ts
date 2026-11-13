import { Injectable, Logger } from '@nestjs/common';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  StreamableHTTPClientTransport,
  StreamableHTTPError,
} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  type CallToolResult,
  CallToolResultSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { isDefined } from 'twenty-shared/utils';

import { probeProtectedResource } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/probe-protected-resource.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerConnectedAccountService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-connected-account.service';
import { type McpServerTarget } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-target.type';

const MCP_CLIENT_INFO = { name: 'twenty', version: '1.0.0' };
const LIST_TOOLS_TIMEOUT_MS = 20_000;
const CALL_TOOL_TIMEOUT_MS = 60_000;
const LIST_TOOLS_MAX_PAGES = 10;
const SIGN_IN_PROBE_TIMEOUT_MS = 5_000;

const isUnauthorizedError = (error: unknown): boolean =>
  error instanceof StreamableHTTPError && error.code === 401;

// Lands in toolsSyncError, which settings show as is.
const buildSignInRequiredException = (): McpServerException =>
  new McpServerException(
    'This MCP server requires signing in. Connect an account to use it.',
    McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
  );

@Injectable()
export class McpServerClientService {
  private readonly logger = new Logger(McpServerClientService.name);

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly mcpServerConnectedAccountService: McpServerConnectedAccountService,
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
    const connectedAccount =
      await this.mcpServerConnectedAccountService.findConnectedAccountOrThrowIfSignInRequired(
        target,
      );
    const accessToken = isDefined(connectedAccount)
      ? await this.mcpServerConnectedAccountService.resolveAccessTokenOrMarkAuthFailed(
          {
            connectedAccount,
            workspaceId,
          },
        )
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
    const refreshedAccessToken =
      await this.mcpServerConnectedAccountService.resolveAccessTokenOrMarkAuthFailed(
        {
          connectedAccount,
          workspaceId,
          shouldForceRefresh: true,
        },
      );

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
      await this.mcpServerConnectedAccountService.markConnectedAccountAuthFailed(
        {
          connectedAccountId: connectedAccount.id,
          workspaceId,
          reason: 'The MCP server rejected the access token',
        },
      );

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

  // A server that cannot be reached cannot ask for sign-in; the tool sync records why it is unreachable.
  async requiresSignIn({
    url,
    workspaceId,
  }: Pick<McpServerTarget, 'url' | 'workspaceId'>): Promise<boolean> {
    try {
      const { isSignInRequired } = await probeProtectedResource({
        resourceUrl: url,
        fetchFunction: this.buildFetch({
          workspaceId,
          timeoutMs: SIGN_IN_PROBE_TIMEOUT_MS,
        }),
      });

      return isSignInRequired;
    } catch (error) {
      this.logger.warn(
        `Sign-in probe of MCP server ${url} in workspace ${workspaceId} failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
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
      isDefined(
        await this.mcpServerConnectedAccountService.findUsableConnectedAccount(
          target,
        ),
      )
    );
  }
}
