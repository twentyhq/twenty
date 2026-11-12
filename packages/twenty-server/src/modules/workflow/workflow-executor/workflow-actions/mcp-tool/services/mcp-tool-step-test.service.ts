import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type TestMcpToolStepDTO } from 'src/engine/core-modules/workflow/dtos/test-mcp-tool-step.dto';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { McpServerToolCallService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-call.service';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { removeNullToolArguments } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/utils/remove-null-tool-arguments.util';

@Injectable()
export class McpToolStepTestService {
  constructor(
    private readonly mcpServerToolCallService: McpServerToolCallService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async testTool({
    mcpServerId,
    toolName,
    toolArguments,
    workspace: { id: workspaceId, workspaceCustomApplicationId },
    callingApplication,
    userWorkspaceId,
  }: {
    mcpServerId: string;
    toolName: string;
    toolArguments: Record<string, unknown> | undefined;
    workspace: Pick<WorkspaceEntity, 'id' | 'workspaceCustomApplicationId'>;
    callingApplication: FlatApplication | undefined;
    userWorkspaceId: string;
  }): Promise<TestMcpToolStepDTO> {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );
    const mcpServer = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: mcpServerId,
      flatEntityMaps: flatMcpServerMaps,
    });

    if (
      !isDefined(mcpServer) ||
      !canCallerReachApplication({
        callingApplication,
        applicationId: mcpServer.applicationId,
        operation: 'trigger',
        workspaceCustomApplicationId,
      })
    ) {
      throw new WorkflowVersionStepException(
        `MCP server with id ${mcpServerId} not found`,
        WorkflowVersionStepExceptionCode.NOT_FOUND,
        {
          userFriendlyMessage: msg`This MCP server is not available to this workflow.`,
        },
      );
    }

    if (!mcpServer.isActive) {
      throw new WorkflowVersionStepException(
        `MCP server ${mcpServer.label} is inactive`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`This MCP server is inactive. Activate it before testing its tools.`,
        },
      );
    }

    const tool = mcpServer.tools.find(
      (candidate) => candidate.name === toolName,
    );

    if (!isDefined(tool)) {
      throw new WorkflowVersionStepException(
        `MCP server ${mcpServer.label} no longer offers the tool ${toolName}`,
        WorkflowVersionStepExceptionCode.NOT_FOUND,
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
