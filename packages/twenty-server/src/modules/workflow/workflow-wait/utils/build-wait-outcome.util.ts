import { isDefined } from 'twenty-shared/utils';
import { type WorkflowStepWait } from 'twenty-shared/workflow';

import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';
import { type WorkflowWaitOutcome } from 'src/modules/workflow/workflow-wait/types/workflow-wait-outcome.type';

export const buildWaitOutcome = ({
  wait,
  event,
}: {
  wait: WorkflowStepWait;
  event?: WorkflowWaitEvent;
}): WorkflowWaitOutcome => {
  if (isDefined(event)) {
    return { type: 'EVENT_RECEIVED', event };
  }

  return wait.type === 'TIME' ? { type: 'TIME_ELAPSED' } : { type: 'EXPIRED' };
};
