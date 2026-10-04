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

// not pending, so the execution does not pause on it and the model reads why
export const buildSecondWaitRefusalOutput = () => ({
  success: false,
  error:
    'Only one wait can be active at a time. Call a single wait tool and continue once it resolves.',
});
