export type EnqueueJobOptions = {
  retryLimit?: number;
  priority?: number;
  delayMs?: number;
};

export type EnqueueJobInput = EnqueueJobOptions & {
  logicFunctionUniversalIdentifier: string;
  payload?: object;
};

export type EnqueueJobResult = {
  enqueued: boolean;
  logicFunctionUniversalIdentifier: string;
};
