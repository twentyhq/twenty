import { type WorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/types/workflow-wait-event.type';

export type ResumeWaitingWorkflowStepJobData = {
  workspaceId: string;
  waitId: string;
  // Absent when the wait's time came: a time wait elapsed or an event wait expired
  event?: WorkflowWaitEvent;
};
