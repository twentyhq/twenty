import { isNonEmptyString } from '@sniptt/guards';

import { isWorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/code/guards/is-workflow-code-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Collects the logic function ids backing the CODE steps of a workflow version.
// Drafts can carry a CODE step before its logic function is wired up, so empty
// ids are filtered out.
export const getCodeStepLogicFunctionIds = (
  steps: WorkflowAction[],
): string[] =>
  steps
    .filter(isWorkflowCodeAction)
    .map((step) => step.settings.input.logicFunctionId)
    .filter(isNonEmptyString);
