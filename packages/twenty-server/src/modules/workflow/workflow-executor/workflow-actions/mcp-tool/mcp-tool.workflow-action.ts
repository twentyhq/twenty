import { Injectable } from '@nestjs/common';

import { isDefined, isPlainObject, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { McpServerToolCallService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-call.service';
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
import { removeNullToolArguments } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/utils/remove-null-tool-arguments.util';

@Injectable()
export class McpToolWorkflowAction implements WorkflowAction {
  constructor(
    private readonly mcpServerToolCallService: McpServerToolCallService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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

    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );
    const mcpServer = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: mcpServerId,
      flatEntityMaps: flatMcpServerMaps,
    });

    if (!isDefined(mcpServer)) {
      throw new WorkflowStepExecutorException(
        `MCP server with id ${mcpServerId} not found`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    if (!mcpServer.isActive) {
      throw new WorkflowStepExecutorException(
        `MCP server ${mcpServer.label} is inactive`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const tool = mcpServer.tools.find(
      (candidate) => candidate.name === toolName,
    );

    if (!isDefined(tool)) {
      throw new WorkflowStepExecutorException(
        `MCP server ${mcpServer.label} no longer offers the tool ${toolName}`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const { authContext, application } =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    this.workflowExecutionContextService.assertRunApplicationCanTriggerStepTargetOrThrow(
      {
        executionContext: { authContext, application },
        targetApplicationId: mcpServer.applicationId,
        targetLabel: `MCP server "${mcpServer.label}"`,
      },
    );

    const toolArguments = removeNullToolArguments({
      value: resolveInput(toolInput, context),
      schema: tool.inputSchema,
    });

    if (!isPlainObject(toolArguments)) {
      throw new WorkflowStepExecutorException(
        `Tool input of ${toolName} must resolve to an object`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const { output } = await this.mcpServerToolCallService.callTool({
      mcpServer,
      toolName,
      toolArguments,
      userWorkspaceId: getUserFromAuthContext(authContext).userWorkspaceId,
    });

    if (!output.success) {
      return { error: output.error ?? output.message };
    }

    return { result: output.result ?? {} };
  }
}
