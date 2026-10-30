import {
  type SetuAiTaskStatus,
  type SetuAiTaskStepStatus,
} from 'twenty-shared/ai';

// The task's status always follows from its steps, so two finished accounts
// and one waiting account read as waiting for input, never as completed.
export const deriveSetuAiTaskStatus = ({
  stepStatuses,
  isCancelRequested,
}: {
  stepStatuses: SetuAiTaskStepStatus[];
  isCancelRequested: boolean;
}): SetuAiTaskStatus => {
  const count = (status: SetuAiTaskStepStatus) =>
    stepStatuses.filter((stepStatus) => stepStatus === status).length;

  if (isCancelRequested) {
    return count('running') > 0 ? 'cancel_requested' : 'cancelled';
  }

  if (count('running') > 0) {
    return 'running';
  }

  if (count('queued') > 0) {
    return count('queued') === stepStatuses.length ? 'queued' : 'running';
  }

  if (count('waiting_input') > 0) {
    return 'waiting_input';
  }

  if (count('completed') === stepStatuses.length) {
    return 'completed';
  }

  if (count('completed') > 0) {
    return 'partially_completed';
  }

  return count('cancelled') === stepStatuses.length ? 'cancelled' : 'failed';
};
