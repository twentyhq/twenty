import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const stepShouldContinueOnFailure = (step: WorkflowAction): boolean =>
  step.settings.errorHandlingOptions?.continueOnFailure?.value === true;
