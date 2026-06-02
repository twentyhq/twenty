import { isNonEmptyString } from '@sniptt/guards';

import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const extractCodeStepLogicFunctionIdsFromWorkflowSteps = (
  steps: WorkflowAction[],
): string[] =>
  steps.filter(isWorkflowCodeAction).map((step) => {
    const logicFunctionId = step.settings.input.logicFunctionId;

    if (!isNonEmptyString(logicFunctionId)) {
      throw new WorkflowVersionStepException(
        `CODE step '${step.id}' has no logic function id`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    return logicFunctionId;
  });
