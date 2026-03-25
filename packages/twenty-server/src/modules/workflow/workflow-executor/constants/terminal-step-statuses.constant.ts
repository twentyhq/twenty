import { StepStatus } from 'twenty-shared/workflow';

export const TERMINAL_STEP_STATUSES = [
  StepStatus.SUCCESS,
  StepStatus.STOPPED,
  StepStatus.SKIPPED,
  StepStatus.FAILED_SAFELY,
];
