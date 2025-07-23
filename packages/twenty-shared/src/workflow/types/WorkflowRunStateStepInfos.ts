export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  STOPPED = 'STOPPED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export type WorkflowRunStepInfo = {
  result?: object;
  error?: string;
  status: StepStatus;
};

export type WorkflowRunStepInfos = Record<string, WorkflowRunStepInfo>;
