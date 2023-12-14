import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

export type FetchMessagesJobData = {
  workspaceId: string;
};

export class FetchMessagesJob implements MessageQueueJob<FetchMessagesJobData> {
  async handle(data: FetchMessagesJobData): Promise<void> {
    console.log('fetching messages for workspace', data.workspaceId);
  }
}
