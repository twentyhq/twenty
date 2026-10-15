import { Injectable } from '@nestjs/common';

import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { ApplicationReachService } from 'src/engine/core-modules/authorization/application-reach/services/application-reach.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { getUserFromAuthContext } from 'src/modules/workflow/workflow-executor/utils/get-user-from-auth-context.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowLogicFunctionAction } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/guards/is-workflow-logic-function-action.guard';
import { WorkflowLogicFunctionActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/logic-function/types/workflow-logic-function-action-input.type';

@Injectable()
export class LogicFunctionWorkflowAction implements WorkflowAction {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly applicationReachService: ApplicationReachService,
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

    const { workspaceId } = runInfo;

    const result =
      await this.workflowExecutionContextService.runInExecutionContext(
        runInfo,
        async ({ authContext }) => {
          const flatLogicFunctionMaps =
            await this.applicationReachService.getReachableFlatEntityMaps({
              workspaceId,
              metadataName: 'logicFunction',
              access: 'trigger',
            });

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

          if (!isDefined(logicFunction.workflowActionTriggerSettings)) {
            throw new WorkflowStepExecutorException(
              `Logic function ${logicFunction.name} is not exposed as a workflow action`,
              WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
            );
          }

          return this.logicFunctionExecutorService.execute({
            logicFunctionId: workflowActionInput.logicFunctionId,
            workspaceId,
            payload: workflowActionInput.logicFunctionInput,
            ...getUserFromAuthContext(authContext),
          });
        },
      );

    if (result.error) {
      return { error: result.error.errorMessage };
    }

    return { result: result.data || {} };
  }
}
