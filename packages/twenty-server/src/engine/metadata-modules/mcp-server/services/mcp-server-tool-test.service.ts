import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatMcpServerByIdOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/find-flat-mcp-server-by-id-or-throw.util';
import { type McpServerToolTestResultDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server-tool-test-result.dto';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerToolCallService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-call.service';
import { removeNullToolArguments } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/utils/remove-null-tool-arguments.util';

@Injectable()
export class McpServerToolTestService {
  constructor(
    private readonly mcpServerToolCallService: McpServerToolCallService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async testTool({
    mcpServerId,
    toolName,
    toolArguments,
    workspaceId,
    userWorkspaceId,
  }: {
    mcpServerId: string;
    toolName: string;
    toolArguments: Record<string, unknown> | undefined;
    workspaceId: string;
    userWorkspaceId: string | undefined;
  }): Promise<McpServerToolTestResultDTO> {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );
    const mcpServer = findFlatMcpServerByIdOrThrow({
      flatMcpServerMaps,
      mcpServerId,
    });

    if (!mcpServer.isActive) {
      throw new McpServerException(
        `MCP server ${mcpServer.label} is inactive`,
        McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
        {
          userFriendlyMessage: msg`This MCP server is inactive. Activate it before testing its tools.`,
        },
      );
    }

    const tool = mcpServer.tools.find(
      (candidate) => candidate.name === toolName,
    );

    if (!isDefined(tool)) {
      throw new McpServerException(
        `MCP server ${mcpServer.label} no longer offers the tool ${toolName}`,
        McpServerExceptionCode.INVALID_MCP_SERVER_INPUT,
        {
          userFriendlyMessage: msg`This tool is no longer offered by its MCP server.`,
        },
      );
    }

    const filledToolArguments = removeNullToolArguments({
      value: toolArguments ?? {},
      schema: tool.inputSchema,
    });

    const { output } = await this.mcpServerToolCallService.callTool({
      mcpServer,
      toolName,
      toolArguments: isPlainObject(filledToolArguments)
        ? filledToolArguments
        : {},
      userWorkspaceId,
    });

    if (!output.success) {
      return { success: false, error: output.error ?? output.message };
    }

    return { success: true, result: output.result ?? {} };
  }
}
