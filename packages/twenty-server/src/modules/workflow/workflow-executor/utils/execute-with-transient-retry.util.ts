import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { isTransientStepExecutionError } from 'src/modules/workflow/workflow-executor/utils/is-transient-step-execution-error.util';

export const executeWithTransientRetry = async ({
  execute,
  maxAttempts,
  onFailedAttempt,
}: {
  execute: () => Promise<WorkflowActionOutput>;
  maxAttempts: number;
  onFailedAttempt: (failedAttempt: { attempt: number }) => Promise<void>;
}): Promise<WorkflowActionOutput> => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await execute();
    } catch (error) {
      if (attempt >= maxAttempts || !isTransientStepExecutionError(error)) {
        throw error;
      }
    }

    try {
      await onFailedAttempt({ attempt });
    } catch {
      // Bookkeeping runs against the database that just failed, so it must
      // never replace the failure that triggered it nor cost the step a retry.
      continue;
    }
  }
};
