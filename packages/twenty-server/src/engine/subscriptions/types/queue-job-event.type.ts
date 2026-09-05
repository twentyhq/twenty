import { type JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';

export type QueueJobEvent = {
  jobId: string;
  state: JobStateEnum;
  attemptsMade: number;
  failedReason?: string;
  enqueuedAt: number;
  startedAt?: number;
  finishedAt?: number;
};
