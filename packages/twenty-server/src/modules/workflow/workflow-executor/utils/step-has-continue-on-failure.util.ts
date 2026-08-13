import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Per-step errorHandlingOptions.continueOnFailure is set on every step
// (see workflow-version-step-operations.workspace-service.ts) but was never
// read by the executor - only the iterator-specific
// shouldContinueOnIterationFailure flag actually rescued a failed step. This
// reads the general, per-step flag so any step type can opt out of aborting
// the whole run on failure, not just steps inside an iterator loop.
export const stepHasContinueOnFailure = (step: WorkflowAction): boolean => {
  return step.settings.errorHandlingOptions?.continueOnFailure?.value === true;
};
