import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';
import { isWorkflowMcpToolAction } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/guards/is-workflow-mcp-tool-action.guard';
import { McpToolCallService } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/services/mcp-tool-call.service';

@Injectable()
export class McpToolWorkflowAction implements WorkflowAction {
  constructor(
    private readonly mcpToolCallService: McpToolCallService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (!isWorkflowMcpToolAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an MCP tool action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { mcpServerId, toolName, toolInput } = step.settings.input;
    const { workspaceId } = runInfo;

    const lookup = await this.mcpToolCallService.findServerTool({
      workspaceId,
      mcpServerId,
      toolName,
    });

    if (lookup.status !== 'found') {
      throw new WorkflowStepExecutorException(
        lookup.message,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const { mcpServer, tool } = lookup;

    const { authContext, application } =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    this.workflowExecutionContextService.assertRunApplicationCanTriggerStepTargetOrThrow(
      {
        executionContext: { authContext, application },
        targetApplicationId: mcpServer.applicationId,
        targetLabel: `MCP server "${mcpServer.label}"`,
      },
    );

    const callResult = await this.mcpToolCallService.callTool({
      mcpServer,
      tool,
      toolArguments: resolveInput(toolInput, context),
      userWorkspaceId: getUserFromAuthContext(authContext).userWorkspaceId,
    });

    switch (callResult.status) {
      case 'invalid_arguments':
        throw new WorkflowStepExecutorException(
          callResult.message,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
        );
      case 'failed':
        return { error: callResult.error };
      case 'succeeded':
        return { result: callResult.result };
    }
  }
}
