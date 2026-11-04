import { Injectable } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { fromCallToolResultToToolOutput } from 'src/engine/metadata-modules/mcp-server/utils/from-call-tool-result-to-tool-output.util';
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
import { type WorkflowMcpToolActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/mcp-tool/types/workflow-mcp-tool-action-input.type';

@Injectable()
export class McpToolWorkflowAction implements WorkflowAction {
  constructor(
    private readonly mcpServerClientService: McpServerClientService,
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

    const { mcpServerId, toolName, toolInput } = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowMcpToolActionInput;
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
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    if (!mcpServer.isActive) {
      return { error: `MCP server ${mcpServer.label} is inactive` };
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

    const result = await this.mcpServerClientService.callTool({
      target: { ...mcpServer, ...getUserFromAuthContext(authContext) },
      toolName,
      toolArguments: toolInput ?? {},
    });
    const output = fromCallToolResultToToolOutput({ toolName, result });

    if (!output.success) {
      return { error: output.error ?? output.message };
    }

    return { result: output.result ?? {} };
  }
}
