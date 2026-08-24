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

export type EnqueueJobsInput = {
  jobs: EnqueueJobInput[];
};

export type EnqueueJobsResult = {
  jobs: EnqueueJobResult[];
};
