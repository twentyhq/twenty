export type EnqueueJobOptions = {
  retryLimit?: number;
  delayMs?: number;
};

export type EnqueueJobInput = EnqueueJobOptions & {
  logicFunctionUniversalIdentifier: string;
  payload?: Record<string, unknown>;
  jobId?: string;
};

export type EnqueueJobResult = {
  enqueued: boolean;
  logicFunctionUniversalIdentifier: string;
  jobId: string;
};

export type EnqueueJobItem = {
  payload?: Record<string, unknown>;
  jobId?: string;
};

export type EnqueueJobsInput = EnqueueJobOptions & {
  logicFunctionUniversalIdentifier: string;
  payloads?: Record<string, unknown>[];
  jobs?: EnqueueJobItem[];
};

export type EnqueueJobsResult = {
  enqueued: boolean;
  logicFunctionUniversalIdentifier: string;
  enqueuedJobsCount: number;
  jobIds: string[];
};

export type JobStatusState =
  | 'COMPLETED'
  | 'FAILED'
  | 'ACTIVE'
  | 'WAITING'
  | 'DELAYED'
  | 'PRIORITIZED'
  | 'WAITING_CHILDREN';

export type JobStatusResult = {
  jobId: string;
  state: JobStatusState;
  attemptsMade: number;
  failedReason?: string | null;
  enqueuedAt: number;
  startedAt?: number | null;
  finishedAt?: number | null;
};
