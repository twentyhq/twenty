import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';

export type ResumeWaitingWorkflowStepJobData = {
  workspaceId: string;
  waitId: string;
  // Absent when the wait's time came: a time wait elapsed or an event wait expired
  event?: WorkflowWaitEvent;
  // How many times the resolution was put off because the step was still pausing
  attempt?: number;
  // How many times reading the event's record as the run failed
  recordReadAttempt?: number;
};
