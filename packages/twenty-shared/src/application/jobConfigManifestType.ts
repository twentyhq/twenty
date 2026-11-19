export type JobConfigLimiter = {
  max: number;
  durationMs: number;
};

// No universalIdentifier: the key identifies a job config within its application
export type JobConfigManifest = {
  key: string;
  limiter: JobConfigLimiter;
};
