import { Injectable } from '@nestjs/common';

import { McpError } from '@modelcontextprotocol/sdk/types.js';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { fromCallToolResultToToolOutput } from 'src/engine/metadata-modules/mcp-server/utils/from-call-tool-result-to-tool-output.util';
import { isMcpUnknownToolError } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-error.util';
import { isMcpUnknownToolMessage } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-message.util';

type McpServerToolCall = {
  mcpServer: Pick<
    FlatMcpServer,
    'id' | 'workspaceId' | 'url' | 'connectionProviderId' | 'label'
  >;
  toolName: string;
  toolDisplayName?: string;
  toolArguments: Record<string, unknown>;
  userWorkspaceId: string | undefined;
};

type McpServerToolCallOutcome = {
  output: ToolOutput;
  isToolUnknownToServer: boolean;
};

@Injectable()
export class McpServerToolCallService {
  constructor(
    private readonly mcpServerClientService: McpServerClientService,
    private readonly mcpServerToolSyncService: McpServerToolSyncService,
  ) {}

  async callTool(
    toolCall: McpServerToolCall,
  ): Promise<McpServerToolCallOutcome> {
    const outcome = await this.callRemoteTool(toolCall);

    if (outcome.isToolUnknownToServer) {
      await this.mcpServerToolSyncService.syncTools({
        ...toolCall.mcpServer,
        userWorkspaceId: toolCall.userWorkspaceId,
      });
    }

    return outcome;
  }

  private async callRemoteTool({
    mcpServer,
    toolName,
    toolDisplayName = toolName,
    toolArguments,
    userWorkspaceId,
  }: McpServerToolCall): Promise<McpServerToolCallOutcome> {
    try {
      const output = fromCallToolResultToToolOutput({
        toolName: toolDisplayName,
        result: await this.mcpServerClientService.callTool({
          target: { ...mcpServer, userWorkspaceId },
          toolName,
          toolArguments,
        }),
      });

      return {
        output,
        isToolUnknownToServer:
          !output.success && isMcpUnknownToolMessage(output.error ?? ''),
      };
    } catch (error) {
      if (error instanceof McpError) {
        return {
          output: {
            success: false,
            message: `MCP tool ${toolDisplayName} failed`,
            error: error.message,
          },
          isToolUnknownToServer: isMcpUnknownToolError(error),
        };
      }

      if (
        error instanceof McpServerException &&
        error.code === McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED
      ) {
        return {
          output: {
            success: false,
            message: `MCP tool ${toolDisplayName} failed`,
            error: `Connect an account for the ${mcpServer.label} MCP server before using its tools.`,
          },
          isToolUnknownToServer: false,
        };
      }

      throw error;
    }
  }
}
