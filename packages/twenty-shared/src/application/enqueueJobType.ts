export type EnqueueJobOptions = {
  retryLimit?: number;
  delayMs?: number;
};

export type EnqueueJobsLimiter = {
  max: number;
  durationMs: number;
};

/** @deprecated Use `EnqueueJobsInput` instead. */
export type EnqueueJobInput = EnqueueJobOptions & {
  logicFunctionUniversalIdentifier: string;
  payload?: Record<string, unknown>;
  jobId?: string;
};

/** @deprecated Use `EnqueueJobsResult` instead. */
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
  limiter?: EnqueueJobsLimiter;
  /** @deprecated Use `jobs` instead. */
  payloads?: Record<string, unknown>[];
  jobs?: EnqueueJobItem[];
};

export type EnqueuedJob = {
  jobId: string;
  sizeBytes: number;
  scheduledAt: number;
};

export type EnqueueJobsResult = {
  enqueued: boolean;
  logicFunctionUniversalIdentifier: string;
  enqueuedJobsCount: number;
  /** @deprecated Use `jobs` instead. */
  jobIds: string[];
  jobs: EnqueuedJob[];
  availableBytes?: number | null;
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
  scheduledAt: number;
  startedAt?: number | null;
  finishedAt?: number | null;
};
