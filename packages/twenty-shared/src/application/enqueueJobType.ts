export type EnqueueJobOptions = {
  retryLimit?: number;
  delayMs?: number;
};

export type EnqueueJobInput = EnqueueJobOptions & {
  logicFunctionUniversalIdentifier: string;
  payload?: Record<string, unknown>;
};

export type EnqueueJobResult = {
  enqueued: boolean;
  logicFunctionUniversalIdentifier: string;
};

export type EnqueueJobsInput = EnqueueJobOptions & {
  logicFunctionUniversalIdentifier: string;
  payloads: Record<string, unknown>[];
};

export type EnqueueJobsResult = {
  enqueued: boolean;
  logicFunctionUniversalIdentifier: string;
  enqueuedJobsCount: number;
};
