import { Injectable } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowLogicFunctionAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/guards/is-workflow-logic-function-action.guard';
import { WorkflowLogicFunctionActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/types/workflow-logic-function-action-input.type';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

@Injectable()
export class LogicFunctionWorkflowAction implements WorkflowAction {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

    if (!isWorkflowLogicFunctionAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a logic function action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowLogicFunctionActionInput;

    try {
      const { workspaceId } = runInfo;

      const { flatLogicFunctionMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatLogicFunctionMaps'],
          },
        );

      const logicFunction = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: workflowActionInput.logicFunctionId,
        flatEntityMaps: flatLogicFunctionMaps,
      });

      if (!logicFunction) {
        throw new WorkflowStepExecutorException(
          `Logic function with id ${workflowActionInput.logicFunctionId} not found`,
          WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
        );
      }

      const result = await this.logicFunctionExecutorService.execute({
        logicFunctionId: workflowActionInput.logicFunctionId,
        workspaceId,
        payload: workflowActionInput.logicFunctionInput,
      });

      if (result.error) {
        return { error: result.error.errorMessage };
      }

      return { result: result.data || {} };
    } catch (error) {
      return { error: error.message };
    }
  }
}
