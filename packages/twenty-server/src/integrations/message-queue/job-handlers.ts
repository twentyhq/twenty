import {
  MessageQueueJob,
  MessageQueueJobData,
} from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { FetchMessagesJob } from 'src/workspace/messaging/jobs/fetch-messages.job';

export const jobHandlers: Record<
  string,
  MessageQueueJob<MessageQueueJobData>
> = {
  FetchMessagesJob: new FetchMessagesJob(),
};
