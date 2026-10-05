import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';

export type WorkflowWaitOutcome =
  | { type: 'TIME_ELAPSED' }
  | { type: 'EVENT_RECEIVED'; event: WorkflowWaitEvent }
  | { type: 'EXPIRED' };
