import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getStepConfiguredRetryCount = (step: WorkflowAction): number =>
  Number(step.settings.errorHandlingOptions.retryOnFailure.value) || 0;
