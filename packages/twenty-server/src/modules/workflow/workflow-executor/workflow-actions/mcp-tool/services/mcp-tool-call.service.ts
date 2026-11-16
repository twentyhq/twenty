import { Injectable } from '@nestjs/common';

import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { McpServerToolCallService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-call.service';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import { type WorkflowMcpServerToolLookup } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/types/workflow-mcp-server-tool-lookup.type';
import { type WorkflowMcpToolCallResult } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/types/workflow-mcp-tool-call-result.type';
import { removeNullToolArguments } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/utils/remove-null-tool-arguments.util';

@Injectable()
export class McpToolCallService {
  constructor(
    private readonly mcpServerToolCallService: McpServerToolCallService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async findServerTool({
    workspaceId,
    mcpServerId,
    toolName,
  }: {
    workspaceId: string;
    mcpServerId: string;
    toolName: string;
  }): Promise<WorkflowMcpServerToolLookup> {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );
    const mcpServer = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: mcpServerId,
      flatEntityMaps: flatMcpServerMaps,
    });

    if (!isDefined(mcpServer)) {
      return {
        status: 'server_not_found',
        message: `MCP server with id ${mcpServerId} not found`,
      };
    }

    if (!mcpServer.isActive) {
      return {
        status: 'server_inactive',
        message: `MCP server ${mcpServer.label} is inactive`,
      };
    }

    const tool = mcpServer.tools.find(
      (candidate) => candidate.name === toolName,
    );

    if (!isDefined(tool)) {
      return {
        status: 'tool_not_found',
        message: `MCP server ${mcpServer.label} no longer offers the tool ${toolName}`,
      };
    }

    return { status: 'found', mcpServer, tool };
  }

  async callTool({
    mcpServer,
    tool,
    toolArguments,
    userWorkspaceId,
  }: {
    mcpServer: FlatMcpServer;
    tool: McpServerTool;
    toolArguments: unknown;
    userWorkspaceId: string | undefined;
  }): Promise<WorkflowMcpToolCallResult> {
    const filledToolArguments = removeNullToolArguments({
      value: toolArguments,
      schema: tool.inputSchema,
    });

    if (!isPlainObject(filledToolArguments)) {
      return {
        status: 'invalid_arguments',
        message: `Tool input of ${tool.name} must resolve to an object`,
      };
    }

    const { output } = await this.mcpServerToolCallService.callTool({
      mcpServer,
      toolName: tool.name,
      toolArguments: filledToolArguments,
      userWorkspaceId,
    });

    if (!output.success) {
      return { status: 'failed', error: output.error ?? output.message };
    }

    return { status: 'succeeded', result: output.result ?? {} };
  }
}
