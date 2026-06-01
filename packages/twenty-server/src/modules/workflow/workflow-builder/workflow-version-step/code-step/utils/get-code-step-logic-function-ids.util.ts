import { isNonEmptyString } from '@sniptt/guards';

import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getCodeStepLogicFunctionIds = (
  steps: WorkflowAction[],
): string[] =>
  steps
    .filter(isWorkflowCodeAction)
    .map((step) => step.settings.input.logicFunctionId)
    .filter(isNonEmptyString);
