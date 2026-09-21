import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const stepShouldContinueOnFailure = (step: WorkflowAction): boolean =>
  !isWorkflowIfElseAction(step) &&
  step.settings.errorHandlingOptions.continueOnFailure.value;
