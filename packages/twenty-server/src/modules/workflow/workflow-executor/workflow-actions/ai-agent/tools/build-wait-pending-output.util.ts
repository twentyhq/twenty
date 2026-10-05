import { type WorkflowStepWait } from 'twenty-shared/workflow';

export type WorkflowAgentWaitPendingOutput = {
  success: true;
  message: string;
  result: { status: 'pending'; wait: WorkflowStepWait };
};

export const buildWaitPendingOutput = ({
  message,
  wait,
}: {
  message: string;
  wait: WorkflowStepWait;
}): WorkflowAgentWaitPendingOutput => ({
  success: true,
  message,
  result: { status: 'pending', wait },
});
