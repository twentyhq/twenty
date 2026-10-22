import { Injectable } from '@nestjs/common';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { type McpServerConnection } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-connection.type';
import { type McpToolCallResult } from 'src/engine/metadata-modules/mcp-server/types/mcp-tool-call-result.type';
import { type RemoteMcpTool } from 'src/engine/metadata-modules/mcp-server/utils/sanitize-mcp-server-tools.util';

const MCP_LIST_TOOLS_TIMEOUT_MS = 10_000;
const MCP_CALL_TOOL_TIMEOUT_MS = 30_000;
const MCP_ERROR_MESSAGE_MAX_LENGTH = 500;

type McpServerRequestOptions = {
  timeoutMs: number;
  userId?: string;
};

@Injectable()
export class McpServerClientService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly secretEncryptionService: SecretEncryptionService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async listTools(mcpServer: McpServerConnection): Promise<RemoteMcpTool[]> {
    return this.withClient(
      mcpServer,
      { timeoutMs: MCP_LIST_TOOLS_TIMEOUT_MS },
      async (client) => {
        const { tools } = await client.listTools(undefined, {
          timeout: MCP_LIST_TOOLS_TIMEOUT_MS,
        });

        return tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: tool.annotations,
        }));
      },
    );
  }

  async callTool({
    mcpServer,
    toolName,
    args,
    userId,
  }: {
    mcpServer: McpServerConnection;
    toolName: string;
    args: Record<string, unknown>;
    userId?: string;
  }): Promise<McpToolCallResult> {
    return this.withClient(
      mcpServer,
      { timeoutMs: MCP_CALL_TOOL_TIMEOUT_MS, userId },
      async (client) => {
        const { content, structuredContent, isError } =
          CallToolResultSchema.parse(
            await client.callTool(
              { name: toolName, arguments: args },
              CallToolResultSchema,
              { timeout: MCP_CALL_TOOL_TIMEOUT_MS },
            ),
          );

        return { content, structuredContent, isError: isError === true };
      },
    );
  }

  // Stateless on purpose: a connection per call keeps no session to leak or expire
  private async withClient<TResult>(
    mcpServer: McpServerConnection,
    { timeoutMs, userId }: McpServerRequestOptions,
    callback: (client: Client) => Promise<TResult>,
  ): Promise<TResult> {
    const authorizationHeaderValue =
      this.decryptAuthorizationHeaderValue(mcpServer);

    const transport = new StreamableHTTPClientTransport(
      new URL(mcpServer.url),
      {
        fetch: this.secureHttpClientService.createSsrfSafeFetch(
          { timeout: timeoutMs },
          { workspaceId: mcpServer.workspaceId, source: 'mcp-server', userId },
        ),
        ...(isDefined(authorizationHeaderValue) && {
          requestInit: {
            headers: { Authorization: authorizationHeaderValue },
          },
        }),
      },
    );

    const client = new Client({
      name: 'twenty',
      version: this.twentyConfigService.get('APP_VERSION') ?? 'dev',
    });

    try {
      await client.connect(transport, { timeout: timeoutMs });

      return await callback(client);
    } catch (error) {
      throw new McpServerException(
        this.toShortErrorMessage(error, authorizationHeaderValue),
        McpServerExceptionCode.MCP_SERVER_REQUEST_FAILED,
      );
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  private decryptAuthorizationHeaderValue(
    mcpServer: McpServerConnection,
  ): string | null {
    if (!isDefined(mcpServer.authorizationHeaderValue)) {
      return null;
    }

    return this.secretEncryptionService.decryptVersionedOrThrow(
      mcpServer.authorizationHeaderValue,
      { workspaceId: mcpServer.workspaceId },
    );
  }

  private toShortErrorMessage(
    error: unknown,
    authorizationHeaderValue: string | null,
  ): string {
    const rawMessage =
      error instanceof Error && isNonEmptyString(error.message)
        ? error.message
        : 'Unknown error';

    const redactedMessage = isNonEmptyString(authorizationHeaderValue)
      ? rawMessage.split(authorizationHeaderValue).join('[redacted]')
      : rawMessage;

    return redactedMessage.length > MCP_ERROR_MESSAGE_MAX_LENGTH
      ? `${redactedMessage.slice(0, MCP_ERROR_MESSAGE_MAX_LENGTH)}…`
      : redactedMessage;
  }
}
