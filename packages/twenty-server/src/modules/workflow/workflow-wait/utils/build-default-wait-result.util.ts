import { type WorkflowWaitOutcome } from 'src/modules/workflow/workflow-wait/types/workflow-wait-outcome.type';

export const buildDefaultWaitResult = (
  outcome: WorkflowWaitOutcome,
): object => {
  switch (outcome.type) {
    case 'TIME_ELAPSED':
      return { success: true };
    case 'EVENT_RECEIVED':
      return { hasTimedOut: false, ...outcome.event };
    case 'EXPIRED':
      return { hasTimedOut: true };
  }
};
