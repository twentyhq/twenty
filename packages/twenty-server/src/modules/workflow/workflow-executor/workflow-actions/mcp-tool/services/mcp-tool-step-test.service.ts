import { Injectable } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type TestMcpToolStepDTO } from 'src/engine/core-modules/workflow/dtos/test-mcp-tool-step.dto';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { isDestructiveMcpServerTool } from 'twenty-shared/ai';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { McpToolCallService } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/services/mcp-tool-call.service';
import { type WorkflowMcpServerToolLookup } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/types/workflow-mcp-server-tool-lookup.type';

const LOOKUP_FAILURES: Record<
  Exclude<WorkflowMcpServerToolLookup['status'], 'found'>,
  {
    code: WorkflowVersionStepExceptionCode;
    userFriendlyMessage: MessageDescriptor;
  }
> = {
  server_not_found: {
    code: WorkflowVersionStepExceptionCode.NOT_FOUND,
    userFriendlyMessage: msg`This MCP server is not available to this workflow.`,
  },
  server_inactive: {
    code: WorkflowVersionStepExceptionCode.INVALID_REQUEST,
    userFriendlyMessage: msg`This MCP server is inactive. Activate it before testing its tools.`,
  },
  tool_not_found: {
    code: WorkflowVersionStepExceptionCode.NOT_FOUND,
    userFriendlyMessage: msg`This tool is no longer offered by its MCP server.`,
  },
};

@Injectable()
export class McpToolStepTestService {
  constructor(private readonly mcpToolCallService: McpToolCallService) {}

  async testTool({
    mcpServerId,
    toolName,
    toolArguments,
    isDestructiveToolConfirmed = false,
    workspace: { id: workspaceId, workspaceCustomApplicationId },
    workflowApplication,
    userWorkspaceId,
  }: {
    mcpServerId: string;
    toolName: string;
    toolArguments: Record<string, unknown> | undefined;
    isDestructiveToolConfirmed: boolean | undefined;
    workspace: Pick<WorkspaceEntity, 'id' | 'workspaceCustomApplicationId'>;
    workflowApplication: FlatApplication;
    userWorkspaceId: string;
  }): Promise<TestMcpToolStepDTO> {
    const lookup = await this.mcpToolCallService.findServerTool({
      workspaceId,
      mcpServerId,
      toolName,
    });

    if (lookup.status !== 'found') {
      const { code, userFriendlyMessage } = LOOKUP_FAILURES[lookup.status];

      throw new WorkflowVersionStepException(lookup.message, code, {
        userFriendlyMessage,
      });
    }

    if (
      !canCallerReachApplication({
        callingApplication: workflowApplication,
        applicationId: lookup.mcpServer.applicationId,
        operation: 'trigger',
        workspaceCustomApplicationId,
      })
    ) {
      throw new WorkflowVersionStepException(
        `MCP server "${lookup.mcpServer.label}" belongs to another application than "${workflowApplication.name}", so this workflow cannot use it`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`This MCP server belongs to another application, so this workflow cannot use it.`,
        },
      );
    }

    if (
      isDestructiveMcpServerTool(lookup.tool) &&
      !isDestructiveToolConfirmed
    ) {
      throw new WorkflowVersionStepException(
        `Tool ${toolName} may change data and the test was not confirmed`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`This tool may change data. Confirm the test before running it.`,
        },
      );
    }

    const callResult = await this.mcpToolCallService.callTool({
      mcpServer: lookup.mcpServer,
      tool: lookup.tool,
      toolArguments: toolArguments ?? {},
      userWorkspaceId,
    });

    switch (callResult.status) {
      case 'invalid_arguments':
        throw new WorkflowVersionStepException(
          callResult.message,
          WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        );
      case 'failed':
        return { success: false, error: callResult.error };
      case 'succeeded':
        return { success: true, result: callResult.result };
    }
  }
}
